import { prisma } from '../lib/db.js';

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  fork: boolean;
  language: string | null;
  topics: string[];
  pushed_at: string;
}

interface SyncResult {
  synced: number;
  updated: number;
  skipped: number;
}

export class GitHubSyncService {
  private token: string;
  private baseUrl = 'https://api.github.com';

  constructor(token: string) {
    this.token = token;
  }

  async syncRepositories(username: string): Promise<SyncResult> {
    const result: SyncResult = { synced: 0, updated: 0, skipped: 0 };

    try {
      const repos = await this.fetchAllRepositories(username);
      const nonForkRepos = repos.filter(repo => !repo.fork);

      for (const repo of nonForkRepos) {
        const existing = await prisma.project.findUnique({
          where: {
            provider_repoId: {
              provider: 'github',
              repoId: String(repo.id)
            }
          }
        });

        const techStack = this.extractTechStack(repo);
        const projectData = {
          provider: 'github',
          repoId: String(repo.id),
          name: repo.name,
          description: repo.description || '',
          url: repo.html_url,
          stars: repo.stargazers_count,
          techStack,
          lastCommitAt: new Date(repo.pushed_at),
          syncedAt: new Date()
        };

        if (existing) {
          await prisma.project.update({
            where: { id: existing.id },
            data: {
              ...projectData,
              // Preserve manual settings
              featured: existing.featured,
              showOnPortfolio: existing.showOnPortfolio
            }
          });
          result.updated++;
        } else {
          await prisma.project.create({
            data: {
              ...projectData,
              featured: false,
              showOnPortfolio: false
            }
          });
          result.synced++;
        }
      }

      return result;
    } catch (error) {
      console.error('GitHub sync failed:', error);
      throw error;
    }
  }

  private async fetchAllRepositories(username: string): Promise<GitHubRepo[]> {
    const repos: GitHubRepo[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const response = await fetch(
        `${this.baseUrl}/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data: GitHubRepo[] = await response.json();
      
      if (data.length === 0) break;
      
      repos.push(...data);
      
      if (data.length < perPage) break;
      
      page++;
    }

    return repos;
  }

  private extractTechStack(repo: GitHubRepo): string[] {
    const stack: string[] = [];
    
    if (repo.language) {
      stack.push(repo.language);
    }
    
    if (repo.topics && repo.topics.length > 0) {
      stack.push(...repo.topics);
    }
    
    return [...new Set(stack)];
  }
}

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

  /**
   * Fetch README content for a specific repository
   */
  async fetchReadme(owner: string, repo: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${owner}/${repo}/readme`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/vnd.github.v3.raw' // Get raw markdown content
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const content = await response.text();
      return content;
    } catch (error) {
      console.error(`Failed to fetch README for ${owner}/${repo}:`, error);
      return null;
    }
  }

  /**
   * Fetch README and update project description in database
   */
  async fetchAndUpdateReadme(projectId: string): Promise<{ success: boolean; readme: string | null }> {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error('Project not found');

    // Extract owner/repo from GitHub URL
    const match = project.url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) throw new Error('Could not extract owner/repo from URL');

    const [, owner, repo] = match;
    const readme = await this.fetchReadme(owner, repo);

    if (readme) {
      // Clean up README: take first meaningful section as description
      const cleanDescription = this.extractDescriptionFromReadme(readme);
      
      await prisma.project.update({
        where: { id: projectId },
        data: { description: cleanDescription }
      });

      return { success: true, readme: cleanDescription };
    }

    return { success: false, readme: null };
  }

  /**
   * Fetch README for all visible projects
   */
  async fetchAllReadmes(username: string): Promise<{ updated: number; failed: number }> {
    const projects = await prisma.project.findMany({
      where: { provider: 'github' }
    });

    let updated = 0;
    let failed = 0;

    for (const project of projects) {
      try {
        const match = project.url.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) { failed++; continue; }

        const [, owner, repo] = match;
        const readme = await this.fetchReadme(owner, repo);

        if (readme) {
          const cleanDescription = this.extractDescriptionFromReadme(readme);
          await prisma.project.update({
            where: { id: project.id },
            data: { description: cleanDescription }
          });
          updated++;
        } else {
          failed++;
        }

        // Small delay to avoid GitHub rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch {
        failed++;
      }
    }

    return { updated, failed };
  }

  /**
   * Extract a clean description from README markdown content.
   * Takes content after the first heading, up to a reasonable length.
   */
  private extractDescriptionFromReadme(readme: string): string {
    // Strip HTML but keep text content
    let cleaned = readme
      // Remove HTML comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove <img> tags entirely (badges, screenshots)
      .replace(/<img[^>]*\/?>/gi, '')
      // Remove <br> tags
      .replace(/<br\s*\/?>/gi, '\n')
      // Convert block elements to newlines, keeping text
      .replace(/<\/?(p|div|h[1-6]|section|article|header|footer|nav|ul|ol|li|blockquote|pre|table|tr|td|th|thead|tbody)[^>]*>/gi, '\n')
      // Remove <strong>/<em>/<b>/<i>/<code>/<a> but keep text
      .replace(/<(strong|em|b|i|code|span|small|sub|sup)[^>]*>([\s\S]*?)<\/\1>/gi, '$2')
      // Keep link text from <a> tags
      .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '$1')
      // Remove any remaining HTML tags
      .replace(/<[^>]+>/g, '')
      // Clean up excess whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const lines = cleaned.split('\n');
    const contentLines: string[] = [];
    let foundFirstHeading = false;
    let foundContent = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines, badges, images at the top
      if (!foundContent && (
        trimmed === '' ||
        trimmed.startsWith('![') ||
        trimmed.startsWith('[![')
      )) {
        continue;
      }

      // Skip the first heading (title)
      if (!foundFirstHeading && trimmed.startsWith('#')) {
        foundFirstHeading = true;
        continue;
      }

      // Skip table of contents (lines that are only markdown links to anchors)
      if (trimmed.match(/^[-*•]\s*\[.*?\]\(#.*?\)$/)) {
        continue;
      }
      // Skip horizontal rules
      if (trimmed.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
        continue;
      }

      // After first heading, collect content
      if (foundFirstHeading || !trimmed.startsWith('#')) {
        // Stop at the next heading (## Installation, ## Usage, etc.)  
        // but skip "## About" or "## Overview" as they lead into description
        if (foundContent && trimmed.startsWith('#')) {
          const headingText = trimmed.replace(/^#+\s*/, '').toLowerCase();
          if (['about', 'overview', 'description', 'tentang'].includes(headingText)) {
            continue; // Skip this heading, keep reading for description
          }
          break;
        }

        if (trimmed !== '') {
          foundContent = true;
          // Remove markdown formatting
          const cleanLine = trimmed
            .replace(/\*\*([^*]+)\*\*/g, '$1')  // bold
            .replace(/\*([^*]+)\*/g, '$1')       // italic
            .replace(/`([^`]+)`/g, '$1')         // inline code
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
            .replace(/^[-*+]\s+/, '• ')          // list items
            .replace(/^>\s+/, '');                // blockquotes
          
          contentLines.push(cleanLine);
        }
      }

      // Limit to ~500 chars
      if (contentLines.join(' ').length > 500) break;
    }

    const result = contentLines.join('\n').trim();
    
    // If we got nothing useful, return first 500 chars stripped of all formatting
    if (!result) {
      return readme
        .replace(/<[^>]+>/g, '')   // strip HTML
        .replace(/^#.*$/gm, '')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_`~]/g, '')
        .replace(/\n{2,}/g, '\n')
        .trim()
        .substring(0, 500);
    }

    return result.substring(0, 500);
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

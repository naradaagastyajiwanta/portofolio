// Use internal Docker network URL for server-side fetches, public URL for client-side
const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  url: string;
  stars: number;
  techStack: string[];
  featured: boolean;
  lastCommitAt: string | null;
  provider: string;
}

export async function fetchProjects(): Promise<Project[]> {
  const response = await fetch(`${API_URL}/api/projects`, {
    next: { revalidate: 60 } // Revalidate every 60 seconds
  });

  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  const data = await response.json();
  return data.projects;
}

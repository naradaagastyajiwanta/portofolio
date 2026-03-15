// Use internal Docker network URL for server-side fetches, public URL for client-side
const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ─── Site Settings ────────────────────────────────────────────────────────────

export interface SiteSettings {
  profile: {
    display_name: string;
    title: string;
    bio: string;
    location: string;
    availability: string;
    years_experience: string;
    avatar_url: string;
    resume_url: string;
  };
  social: {
    github_url: string;
    linkedin_url: string;
    twitter_url: string;
    email: string;
  };
  seo: {
    site_title: string;
    site_description: string;
    keywords: string;
    og_image_url: string;
  };
}

const SETTINGS_DEFAULTS: SiteSettings = {
  profile: {
    display_name: 'NAJ',
    title: 'Full-Stack Developer',
    bio: '',
    location: 'Indonesia',
    availability: 'Available for freelance work',
    years_experience: '3',
    avatar_url: '',
    resume_url: '',
  },
  social: {
    github_url: '',
    linkedin_url: '',
    twitter_url: '',
    email: '',
  },
  seo: {
    site_title: 'NAJ — Full-Stack Developer Portfolio',
    site_description: '',
    keywords: '',
    og_image_url: '',
  },
};

/** Fetch public site settings (server-side, cached 60s) */
export async function fetchSettings(): Promise<SiteSettings> {
  try {
    const response = await fetch(`${API_URL}/api/settings/public`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return SETTINGS_DEFAULTS;
    const data = await response.json();
    return {
      profile: { ...SETTINGS_DEFAULTS.profile, ...data.profile },
      social: { ...SETTINGS_DEFAULTS.social, ...data.social },
      seo: { ...SETTINGS_DEFAULTS.seo, ...data.seo },
    };
  } catch {
    return SETTINGS_DEFAULTS;
  }
}

/** Client-side hook: fetch settings from the public API URL */
export function getClientSettingsUrl(): string {
  const base = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
    : API_URL;
  return `${base}/api/settings/public`;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

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
  language?: string;
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

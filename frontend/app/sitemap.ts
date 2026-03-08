import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const apiUrl =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
  ];

  // Dynamic project pages
  let projectPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${apiUrl}/api/projects`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const projects: { id: string; updatedAt: string }[] = data.projects || [];
      projectPages = projects.map((p) => ({
        url: `${siteUrl}/projects/${p.id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {}

  // Dynamic blog post pages
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${apiUrl}/api/blog?limit=50`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const posts: { slug: string; publishedAt: string }[] = data.posts || [];
      blogPages = posts
        .filter((p) => p.publishedAt)
        .map((p) => ({
          url: `${siteUrl}/blog/${p.slug}`,
          lastModified: new Date(p.publishedAt),
          changeFrequency: "monthly" as const,
          priority: 0.8,
        }));
    }
  } catch {}

  return [...staticPages, ...projectPages, ...blogPages];
}

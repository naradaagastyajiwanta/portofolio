import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, ArrowRight, FileText } from "lucide-react";
import { Metadata } from "next";
import { Header } from "@/components/header";
import { BackgroundEffect } from "@/components/blocks/background-effects";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts, tutorials, and insights on web development, software engineering, and tech.",
  openGraph: {
    title: "Blog",
    description: "Thoughts, tutorials, and insights on web development.",
  },
};

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  publishedAt: string;
  readingTime: number;
  views: number;
  author: { displayName: string | null; username: string };
  tags: BlogTag[];
}

async function fetchBlogPosts(tag?: string): Promise<{ posts: BlogPost[]; pagination: { total: number; totalPages: number } }> {
  try {
    const params = new URLSearchParams({ limit: "12" });
    if (tag) params.set("tag", tag);

    const res = await fetch(`${API_URL}/api/blog?${params}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { posts: [], pagination: { total: 0, totalPages: 0 } };
    return res.json();
  } catch {
    return { posts: [], pagination: { total: 0, totalPages: 0 } };
  }
}

async function fetchTags(): Promise<{ tags: (BlogTag & { postCount: number })[] }> {
  try {
    const res = await fetch(`${API_URL}/api/blog/tags`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { tags: [] };
    return res.json();
  } catch {
    return { tags: [] };
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const params = await searchParams;
  const [blogData, tagsData] = await Promise.all([
    fetchBlogPosts(params.tag),
    fetchTags(),
  ]);

  const { posts } = blogData;
  const { tags } = tagsData;

  return (
    <div className="min-h-screen relative">
      <BackgroundEffect type="gradient-blobs" className="fixed inset-0 -z-10" />
      <main className="min-h-screen bg-background">
        <Header />
        {/* Hero */}
      <section className="relative py-24 md:py-32 bg-gradient-to-b from-background via-background to-muted/30 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse animation-delay-1000" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 shadow-lg shadow-primary/5">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Blog</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Thoughts, Tutorials & Insights
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Exploring web development, software engineering, and technology trends
            </p>

            {/* Decorative line */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50" />
              <div className="h-2 w-2 rounded-full bg-primary/50" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50" />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-5xl mx-auto -mt-8">
          {/* Tags Filter */}
          {tags.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap mb-12 p-6 rounded-2xl bg-card/50 backdrop-blur-sm shadow-lg shadow-primary/5 border border-primary/5">
              <span className="text-sm font-medium text-muted-foreground">Filter:</span>
              <Link href="/blog">
                <Badge
                  variant={!params.tag ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 transition-all hover:scale-105"
                >
                  All Posts
                </Badge>
              </Link>
              {tags.map((tag) => (
                <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                  <Badge
                    variant={params.tag === tag.slug ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10 transition-all hover:scale-105 gap-1.5"
                  >
                    {tag.name}
                    <span className="text-[10px] opacity-60">({tag.postCount})</span>
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Posts */}
          {posts.length === 0 ? (
            <div className="text-center py-32">
              <div className="inline-flex p-4 rounded-full bg-muted/30 mb-4">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">No posts yet</h3>
              <p className="text-muted-foreground">Check back soon for new content!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block"
                >
                  <article className="relative bg-card/50 backdrop-blur-sm rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-hidden border border-primary/5 hover:border-primary/10">
                    {/* Gradient border effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-transparent to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {/* Decorative glow */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />

                    <div className="relative">
                      {/* Tags */}
                      <div className="flex items-center gap-2 mb-4">
                        {post.tags.map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="text-xs font-medium">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                        {post.excerpt}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground pb-4 border-b border-border/50 mb-4">
                        <div className="flex items-center gap-4">
                          <span className="font-medium text-foreground">
                            {post.author.displayName || post.author.username}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {post.readingTime} min read
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {post.views}
                          </span>
                        </div>
                        <time className="text-xs">
                          {new Date(post.publishedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                      </div>

                      {/* Read more indicator */}
                      <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                        <span>Read article</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      </main>
    </div>
  );
}

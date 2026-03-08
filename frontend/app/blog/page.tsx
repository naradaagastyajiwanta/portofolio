import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, ArrowRight, Tag } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts, tutorials, and insights on web development, software engineering, and tech.",
  openGraph: {
    title: "Blog",
    description: "Thoughts, tutorials, and insights on web development.",
  },
};

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
  const params = new URLSearchParams({ limit: "12" });
  if (tag) params.set("tag", tag);
  
  const res = await fetch(`${API_URL}/api/blog?${params}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return { posts: [], pagination: { total: 0, totalPages: 0 } };
  return res.json();
}

async function fetchTags(): Promise<{ tags: (BlogTag & { postCount: number })[] }> {
  const res = await fetch(`${API_URL}/api/blog/tags`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return { tags: [] };
  return res.json();
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
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Thoughts, tutorials, and insights on web development, software engineering, and technology.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Tags Filter */}
          {tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-8">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <Link href="/blog">
                <Badge
                  variant={!params.tag ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  All
                </Badge>
              </Link>
              {tags.map((tag) => (
                <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                  <Badge
                    variant={params.tag === tag.slug ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10 transition-colors gap-1"
                  >
                    {tag.color && (
                      <span
                        className="h-2 w-2 rounded-full inline-block"
                        style={{ backgroundColor: tag.color }}
                      />
                    )}
                    {tag.name}
                    <span className="text-[10px] opacity-60">({tag.postCount})</span>
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Posts */}
          {posts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">No posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post, i) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block"
                >
                  <article className="relative rounded-xl border bg-card p-6 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                    {/* Cover image */}
                    {i === 0 && post.coverImage && (
                      <div className="mb-4 -mt-6 -mx-6 rounded-t-xl overflow-hidden">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-48 md:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-3">
                      {post.tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>

                    {/* Title & Excerpt */}
                    <h2 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>{post.author.displayName || post.author.username}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {post.readingTime} min read
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {post.views}
                        </span>
                      </div>
                      <time>
                        {new Date(post.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    </div>

                    {/* Read more arrow */}
                    <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

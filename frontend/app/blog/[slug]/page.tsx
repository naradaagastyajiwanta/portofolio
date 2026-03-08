import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Eye, Calendar, FileText } from "lucide-react";
import { Metadata } from "next";
import BlogContent from "./blog-content";
import { Header } from "@/components/header";
import { BackgroundEffect } from "@/components/blocks/background-effects";

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
  content: string;
  coverImage: string | null;
  status: string;
  publishedAt: string;
  readingTime: number;
  views: number;
  author: { displayName: string | null; username: string };
  tags: BlogTag[];
}

async function fetchPost(slug: string): Promise<BlogPost | null> {
  const res = await fetch(`${API_URL}/api/blog/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.displayName || post.author.username],
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author.displayName || post.author.username,
    },
    wordCount: post.content.split(/\s+/).length,
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundEffect type="gradient-blobs" className="fixed inset-0 -z-10" />
      <main className="min-h-screen bg-background">
        <Header />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

      {/* Hero gradient background */}
      <section className="relative py-24 md:py-32 bg-gradient-to-b from-background via-background to-muted/30 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-20 w-72 h-72 bg-secondary/5 rounded-full blur-3xl animate-pulse animation-delay-1000" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Back link */}
          <div className="max-w-4xl mx-auto mb-8">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>

          <article className="max-w-4xl mx-auto">
            {/* Post type badge */}
            <div className="flex items-center gap-2 mb-6">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Article</span>
              </div>
              {post.tags.map((tag) => (
                <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                  <Badge variant="secondary" className="hover:bg-secondary/80 transition-colors cursor-pointer">
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Decorative line */}
            <div className="flex items-center gap-2 mb-8">
              <div className="h-px w-16 bg-gradient-to-r from-primary/50 to-transparent" />
              <div className="h-2 w-2 rounded-full bg-primary/50" />
              <div className="h-px w-16 bg-gradient-to-l from-primary/50 to-transparent" />
            </div>

            {/* Meta info card */}
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 space-y-4 shadow-lg shadow-primary/5 border border-primary/5">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-primary to-secondary rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {(post.author.displayName || post.author.username).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {post.author.displayName || post.author.username}
                  </p>
                  <p className="text-sm text-muted-foreground">Author</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t border-border/50">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {post.readingTime} min read
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {post.views} views
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Cover image */}
      {post.coverImage && (
        <div className="container mx-auto px-4 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden p-2 shadow-lg shadow-primary/5 border border-primary/5 hover:shadow-xl transition-shadow duration-300">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-auto rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-lg shadow-primary/5 border border-primary/5">
            <BlogContent content={post.content} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="text-sm text-muted-foreground mr-2">Tags:</span>
                {post.tags.map((tag) => (
                  <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                    <Badge variant="outline" className="hover:bg-primary/10 transition-colors cursor-pointer">
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
              <Button asChild size="lg" className="gap-2">
                <Link href="/blog">
                  <ArrowLeft className="h-4 w-4" />
                  More Posts
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </footer>
      </main>
    </div>
  );
}

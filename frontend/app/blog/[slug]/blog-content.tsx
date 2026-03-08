"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function BlogContent({ content }: { content: string }) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none
      prose-headings:font-bold prose-headings:tracking-tight prose-headings:mt-8 prose-headings:mb-4
      prose-h1:text-4xl prose-h1:md:text-5xl
      prose-h2:text-3xl prose-h2:md:text-4xl prose-h2:mt-10
      prose-h3:text-2xl prose-h3:md:text-3xl
      prose-p:leading-relaxed prose-p:text-lg prose-p:my-6
      prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-a:transition-colors
      prose-strong:text-foreground prose-strong:font-semibold
      prose-code:text-sm prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-code:font-mono
      prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/50 prose-pre:rounded-xl prose-pre:shadow-lg
      prose-blockquote:border-l-4 prose-blockquote:border-primary/20 prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:italic
      prose-ul:my-6 prose-ul:space-y-2
      prose-ol:my-6 prose-ol:space-y-2
      prose-li:marker:text-primary
      prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
      prose-hr:border-border/50 prose-hr:my-12
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

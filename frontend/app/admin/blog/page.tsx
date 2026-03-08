"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Save,
  X,
  Trash2,
  Pencil,
  Eye,
  FileText,
  Loader2,
  ArrowLeft,
  Send,
  Archive,
  Clock,
  Tag,
  Search,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  postCount?: number;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  status: string;
  publishedAt: string | null;
  readingTime: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  author: { displayName: string | null; username: string };
  tags: BlogTag[];
}

const statusConfig: Record<string, { label: string; class: string; icon: typeof FileText }> = {
  draft: { label: "Draft", class: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: FileText },
  published: { label: "Published", class: "bg-green-500/10 text-green-600 border-green-500/20", icon: Eye },
  archived: { label: "Archived", class: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: Archive },
};

export default function AdminBlogPage() {
  const { authFetch } = useAuth();

  // ─── State ───────────────────────────────────────────────────────────────
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [allTags, setAllTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Editor state
  const [view, setView] = useState<"list" | "editor">("list");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    coverImage: "",
    status: "draft",
    tagInput: "",
    tags: [] as string[],
  });
  const [preview, setPreview] = useState(false);

  // ─── Fetch posts ─────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (filter !== "all") params.set("status", filter);
      const res = await authFetch(`${API_URL}/api/admin/blog?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  }, [authFetch, page, filter]);

  const fetchTags = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/api/admin/blog/tags`);
      if (res.ok) {
        const data = await res.json();
        setAllTags(data.tags);
      }
    } catch {}
  }, [authFetch]);

  useEffect(() => {
    fetchPosts();
    fetchTags();
  }, [fetchPosts, fetchTags]);

  // ─── Post actions ────────────────────────────────────────────────────────
  const openEditor = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setForm({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        coverImage: post.coverImage || "",
        status: post.status,
        tagInput: "",
        tags: post.tags.map((t) => t.name),
      });
    } else {
      setEditingPost(null);
      setForm({ title: "", content: "", excerpt: "", coverImage: "", status: "draft", tagInput: "", tags: [] });
    }
    setPreview(false);
    setView("editor");
  };

  const savePost = async (overrideStatus?: string) => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      const status = overrideStatus || form.status;
      const body = {
        title: form.title,
        content: form.content,
        excerpt: form.excerpt || undefined,
        coverImage: form.coverImage || undefined,
        status,
        tags: form.tags,
      };

      let res: Response;
      if (editingPost) {
        res = await authFetch(`${API_URL}/api/admin/blog/${editingPost.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await authFetch(`${API_URL}/api/admin/blog`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        setView("list");
        fetchPosts();
        fetchTags();
      }
    } catch (err) {
      console.error("Failed to save post:", err);
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await authFetch(`${API_URL}/api/admin/blog/${id}`, { method: "DELETE" });
      fetchPosts();
    } catch {}
  };

  const addTag = () => {
    const tag = form.tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag], tagInput: "" });
    }
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const deleteTag = async (id: string) => {
    if (!confirm("Delete this tag? It will be removed from all posts.")) return;
    try {
      await authFetch(`${API_URL}/api/admin/blog/tags/${id}`, { method: "DELETE" });
      fetchTags();
      fetchPosts();
    } catch {}
  };

  // ─── Filtered posts ─────────────────────────────────────────────────────
  const filteredPosts = searchQuery
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : posts;

  // ─── Render ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EDITOR VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === "editor") {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setView("list")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Posts
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreview(!preview)}
              className="gap-1.5"
            >
              <Eye className="h-4 w-4" />
              {preview ? "Edit" : "Preview"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => savePost("draft")}
              disabled={saving || !form.title.trim() || !form.content.trim()}
              className="gap-1.5"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={() => savePost("published")}
              disabled={saving || !form.title.trim() || !form.content.trim()}
              className="gap-1.5"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Publish
            </Button>
          </div>
        </div>

        {/* Title */}
        <Input
          placeholder="Post title..."
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="text-2xl font-bold h-14 border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/40"
        />

        {/* Content editor / preview */}
        <div className="grid grid-cols-1 gap-6">
          {preview ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="prose prose-neutral dark:prose-invert max-w-none min-h-[400px] border rounded-lg p-6 bg-card"
            >
              <div className="whitespace-pre-wrap">{form.content || "Nothing to preview..."}</div>
            </motion.div>
          ) : (
            <textarea
              placeholder="Write your blog post in markdown..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="min-h-[400px] w-full resize-y rounded-lg border bg-background p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          )}
        </div>

        {/* Metadata panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4 bg-card">
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">Excerpt</label>
            <textarea
              placeholder="Brief summary of the post (auto-generated if empty)..."
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={3}
              className="w-full resize-none rounded-md border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">Cover Image URL</label>
            <Input
              placeholder="https://example.com/image.jpg"
              value={form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
            />

            <label className="text-sm font-medium text-muted-foreground">Tags</label>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={form.tagInput}
                onChange={(e) => setForm({ ...form, tagInput: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {/* Show existing tags as suggestions */}
              {allTags
                .filter((t) => !form.tags.includes(t.name))
                .slice(0, 5)
                .map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="gap-1 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                    onClick={() => setForm({ ...form, tags: [...form.tags, tag.name] })}
                  >
                    <Plus className="h-2.5 w-2.5" />
                    {tag.name}
                  </Badge>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Posts", value: stats.total, color: "text-foreground" },
          { label: "Published", value: stats.published, color: "text-green-500" },
          { label: "Drafts", value: stats.draft, color: "text-yellow-500" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {["all", "draft", "published", "archived"].map((s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFilter(s);
                setPage(1);
              }}
              className="capitalize"
            >
              {s === "all" ? "All" : statusConfig[s]?.label || s}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <Button onClick={() => openEditor()} className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-muted-foreground"
            >
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No posts yet. Create your first blog post!</p>
            </motion.div>
          ) : (
            filteredPosts.map((post) => {
              const config = statusConfig[post.status] || statusConfig.draft;
              return (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="group rounded-lg border bg-card p-4 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`text-[10px] ${config.class}`}>
                          {config.label}
                        </Badge>
                        {post.tags.map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="text-[10px]">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="font-semibold text-lg truncate">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readingTime} min read
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views} views
                        </span>
                        <span>
                          {post.publishedAt
                            ? `Published ${new Date(post.publishedAt).toLocaleDateString()}`
                            : `Updated ${new Date(post.updatedAt).toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditor(post)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {post.status === "draft" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-500 hover:text-green-600"
                          onClick={async () => {
                            await authFetch(`${API_URL}/api/admin/blog/${post.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: "published" }),
                            });
                            fetchPosts();
                          }}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Tags Management */}
      {allTags.length > 0 && (
        <div className="border rounded-lg p-4 bg-card space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tags ({allTags.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm group/tag"
              >
                {tag.color && (
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                )}
                <span>{tag.name}</span>
                <span className="text-xs text-muted-foreground">({tag.postCount})</span>
                <button
                  onClick={() => deleteTag(tag.id)}
                  className="ml-1 opacity-0 group-hover/tag:opacity-100 transition-opacity text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

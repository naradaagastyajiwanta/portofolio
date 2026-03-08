"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  EyeOff,
  Star,
  StarOff,
  Search,
  RefreshCw,
  ExternalLink,
  Pencil,
  Save,
  X,
  GitBranch,
  Calendar,
  Loader2,
  FolderGit2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Project {
  id: string;
  provider: string;
  repoId: string;
  name: string;
  description: string | null;
  url: string;
  stars: number;
  techStack: string[];
  featured: boolean;
  showOnPortfolio: boolean;
  lastCommitAt: string | null;
  syncedAt: string;
  createdAt: string;
  updatedAt: string;
}

type FilterMode = "all" | "visible" | "hidden" | "featured";

export default function AdminProjectsPage() {
  const { authFetch } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, visible: 0, featured: 0 });

  const fetchProjects = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/api/admin/projects`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
        setStats(data.stats);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await authFetch(`${API_URL}/api/sync/github`, { method: "POST" });
      await fetchProjects();
    } catch {
    } finally {
      setSyncing(false);
    }
  };

  const toggleField = async (id: string, field: "showOnPortfolio" | "featured", value: boolean) => {
    setSavingId(id);
    try {
      const res = await authFetch(`${API_URL}/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
        );
        setStats((prev) => {
          const newProjects = projects.map((p) =>
            p.id === id ? { ...p, [field]: value } : p
          );
          return {
            total: newProjects.length,
            visible: newProjects.filter((p) => p.showOnPortfolio).length,
            featured: newProjects.filter((p) => p.featured).length,
          };
        });
      }
    } catch {
    } finally {
      setSavingId(null);
    }
  };

  const saveDescription = async (id: string) => {
    setSavingId(id);
    try {
      const res = await authFetch(`${API_URL}/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: editDescription }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
        );
        setEditingId(null);
      }
    } catch {
    } finally {
      setSavingId(null);
    }
  };

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      filter === "all" ||
      (filter === "visible" && p.showOnPortfolio) ||
      (filter === "hidden" && !p.showOnPortfolio) ||
      (filter === "featured" && p.featured);

    return matchesSearch && matchesFilter;
  });

  const filters: { label: string; value: FilterMode; count: number }[] = [
    { label: "All", value: "all", count: stats.total },
    { label: "Visible", value: "visible", count: stats.visible },
    { label: "Hidden", value: "hidden", count: stats.total - stats.visible },
    { label: "Featured", value: "featured", count: stats.featured },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
            <FolderGit2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
            <p className="text-sm text-muted-foreground">
              {stats.visible} visible &middot; {stats.featured} featured &middot; {stats.total} total
            </p>
          </div>
        </div>
        <Button
          onClick={handleSync}
          variant="outline"
          size="sm"
          className="gap-2 rounded-lg border-border/60"
          disabled={syncing}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync GitHub"}
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="rounded-xl bg-background border border-border/60 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/30 border-border/60"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-muted/40 p-1">
          {filters.map((f) => (
            <button
              key={f.value}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filter === f.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
              <span className="ml-1.5 text-[10px] opacity-60">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Project List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ delay: i * 0.02 }}
              className="rounded-xl border border-border/60 bg-background p-4 group hover:border-border transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Left: Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <FolderGit2 className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                    <h3 className="font-medium truncate">{project.name}</h3>
                    {project.featured && (
                      <Badge className="text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-0">
                        <Star className="h-2.5 w-2.5 fill-current mr-0.5" />
                        Featured
                      </Badge>
                    )}
                    {!project.showOnPortfolio && (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/60">
                        Hidden
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  {editingId === project.id ? (
                    <div className="mt-2 flex gap-2">
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={2}
                        className="text-sm flex-1 bg-muted/30 border-border/60"
                        placeholder="Enter description..."
                      />
                      <div className="flex flex-col gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => saveDescription(project.id)}
                          disabled={savingId === project.id}
                        >
                          {savingId === project.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Save className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p
                      className="text-sm text-muted-foreground mt-1 line-clamp-2 cursor-pointer hover:text-foreground transition-colors group/desc"
                      onClick={() => {
                        setEditingId(project.id);
                        setEditDescription(project.description || "");
                      }}
                    >
                      {project.description || (
                        <span className="italic opacity-50">No description — click to add</span>
                      )}
                      <Pencil className="h-3 w-3 ml-1 inline-block opacity-0 group-hover/desc:opacity-50" />
                    </p>
                  )}

                  {/* Tech Stack */}
                  {project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded-md bg-muted/50 text-[11px] text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-3 mt-2.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      {project.provider}
                    </span>
                    {project.stars > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        {project.stars}
                      </span>
                    )}
                    {project.lastCommitAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(project.lastCommitAt).toLocaleDateString()}
                      </span>
                    )}
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Repo
                    </a>
                  </div>
                </div>

                {/* Right: Toggle buttons */}
                <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className={`p-2 rounded-lg transition-colors ${
                      project.showOnPortfolio
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() =>
                      toggleField(project.id, "showOnPortfolio", !project.showOnPortfolio)
                    }
                    disabled={savingId === project.id}
                    title={project.showOnPortfolio ? "Hide from portfolio" : "Show on portfolio"}
                  >
                    {savingId === project.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : project.showOnPortfolio ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    className={`p-2 rounded-lg transition-colors ${
                      project.featured
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() =>
                      toggleField(project.id, "featured", !project.featured)
                    }
                    disabled={savingId === project.id}
                    title={project.featured ? "Remove from featured" : "Mark as featured"}
                  >
                    {project.featured ? (
                      <Star className="h-4 w-4 fill-current" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/60 bg-background py-16 text-center">
            <FolderGit2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            {searchQuery || filter !== "all" ? (
              <p className="text-sm text-muted-foreground">No projects match your filters.</p>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">No projects synced yet.</p>
                <Button
                  onClick={handleSync}
                  className="mt-4 gap-2 rounded-lg"
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Sync from GitHub
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

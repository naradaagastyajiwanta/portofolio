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
  Filter,
  Check,
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
        // Update stats
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Project Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.visible} visible of {stats.total} projects &middot; {stats.featured} featured
            </p>
          </div>
          <Button
            onClick={handleSync}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={syncing}
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync GitHub"}
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, description, or tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1">
            {filters.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? "default" : "ghost"}
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setFilter(f.value)}
              >
                {f.label}
                <Badge
                  variant={filter === f.value ? "secondary" : "outline"}
                  className="h-5 min-w-[20px] px-1 text-[10px]"
                >
                  {f.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Project List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border bg-card p-4 group"
              >
                <div className="flex items-start gap-4">
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold truncate">{project.name}</h3>
                      {project.featured && (
                        <Badge variant="default" className="text-[10px]">Featured</Badge>
                      )}
                      {!project.showOnPortfolio && (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          Hidden
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        <GitBranch className="h-2.5 w-2.5" />
                        {project.provider}
                      </Badge>
                    </div>

                    {/* Description */}
                    {editingId === project.id ? (
                      <div className="mt-2 flex gap-2">
                        <Textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={2}
                          className="text-sm flex-1"
                          placeholder="Enter description..."
                        />
                        <div className="flex flex-col gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
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
                            className="h-8 w-8"
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
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.techStack.map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-[10px] font-normal">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
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
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      variant={project.showOnPortfolio ? "default" : "outline"}
                      size="sm"
                      className="gap-1.5 text-xs w-[100px] justify-start"
                      onClick={() =>
                        toggleField(project.id, "showOnPortfolio", !project.showOnPortfolio)
                      }
                      disabled={savingId === project.id}
                    >
                      {savingId === project.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : project.showOnPortfolio ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}
                      {project.showOnPortfolio ? "Visible" : "Hidden"}
                    </Button>
                    <Button
                      variant={project.featured ? "default" : "outline"}
                      size="sm"
                      className="gap-1.5 text-xs w-[100px] justify-start"
                      onClick={() =>
                        toggleField(project.id, "featured", !project.featured)
                      }
                      disabled={savingId === project.id}
                    >
                      {savingId === project.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : project.featured ? (
                        <Star className="h-3.5 w-3.5 fill-current" />
                      ) : (
                        <StarOff className="h-3.5 w-3.5" />
                      )}
                      {project.featured ? "Featured" : "Normal"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FolderGit2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              {searchQuery || filter !== "all" ? (
                <p>No projects match your filters.</p>
              ) : (
                <div>
                  <p>No projects yet.</p>
                  <Button onClick={handleSync} className="mt-4 gap-2" variant="outline">
                    <RefreshCw className="h-4 w-4" />
                    Sync from GitHub
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

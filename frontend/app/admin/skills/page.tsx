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
  EyeOff,
  Loader2,
  Code2,
  ArrowUp,
  ArrowDown,
  Zap,
  Layers,
  Database,
  Server,
  Wrench,
  Globe,
  BarChart3,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const CATEGORIES = ["Language", "Frontend", "Backend", "Database", "DevOps", "Tools"];

const categoryConfig: Record<string, { gradient: string; badge: string; barFrom: string; barTo: string; icon: typeof Code2 }> = {
  Language: { gradient: "from-blue-500/10 to-blue-500/5", badge: "bg-blue-500/10 text-blue-600 border-blue-500/20", barFrom: "from-blue-500", barTo: "to-blue-400", icon: Code2 },
  Frontend: { gradient: "from-emerald-500/10 to-emerald-500/5", badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", barFrom: "from-emerald-500", barTo: "to-emerald-400", icon: Globe },
  Backend: { gradient: "from-purple-500/10 to-purple-500/5", badge: "bg-purple-500/10 text-purple-600 border-purple-500/20", barFrom: "from-purple-500", barTo: "to-purple-400", icon: Server },
  Database: { gradient: "from-orange-500/10 to-orange-500/5", badge: "bg-orange-500/10 text-orange-600 border-orange-500/20", barFrom: "from-orange-500", barTo: "to-orange-400", icon: Database },
  DevOps: { gradient: "from-red-500/10 to-red-500/5", badge: "bg-red-500/10 text-red-600 border-red-500/20", barFrom: "from-red-500", barTo: "to-red-400", icon: Layers },
  Tools: { gradient: "from-cyan-500/10 to-cyan-500/5", badge: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20", barFrom: "from-cyan-500", barTo: "to-cyan-400", icon: Wrench },
};

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
  order: number;
  visible: boolean;
}

export default function AdminSkillsPage() {
  const { authFetch } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", level: 80, category: "Language" });
  const [isCreating, setIsCreating] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", level: 80, category: "Language" });

  const fetchSkills = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/api/admin/skills`);
      if (res.ok) {
        const data = await res.json();
        setSkills(data.skills);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleCreate = async () => {
    if (!newForm.name.trim()) return;
    setSavingId("new");
    try {
      const res = await authFetch(`${API_URL}/api/admin/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newForm, order: skills.length }),
      });
      if (res.ok) {
        await fetchSkills();
        setIsCreating(false);
        setNewForm({ name: "", level: 80, category: "Language" });
      }
    } catch {
    } finally {
      setSavingId(null);
    }
  };

  const handleUpdate = async (id: string) => {
    setSavingId(id);
    try {
      const res = await authFetch(`${API_URL}/api/admin/skills/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
        setEditingId(null);
      }
    } catch {
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this skill?")) return;
    setSavingId(id);
    try {
      await authFetch(`${API_URL}/api/admin/skills/${id}`, { method: "DELETE" });
      setSkills((prev) => prev.filter((s) => s.id !== id));
    } catch {
    } finally {
      setSavingId(null);
    }
  };

  const toggleVisibility = async (id: string, visible: boolean) => {
    setSavingId(id);
    try {
      const res = await authFetch(`${API_URL}/api/admin/skills/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible }),
      });
      if (res.ok) {
        setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, visible } : s)));
      }
    } catch {
    } finally {
      setSavingId(null);
    }
  };

  const moveSkill = async (id: string, direction: "up" | "down") => {
    const idx = skills.findIndex((s) => s.id === id);
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === skills.length - 1)) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const newSkills = [...skills];
    [newSkills[idx], newSkills[swapIdx]] = [newSkills[swapIdx], newSkills[idx]];
    const reordered = newSkills.map((s, i) => ({ ...s, order: i }));
    setSkills(reordered);
    try {
      await authFetch(`${API_URL}/api/admin/skills/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: reordered.map((s) => ({ id: s.id, order: s.order })) }),
      });
    } catch {}
  };

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    skills: skills.filter((s) => s.category === cat),
  })).filter((g) => g.skills.length > 0);

  const visibleCount = skills.filter((s) => s.visible).length;
  const avgLevel = skills.length > 0 ? Math.round(skills.reduce((sum, s) => sum + s.level, 0) / skills.length) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Skills</h1>
          <p className="text-sm text-muted-foreground">
            {skills.length} skills · {visibleCount} visible · {avgLevel}% avg proficiency
          </p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Skill
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: skills.length, icon: Zap, color: "text-primary" },
          { label: "Visible", value: visibleCount, icon: Eye, color: "text-emerald-500" },
          { label: "Hidden", value: skills.length - visibleCount, icon: EyeOff, color: "text-orange-500" },
          { label: "Avg Level", value: `${avgLevel}%`, icon: BarChart3, color: "text-blue-500" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" />
                  New Skill
                </h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsCreating(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  placeholder="Skill name"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                  autoFocus
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  value={newForm.category}
                  onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={newForm.level}
                    onChange={(e) => setNewForm({ ...newForm, level: Number(e.target.value) })}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-sm font-mono font-medium w-10 text-right">{newForm.level}%</span>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={savingId === "new" || !newForm.name.trim()}
                  className="gap-2"
                >
                  {savingId === "new" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Skill
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skills grouped by category */}
      {grouped.map((group) => {
        const config = categoryConfig[group.category] || categoryConfig.Language;
        const CategoryIcon = config.icon;
        return (
          <div key={group.category} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${config.gradient}`}>
                <CategoryIcon className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm">{group.category}</h2>
                <Badge variant="outline" className={`text-[10px] px-1.5 ${config.badge}`}>
                  {group.skills.length}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {group.skills.map((skill) => (
                  <motion.div
                    key={skill.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`rounded-xl border bg-card p-4 group transition-all hover:shadow-sm ${
                      !skill.visible ? "opacity-40" : ""
                    }`}
                  >
                    {editingId === skill.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            onKeyDown={(e) => { if (e.key === "Enter") handleUpdate(skill.id); }}
                            autoFocus
                          />
                          <select
                            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={editForm.level}
                              onChange={(e) => setEditForm({ ...editForm, level: Number(e.target.value) })}
                              className="flex-1 accent-primary"
                            />
                            <span className="text-sm font-mono font-medium w-10 text-right">{editForm.level}%</span>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdate(skill.id)}
                            disabled={savingId === skill.id}
                            className="gap-1.5"
                          >
                            {savingId === skill.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => moveSkill(skill.id, "up")}
                            className="text-muted-foreground hover:text-foreground p-0.5 rounded hover:bg-muted transition-colors"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => moveSkill(skill.id, "down")}
                            className="text-muted-foreground hover:text-foreground p-0.5 rounded hover:bg-muted transition-colors"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-sm">{skill.name}</span>
                            <span className="text-xs font-mono text-muted-foreground">{skill.level}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.level}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={`h-full rounded-full bg-gradient-to-r ${config.barFrom} ${config.barTo}`}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleVisibility(skill.id, !skill.visible)}
                            disabled={savingId === skill.id}
                            title={skill.visible ? "Hide" : "Show"}
                          >
                            {skill.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingId(skill.id);
                              setEditForm({ name: skill.name, level: skill.level, category: skill.category });
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(skill.id)}
                            disabled={savingId === skill.id}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}

      {/* Empty state */}
      {skills.length === 0 && !isCreating && (
        <div className="text-center py-20">
          <div className="inline-flex p-4 rounded-2xl bg-muted/50 mb-4">
            <Code2 className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="font-semibold mb-1">No skills yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Add your first skill to showcase your expertise.</p>
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Skill
          </Button>
        </div>
      )}
    </div>
  );
}

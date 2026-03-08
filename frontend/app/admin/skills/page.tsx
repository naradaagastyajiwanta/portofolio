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
  Code,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const CATEGORIES = ["Language", "Frontend", "Backend", "Database", "DevOps", "Tools"];

const categoryColors: Record<string, string> = {
  Language: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Frontend: "bg-green-500/10 text-green-600 border-green-500/20",
  Backend: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  Database: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  DevOps: "bg-red-500/10 text-red-600 border-red-500/20",
  Tools: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
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
        body: JSON.stringify({
          ...newForm,
          order: skills.length,
        }),
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
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === skills.length - 1))
      return;
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

  // Group by category
  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    skills: skills.filter((s) => s.category === cat),
  })).filter((g) => g.skills.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Skills Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {skills.length} skills &middot; {skills.filter((s) => s.visible).length} visible
            </p>
          </div>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)} className="gap-2" size="sm">
              <Plus className="h-4 w-4" />
              Add Skill
            </Button>
          )}
        </div>

        {/* Create Form */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border bg-card p-4 space-y-3">
                <h3 className="text-sm font-semibold">New Skill</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    placeholder="Skill name"
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  />
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newForm.category}
                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={newForm.level}
                      onChange={(e) => setNewForm({ ...newForm, level: Number(e.target.value) })}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    disabled={savingId === "new" || !newForm.name.trim()}
                  >
                    {savingId === "new" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skills grouped by category */}
        {grouped.map((group) => (
          <div key={group.category} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={categoryColors[group.category] || ""}>
                {group.category}
              </Badge>
              <span className="text-xs text-muted-foreground">{group.skills.length} skills</span>
            </div>
            <div className="space-y-1.5">
              <AnimatePresence mode="popLayout">
                {group.skills.map((skill) => (
                  <motion.div
                    key={skill.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`rounded-lg border bg-card p-3 group ${
                      !skill.visible ? "opacity-50" : ""
                    }`}
                  >
                    {editingId === skill.id ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="flex-1"
                        />
                        <select
                          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={editForm.category}
                          onChange={(e) =>
                            setEditForm({ ...editForm, category: e.target.value })
                          }
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={editForm.level}
                            onChange={(e) =>
                              setEditForm({ ...editForm, level: Number(e.target.value) })
                            }
                            className="w-20"
                          />
                          <span className="text-xs">%</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10"
                            onClick={() => handleUpdate(skill.id)}
                            disabled={savingId === skill.id}
                          >
                            {savingId === skill.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => moveSkill(skill.id, "up")}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => moveSkill(skill.id, "down")}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{skill.name}</span>
                            <span className="text-xs text-muted-foreground">{skill.level}%</span>
                          </div>
                          <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${skill.level}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              toggleVisibility(skill.id, !skill.visible)
                            }
                            disabled={savingId === skill.id}
                          >
                            {skill.visible ? (
                              <Eye className="h-3.5 w-3.5" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingId(skill.id);
                              setEditForm({
                                name: skill.name,
                                level: skill.level,
                                category: skill.category,
                              });
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
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
        ))}

        {skills.length === 0 && !isCreating && (
          <div className="text-center py-12 text-muted-foreground">
            <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No skills yet. Click "Add Skill" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

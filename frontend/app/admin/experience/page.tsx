"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Calendar,
  MapPin,
  Briefcase,
  Loader2,
  Upload,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Building2,
} from "lucide-react";

interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  employmentType?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  responsibilities: string[];
  skills: string[];
  order: number;
  showOnAbout: boolean;
}

export default function AdminExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Experience>>({
    title: "", company: "", location: "", employmentType: "Full-time",
    startDate: "", endDate: "", current: false, description: "",
    responsibilities: [], skills: [], order: 0, showOnAbout: true
  });
  const [responsibilityInput, setResponsibilityInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string; skipped?: string[] } | null>(null);
  const [linkedInOpen, setLinkedInOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const { authFetch, logout, user } = useAuth();
  const router = useRouter();

  useEffect(() => { fetchExperiences(); }, []);

  const fetchExperiences = async () => {
    try {
      const response = await authFetch(`${API_URL}/api/admin/experiences`);
      if (response.status === 401) { router.replace("/admin/login"); return; }
      const data = await response.json();
      setExperiences(data);
    } catch (error) { console.error("Failed to fetch experiences:", error); }
    finally { setLoading(false); }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      title: "", company: "", location: "", employmentType: "Full-time",
      startDate: new Date().toISOString().split('T')[0], endDate: "", current: false,
      description: "", responsibilities: [], skills: [],
      order: experiences.length, showOnAbout: true
    });
  };

  const handleEdit = (experience: Experience) => {
    setEditingId(experience.id);
    setFormData({
      ...experience,
      startDate: experience.startDate.split('T')[0],
      endDate: experience.endDate ? experience.endDate.split('T')[0] : ""
    });
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        const response = await authFetch(`${API_URL}/api/admin/experiences`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (response.ok) { await fetchExperiences(); setIsCreating(false); }
      } else if (editingId) {
        const response = await authFetch(`${API_URL}/api/admin/experiences/${editingId}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (response.ok) { await fetchExperiences(); setEditingId(null); }
      }
    } catch (error) { console.error("Failed to save experience:", error); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;
    try {
      const response = await authFetch(`${API_URL}/api/admin/experiences/${id}`, { method: "DELETE" });
      if (response.ok) await fetchExperiences();
    } catch (error) { console.error("Failed to delete experience:", error); }
  };

  const handleCancel = () => { setIsCreating(false); setEditingId(null); setFormData({}); };

  const handleLinkedInSync = async () => {
    setSyncing(true); setSyncResult(null);
    try {
      const response = await authFetch(`${API_URL}/api/admin/linkedin/sync`, { method: "POST" });
      const data = await response.json();
      setSyncResult({ success: data.success, message: data.message || data.error });
      if (data.success) await fetchExperiences();
    } catch { setSyncResult({ success: false, message: "Network error — pastikan backend berjalan." }); }
    finally { setSyncing(false); }
  };

  const handleLinkedInImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImporting(true); setImportResult(null);
    const fd = new FormData(); fd.append("file", file);
    try {
      const response = await authFetch(`${API_URL}/api/admin/linkedin/import`, { method: "POST", body: fd });
      const data = await response.json();
      setImportResult({ success: response.ok, message: data.message || data.error, skipped: data.skipped });
      if (response.ok) await fetchExperiences();
    } catch { setImportResult({ success: false, message: "Network error — pastikan backend berjalan." }); }
    finally { setImporting(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const addResponsibility = () => {
    if (responsibilityInput.trim()) {
      setFormData({ ...formData, responsibilities: [...(formData.responsibilities || []), responsibilityInput.trim()] });
      setResponsibilityInput("");
    }
  };

  const removeResponsibility = (index: number) => {
    setFormData({ ...formData, responsibilities: formData.responsibilities?.filter((_, i) => i !== index) || [] });
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData({ ...formData, skills: [...(formData.skills || []), skillInput.trim()] });
      setSkillInput("");
    }
  };

  const removeSkill = (index: number) => {
    setFormData({ ...formData, skills: formData.skills?.filter((_, i) => i !== index) || [] });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Experience</h1>
          <p className="text-sm text-muted-foreground mt-1">{experiences.length} entries</p>
        </div>
        {!isCreating && !editingId && (
          <Button onClick={handleCreate} size="sm" className="gap-2 rounded-lg">
            <Plus className="h-3.5 w-3.5" />
            Add Experience
          </Button>
        )}
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {(isCreating || editingId) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl bg-background border border-border/60 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {isCreating ? "New Experience" : "Edit Experience"}
                </h2>
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm" className="gap-1.5 rounded-lg">
                    <Save className="h-3.5 w-3.5" /> Save
                  </Button>
                  <Button onClick={handleCancel} size="sm" variant="ghost" className="gap-1.5">
                    <X className="h-3.5 w-3.5" /> Cancel
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Job Title *</label>
                  <Input value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Senior Full Stack Developer" className="bg-muted/30 border-border/60" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Company *</label>
                  <Input value={formData.company || ""} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="e.g. Tech Company Inc" className="bg-muted/30 border-border/60" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Location</label>
                  <Input value={formData.location || ""} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. San Francisco, CA" className="bg-muted/30 border-border/60" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Employment Type</label>
                  <select value={formData.employmentType || "Full-time"} onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })} className="w-full h-10 px-3 rounded-md border border-border/60 bg-muted/30 text-sm">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Start Date *</label>
                  <Input type="date" value={formData.startDate || ""} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="bg-muted/30 border-border/60" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">End Date</label>
                  <Input type="date" value={formData.endDate || ""} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} disabled={formData.current} className="bg-muted/30 border-border/60" />
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <input type="checkbox" checked={formData.current || false} onChange={(e) => setFormData({ ...formData, current: e.target.checked, endDate: "" })} className="h-4 w-4 rounded" />
                  <label className="text-sm">I currently work here</label>
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Description</label>
                  <Textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description of your role..." rows={3} className="bg-muted/30 border-border/60" />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Responsibilities</label>
                  <div className="flex gap-2">
                    <Input value={responsibilityInput} onChange={(e) => setResponsibilityInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addResponsibility())} placeholder="Add a responsibility..." className="bg-muted/30 border-border/60" />
                    <Button onClick={addResponsibility} size="sm" variant="outline" className="rounded-lg">Add</Button>
                  </div>
                  {(formData.responsibilities?.length ?? 0) > 0 && (
                    <div className="space-y-1.5">
                      {formData.responsibilities?.map((resp, index) => (
                        <div key={index} className="flex items-center gap-2 bg-muted/40 px-3 py-2 rounded-lg">
                          <span className="flex-1 text-sm">• {resp}</span>
                          <button onClick={() => removeResponsibility(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Skills</label>
                  <div className="flex gap-2">
                    <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} placeholder="Add a skill..." className="bg-muted/30 border-border/60" />
                    <Button onClick={addSkill} size="sm" variant="outline" className="rounded-lg">Add</Button>
                  </div>
                  {(formData.skills?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {formData.skills?.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="gap-1 pr-1 rounded-md">
                          {skill}
                          <button onClick={() => removeSkill(index)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Display Order</label>
                  <Input type="number" value={formData.order || 0} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} className="bg-muted/30 border-border/60 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.showOnAbout ?? true} onChange={(e) => setFormData({ ...formData, showOnAbout: e.target.checked })} className="h-4 w-4 rounded" />
                  <label className="text-sm">Show on About page</label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LinkedIn Sync — Collapsible */}
      <div className="rounded-xl bg-background border border-border/60 overflow-hidden">
        <button
          onClick={() => setLinkedInOpen(!linkedInOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10">
              <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">LinkedIn Sync</p>
              <p className="text-xs text-muted-foreground">Import experience from your profile</p>
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${linkedInOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {linkedInOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 border-t border-border/40">
                <p className="text-xs text-muted-foreground pt-3">
                  Butuh cookie <code className="bg-muted px-1 rounded text-[10px]">li_at</code> di <code className="bg-muted px-1 rounded text-[10px]">backend/.env</code>.
                </p>
                <details className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
                  <summary className="cursor-pointer font-medium text-foreground">Cara dapat cookie li_at</summary>
                  <ol className="mt-2 space-y-1 list-decimal list-inside">
                    <li>Buka <strong>linkedin.com</strong>, pastikan sudah login</li>
                    <li>Tekan <strong>F12</strong> → tab <strong>Application</strong></li>
                    <li>Kiri: <strong>Cookies → https://www.linkedin.com</strong></li>
                    <li>Cari baris <strong>li_at</strong>, copy Value-nya</li>
                    <li>Paste ke <code>backend/.env</code> → <code>LINKEDIN_LI_AT=paste_disini</code></li>
                    <li>Restart backend, lalu klik Sync</li>
                  </ol>
                </details>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button onClick={handleLinkedInSync} disabled={syncing} size="sm" variant="outline" className="gap-1.5 rounded-lg">
                    {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    {syncing ? "Syncing..." : "Sync dari LinkedIn"}
                  </Button>
                  {syncResult && (
                    <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md ${
                      syncResult.success ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-destructive/10 text-destructive"
                    }`}>
                      {syncResult.success ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      {syncResult.message}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Experience List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {experiences.map((exp) => (
            <motion.div
              key={exp.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-xl bg-background border border-border/60 p-5 hover:border-border transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-500/10 shrink-0 mt-0.5">
                    <Building2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{exp.title}</h3>
                      {!exp.showOnAbout && <Badge variant="secondary" className="text-[10px]">Hidden</Badge>}
                      {exp.employmentType && <Badge variant="outline" className="text-[10px]">{exp.employmentType}</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{exp.company}</span>
                      {exp.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{exp.location}</span>}
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(exp.startDate)} – {exp.current ? "Present" : exp.endDate ? formatDate(exp.endDate) : "N/A"}</span>
                    </div>
                    {exp.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{exp.description}</p>}
                    {exp.responsibilities.length > 0 && (
                      <ul className="text-xs text-muted-foreground mt-2 space-y-0.5">
                        {exp.responsibilities.slice(0, 3).map((resp, idx) => <li key={idx}>• {resp}</li>)}
                        {exp.responsibilities.length > 3 && <li className="text-muted-foreground/60">+{exp.responsibilities.length - 3} more</li>}
                      </ul>
                    )}
                    {exp.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {exp.skills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[10px] font-normal rounded-md">{skill}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button onClick={() => handleEdit(exp)} size="icon" variant="ghost" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button onClick={() => handleDelete(exp.id)} size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {experiences.length === 0 && !isCreating && (
          <div className="text-center py-16 text-muted-foreground">
            <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No experiences yet</p>
            <p className="text-xs mt-1">Click &quot;Add Experience&quot; to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

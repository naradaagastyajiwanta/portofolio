"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
    title: "",
    company: "",
    location: "",
    employmentType: "Full-time",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
    responsibilities: [],
    skills: [],
    order: 0,
    showOnAbout: true
  });
  const [responsibilityInput, setResponsibilityInput] = useState("");
  const [skillInput, setSkillInput] = useState("");

  // LinkedIn sync state
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // LinkedIn import state
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    skipped?: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const { authFetch, logout, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const response = await authFetch(`${API_URL}/api/admin/experiences`);
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = await response.json();
      setExperiences(data);
    } catch (error) {
      console.error("Failed to fetch experiences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      title: "",
      company: "",
      location: "",
      employmentType: "Full-time",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      current: false,
      description: "",
      responsibilities: [],
      skills: [],
      order: experiences.length,
      showOnAbout: true
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
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (response.ok) {
          await fetchExperiences();
          setIsCreating(false);
        }
      } else if (editingId) {
        const response = await authFetch(`${API_URL}/api/admin/experiences/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (response.ok) {
          await fetchExperiences();
          setEditingId(null);
        }
      }
    } catch (error) {
      console.error("Failed to save experience:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;

    try {
      const response = await authFetch(`${API_URL}/api/admin/experiences/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        await fetchExperiences();
      }
    } catch (error) {
      console.error("Failed to delete experience:", error);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({});
  };

  const handleLinkedInSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const response = await authFetch(`${API_URL}/api/admin/linkedin/sync`, { method: "POST" });
      const data = await response.json();
      setSyncResult({ success: data.success, message: data.message || data.error });
      if (data.success) await fetchExperiences();
    } catch {
      setSyncResult({ success: false, message: "Network error — pastikan backend berjalan." });
    } finally {
      setSyncing(false);
    }
  };

  const handleLinkedInImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await authFetch(`${API_URL}/api/admin/linkedin/import`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setImportResult({ success: response.ok, message: data.message || data.error, skipped: data.skipped });
      if (response.ok) {
        await fetchExperiences();
      }
    } catch {
      setImportResult({ success: false, message: "Network error — pastikan backend berjalan." });
    } finally {
      setImporting(false);
      // Reset input so file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const addResponsibility = () => {
    if (responsibilityInput.trim()) {
      setFormData({
        ...formData,
        responsibilities: [...(formData.responsibilities || []), responsibilityInput.trim()]
      });
      setResponsibilityInput("");
    }
  };

  const removeResponsibility = (index: number) => {
    setFormData({
      ...formData,
      responsibilities: formData.responsibilities?.filter((_, i) => i !== index) || []
    });
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData({
        ...formData,
        skills: [...(formData.skills || []), skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills?.filter((_, i) => i !== index) || []
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold">Experience Management</h1>
            {!isCreating && !editingId && (
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Experience
              </Button>
            )}
          </div>

          <div className="space-y-6">
          {/* Create/Edit Form */}
          {(isCreating || editingId) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-lg p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {isCreating ? "Add New Experience" : "Edit Experience"}
                </h2>
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} size="sm" variant="outline" className="gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium">Job Title *</label>
                  <Input
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Senior Full Stack Developer"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Company *</label>
                  <Input
                    value={formData.company || ""}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Tech Company Inc"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Employment Type</label>
                  <select
                    value={formData.employmentType || "Full-time"}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Start Date *</label>
                  <Input
                    type="date"
                    value={formData.startDate || ""}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={formData.endDate || ""}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    disabled={formData.current}
                  />
                </div>

                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.current || false}
                    onChange={(e) => setFormData({ ...formData, current: e.target.checked, endDate: "" })}
                    className="h-4 w-4"
                  />
                  <label className="text-sm">I currently work here</label>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of your role..."
                    rows={3}
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium">Responsibilities</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={responsibilityInput}
                      onChange={(e) => setResponsibilityInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addResponsibility())}
                      placeholder="Add a responsibility..."
                    />
                    <Button onClick={addResponsibility} size="sm">Add</Button>
                  </div>
                  <div className="space-y-2">
                    {formData.responsibilities?.map((resp, index) => (
                      <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
                        <span className="flex-1 text-sm">• {resp}</span>
                        <Button
                          onClick={() => removeResponsibility(index)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium">Skills</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      placeholder="Add a skill..."
                    />
                    <Button onClick={addSkill} size="sm">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills?.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {skill}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeSkill(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Display Order</label>
                  <Input
                    type="number"
                    value={formData.order || 0}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showOnAbout ?? true}
                    onChange={(e) => setFormData({ ...formData, showOnAbout: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <label className="text-sm">Show on About page</label>
                </div>
              </div>
            </motion.div>
          )}

          {/* LinkedIn Sync */}
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-1 w-10 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" />
              <h2 className="text-base font-semibold">Sync dari LinkedIn</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Otomatis ambil experience dari profil LinkedIn kamu. Butuh cookie{" "}
              <code className="bg-muted px-1 rounded text-xs">li_at</code> di{" "}
              <code className="bg-muted px-1 rounded text-xs">backend/.env</code>.
            </p>

            {/* Cara dapat li_at */}
            <details className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
              <summary className="cursor-pointer font-medium text-foreground">
                Cara dapat cookie li_at
              </summary>
              <ol className="mt-2 space-y-1 list-decimal list-inside">
                <li>Buka <strong>linkedin.com</strong> di browser, pastikan sudah login</li>
                <li>Tekan <strong>F12</strong> → tab <strong>Application</strong></li>
                <li>Kiri: <strong>Cookies → https://www.linkedin.com</strong></li>
                <li>Cari baris <strong>li_at</strong>, double-click kolom Value → copy</li>
                <li>Paste ke <code>backend/.env</code> → <code>LINKEDIN_LI_AT=paste_disini</code></li>
                <li>Restart backend, lalu klik Sync</li>
              </ol>
            </details>

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                onClick={handleLinkedInSync}
                disabled={syncing}
                className="gap-2"
              >
                {syncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {syncing ? "Syncing..." : "Sync dari LinkedIn"}
              </Button>

              {syncResult && (
                <div
                  className={`flex items-center gap-2 text-sm rounded-md px-3 py-2 ${
                    syncResult.success
                      ? "bg-green-500/10 text-green-600"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {syncResult.success ? (
                    <CheckCircle className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  {syncResult.message}
                </div>
              )}
            </div>
          </div>

          {/* Experience List */}
          <div className="space-y-4">
            {experiences.map((exp) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card border rounded-lg p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{exp.title}</h3>
                      {!exp.showOnAbout && (
                        <Badge variant="secondary">Hidden</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {exp.company}
                      </div>
                      {exp.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {exp.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(exp.startDate)} - {exp.current ? "Present" : exp.endDate ? formatDate(exp.endDate) : "N/A"}
                      </div>
                    </div>
                    {exp.employmentType && (
                      <Badge variant="outline">{exp.employmentType}</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(exp)}
                      size="sm"
                      variant="outline"
                      className="gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(exp.id)}
                      size="sm"
                      variant="outline"
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>

                {exp.description && (
                  <p className="text-sm text-muted-foreground">{exp.description}</p>
                )}

                {exp.responsibilities.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Responsibilities:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {exp.responsibilities.map((resp, idx) => (
                        <li key={idx}>• {resp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {exp.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}

            {experiences.length === 0 && !isCreating && (
              <div className="text-center py-12 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No experiences yet. Click "Add Experience" to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

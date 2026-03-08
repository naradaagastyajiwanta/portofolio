"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  User,
  Globe,
  Search as SearchIcon,
  Link2,
  Shield,
  Save,
  Loader2,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Briefcase,
  FileText,
  Server,
  AlertTriangle,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type SettingsData = Record<string, Record<string, string>>;

type Tab = "profile" | "social" | "seo" | "integrations" | "security";

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "social", label: "Social Links", icon: Link2 },
  { id: "seo", label: "SEO", icon: SearchIcon },
  { id: "integrations", label: "Integrations", icon: Server },
  { id: "security", label: "Security", icon: Shield },
];

export default function AdminSettingsPage() {
  const { authFetch, user } = useAuth();
  const [settings, setSettings] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [error, setError] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
  const [showPasswords, setShowPasswords] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/api/admin/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = (group: string, key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [group]: { ...(prev[group] || {}), [key]: value },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await authFetch(`${API_URL}/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to save settings");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMsg({ type: "", text: "" });

    if (!currentPassword || !newPassword) {
      setPasswordMsg({ type: "error", text: "Both fields are required" });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "New password must be at least 8 characters" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match" });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await authFetch(`${API_URL}/api/auth/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        setPasswordMsg({ type: "success", text: "Password changed. You will be logged out." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => window.location.href = "/admin/login", 2000);
      } else {
        const err = await res.json();
        setPasswordMsg({ type: "error", text: err.error || "Failed to change password" });
      }
    } catch {
      setPasswordMsg({ type: "error", text: "Network error" });
    } finally {
      setChangingPassword(false);
    }
  };

  const val = (group: string, key: string) => settings[group]?.[key] ?? "";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-500/10 flex items-center justify-center">
            <Settings className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your site configuration</p>
          </div>
        </div>
        {activeTab !== "security" && (
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="gap-2 rounded-lg"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : saved ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Tab navigation */}
      <div className="rounded-xl bg-background border border-border/60 p-1.5 flex items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "profile" && (
          <div className="rounded-xl bg-background border border-border/60 divide-y divide-border/40">
            <div className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Personal Info</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SettingField
                  label="Display Name"
                  icon={<User className="h-4 w-4" />}
                  value={val("profile", "display_name")}
                  onChange={(v) => updateSetting("profile", "display_name", v)}
                  placeholder="Your Name"
                />
                <SettingField
                  label="Title / Role"
                  icon={<Briefcase className="h-4 w-4" />}
                  value={val("profile", "title")}
                  onChange={(v) => updateSetting("profile", "title", v)}
                  placeholder="Full-Stack Developer"
                />
                <SettingField
                  label="Location"
                  icon={<MapPin className="h-4 w-4" />}
                  value={val("profile", "location")}
                  onChange={(v) => updateSetting("profile", "location", v)}
                  placeholder="Indonesia"
                />
                <SettingField
                  label="Years of Experience"
                  value={val("profile", "years_experience")}
                  onChange={(v) => updateSetting("profile", "years_experience", v)}
                  placeholder="3"
                  type="number"
                />
                <div className="sm:col-span-2">
                  <SettingField
                    label="Availability Status"
                    value={val("profile", "availability")}
                    onChange={(v) => updateSetting("profile", "availability", v)}
                    placeholder="Available for freelance work"
                  />
                </div>
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Bio</h2>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">About Me</label>
                <Textarea
                  value={val("profile", "bio")}
                  onChange={(e) => updateSetting("profile", "bio", e.target.value)}
                  rows={4}
                  className="bg-muted/30 border-border/60"
                  placeholder="Tell people about yourself..."
                />
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Media</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SettingField
                  label="Avatar URL"
                  value={val("profile", "avatar_url")}
                  onChange={(v) => updateSetting("profile", "avatar_url", v)}
                  placeholder="https://..."
                />
                <SettingField
                  label="Resume / CV URL"
                  icon={<FileText className="h-4 w-4" />}
                  value={val("profile", "resume_url")}
                  onChange={(v) => updateSetting("profile", "resume_url", v)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "social" && (
          <div className="rounded-xl bg-background border border-border/60 p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Social & Contact</h2>
            <div className="grid grid-cols-1 gap-4">
              <SettingField
                label="GitHub URL"
                icon={<Github className="h-4 w-4" />}
                value={val("social", "github_url")}
                onChange={(v) => updateSetting("social", "github_url", v)}
                placeholder="https://github.com/..."
              />
              <SettingField
                label="LinkedIn URL"
                icon={<Linkedin className="h-4 w-4" />}
                value={val("social", "linkedin_url")}
                onChange={(v) => updateSetting("social", "linkedin_url", v)}
                placeholder="https://linkedin.com/in/..."
              />
              <SettingField
                label="Twitter / X URL"
                value={val("social", "twitter_url")}
                onChange={(v) => updateSetting("social", "twitter_url", v)}
                placeholder="https://x.com/..."
              />
              <SettingField
                label="Email Address"
                icon={<Mail className="h-4 w-4" />}
                value={val("social", "email")}
                onChange={(v) => updateSetting("social", "email", v)}
                placeholder="your@email.com"
              />
            </div>
          </div>
        )}

        {activeTab === "seo" && (
          <div className="rounded-xl bg-background border border-border/60 p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Search Engine Optimization</h2>
            <SettingField
              label="Site Title"
              value={val("seo", "site_title")}
              onChange={(v) => updateSetting("seo", "site_title", v)}
              placeholder="NAJ — Full-Stack Developer Portfolio"
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Site Description</label>
              <Textarea
                value={val("seo", "site_description")}
                onChange={(e) => updateSetting("seo", "site_description", e.target.value)}
                rows={3}
                className="bg-muted/30 border-border/60"
                placeholder="A brief description for search engines..."
              />
              <p className="text-xs text-muted-foreground">
                {(val("seo", "site_description") || "").length}/160 characters recommended
              </p>
            </div>
            <SettingField
              label="Keywords"
              value={val("seo", "keywords")}
              onChange={(v) => updateSetting("seo", "keywords", v)}
              placeholder="developer,portfolio,full-stack,..."
              hint="Comma-separated keywords"
            />
            <SettingField
              label="OG Image URL"
              value={val("seo", "og_image_url")}
              onChange={(v) => updateSetting("seo", "og_image_url", v)}
              placeholder="https://... (1200×630 recommended)"
            />
            {val("seo", "site_title") && (
              <div className="rounded-lg bg-muted/30 border border-border/40 p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Search Preview</p>
                <div className="space-y-0.5">
                  <p className="text-blue-600 dark:text-blue-400 text-base font-medium truncate">
                    {val("seo", "site_title")}
                  </p>
                  <p className="text-green-700 dark:text-green-500 text-xs">
                    yoursite.com
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {val("seo", "site_description") || "No description set."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "integrations" && (
          <div className="space-y-4">
            {/* GitHub */}
            <div className="rounded-xl bg-background border border-border/60 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                <h2 className="text-sm font-semibold">GitHub</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SettingField
                  label="Username"
                  value={val("integrations", "github_username")}
                  onChange={(v) => updateSetting("integrations", "github_username", v)}
                  placeholder="your-github-username"
                />
                <SettingField
                  label="Personal Access Token"
                  value={val("integrations", "github_token")}
                  onChange={(v) => updateSetting("integrations", "github_token", v)}
                  placeholder="ghp_..."
                  secret
                />
              </div>
            </div>

            {/* LinkedIn */}
            <div className="rounded-xl bg-background border border-border/60 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Linkedin className="h-5 w-5" />
                <h2 className="text-sm font-semibold">LinkedIn</h2>
                <Badge variant="outline" className="text-[10px]">Advanced</Badge>
              </div>
              <SettingField
                label="Profile Slug"
                value={val("integrations", "linkedin_slug")}
                onChange={(v) => updateSetting("integrations", "linkedin_slug", v)}
                placeholder="your-slug-123456"
                hint="From linkedin.com/in/<slug>"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SettingField
                  label="li_at Cookie"
                  value={val("integrations", "linkedin_li_at")}
                  onChange={(v) => updateSetting("integrations", "linkedin_li_at", v)}
                  placeholder="AQEDATcM..."
                  secret
                />
                <SettingField
                  label="JSESSIONID"
                  value={val("integrations", "linkedin_jsessionid")}
                  onChange={(v) => updateSetting("integrations", "linkedin_jsessionid", v)}
                  placeholder="ajax:..."
                  secret
                />
              </div>
            </div>

            {/* Email / SMTP */}
            <div className="rounded-xl bg-background border border-border/60 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <h2 className="text-sm font-semibold">Email Notifications</h2>
                <Badge variant="outline" className="text-[10px]">Optional</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SettingField
                  label="SMTP Host"
                  value={val("integrations", "smtp_host")}
                  onChange={(v) => updateSetting("integrations", "smtp_host", v)}
                  placeholder="smtp.gmail.com"
                />
                <SettingField
                  label="SMTP Port"
                  value={val("integrations", "smtp_port")}
                  onChange={(v) => updateSetting("integrations", "smtp_port", v)}
                  placeholder="587"
                />
                <SettingField
                  label="SMTP User"
                  value={val("integrations", "smtp_user")}
                  onChange={(v) => updateSetting("integrations", "smtp_user", v)}
                  placeholder="you@gmail.com"
                  secret
                />
                <SettingField
                  label="SMTP Password"
                  value={val("integrations", "smtp_pass")}
                  onChange={(v) => updateSetting("integrations", "smtp_pass", v)}
                  placeholder="app-password"
                  secret
                />
              </div>
              <SettingField
                label="Notification Email"
                value={val("integrations", "notify_email")}
                onChange={(v) => updateSetting("integrations", "notify_email", v)}
                placeholder="you@email.com"
                hint="Where to receive contact form notifications"
              />
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-4">
            {/* Change Password */}
            <div className="rounded-xl bg-background border border-border/60 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                <h2 className="text-sm font-semibold">Change Password</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                After changing your password, all active sessions will be revoked and you will need to log in again.
              </p>
              <div className="max-w-md space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Current Password</label>
                  <div className="relative">
                    <Input
                      type={showPasswords ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-muted/30 border-border/60 pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-muted/30 border-border/60"
                    placeholder="Min 8 characters"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-muted/30 border-border/60"
                    placeholder="Re-enter new password"
                  />
                </div>

                {passwordMsg.text && (
                  <div
                    className={`rounded-lg px-4 py-2.5 text-sm ${
                      passwordMsg.type === "error"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    {passwordMsg.text}
                  </div>
                )}

                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-lg"
                >
                  {changingPassword ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <KeyRound className="h-3.5 w-3.5" />
                  )}
                  {changingPassword ? "Changing..." : "Change Password"}
                </Button>
              </div>
            </div>

            {/* Account info */}
            <div className="rounded-xl bg-background border border-border/60 p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <h2 className="text-sm font-semibold">Account Info</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Username</p>
                  <p className="font-medium">{user?.username || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <p className="font-medium">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Reusable setting field ──────────────────────────────────────────────────

function SettingField({
  label,
  value,
  onChange,
  placeholder,
  icon,
  hint,
  secret,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  hint?: string;
  secret?: boolean;
  type?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <div className="relative">
        <Input
          type={secret && !visible ? "password" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-muted/30 border-border/60 pr-10"
        />
        {secret && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setVisible(!visible)}
          >
            {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

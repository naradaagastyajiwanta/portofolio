"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  FolderGit2,
  Briefcase,
  Inbox,
  Eye,
  Star,
  Code,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  FileText,
  Send,
  Clock,
  Activity,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface DashboardStats {
  projects: { total: number; visible: number; featured: number };
  experiences: { total: number };
  messages: { total: number; unread: number; today: number };
  skills: { total: number };
  blog: { total: number; published: number; draft: number };
}

export default function AdminDashboardPage() {
  const { authFetch, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/api/admin/stats`);
      if (res.ok) setStats(await res.json());
    } catch {
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await authFetch(`${API_URL}/api/sync/github`, { method: "POST" });
      await fetchStats();
    } catch {
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const statCards = [
    {
      title: "Projects",
      href: "/admin/projects",
      icon: FolderGit2,
      value: stats?.projects.total ?? 0,
      accent: "text-blue-600 dark:text-blue-400",
      accentBg: "bg-blue-50 dark:bg-blue-500/10",
      sub: `${stats?.projects.visible ?? 0} visible · ${stats?.projects.featured ?? 0} featured`,
    },
    {
      title: "Experience",
      href: "/admin/experience",
      icon: Briefcase,
      value: stats?.experiences.total ?? 0,
      accent: "text-violet-600 dark:text-violet-400",
      accentBg: "bg-violet-50 dark:bg-violet-500/10",
      sub: "total entries",
    },
    {
      title: "Skills",
      href: "/admin/skills",
      icon: Code,
      value: stats?.skills?.total ?? 0,
      accent: "text-cyan-600 dark:text-cyan-400",
      accentBg: "bg-cyan-50 dark:bg-cyan-500/10",
      sub: "proficiencies",
    },
    {
      title: "Blog Posts",
      href: "/admin/blog",
      icon: FileText,
      value: stats?.blog?.total ?? 0,
      accent: "text-amber-600 dark:text-amber-400",
      accentBg: "bg-amber-50 dark:bg-amber-500/10",
      sub: `${stats?.blog?.published ?? 0} published · ${stats?.blog?.draft ?? 0} drafts`,
    },
    {
      title: "Messages",
      href: "/admin/messages",
      icon: Inbox,
      value: stats?.messages.total ?? 0,
      accent: "text-emerald-600 dark:text-emerald-400",
      accentBg: "bg-emerald-50 dark:bg-emerald-500/10",
      sub: `${stats?.messages.unread ?? 0} unread · ${stats?.messages.today ?? 0} today`,
    },
  ];

  const quickActions = [
    { label: "Manage Projects", desc: "Toggle visibility & featured", href: "/admin/projects", icon: FolderGit2, accent: "text-blue-600 dark:text-blue-400" },
    { label: "Edit Experience", desc: "Update work history", href: "/admin/experience", icon: Briefcase, accent: "text-violet-600 dark:text-violet-400" },
    { label: "Manage Skills", desc: "Update proficiencies", href: "/admin/skills", icon: Code, accent: "text-cyan-600 dark:text-cyan-400" },
    { label: "Write Blog Post", desc: "Create new content", href: "/admin/blog", icon: FileText, accent: "text-amber-600 dark:text-amber-400" },
    { label: "View Messages", desc: (stats?.messages.unread ?? 0) > 0 ? `${stats?.messages.unread} unread` : "All caught up", href: "/admin/messages", icon: Inbox, accent: "text-emerald-600 dark:text-emerald-400" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tracking-tight"
          >
            {greeting()}, {user?.displayName || user?.username || "Admin"} 👋
          </motion.h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s an overview of your portfolio
          </p>
        </div>
        <Button
          onClick={handleSync}
          variant="outline"
          size="sm"
          className="gap-2 rounded-lg"
          disabled={syncing}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync GitHub"}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
            >
              <Link href={card.href as any} className="block group">
                <div className="relative rounded-xl bg-background border border-border/60 p-5 hover:border-border hover:shadow-sm transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${card.accentBg}`}>
                      <Icon className={`h-4 w-4 ${card.accent}`} />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-all -translate-x-1 group-hover:translate-x-0" />
                  </div>
                  <div className="text-2xl font-bold tracking-tight">{card.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{card.title}</div>
                  <div className="text-[10px] text-muted-foreground/70 mt-2">{card.sub}</div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href as any}>
                <div className="rounded-xl bg-background border border-border/60 p-4 hover:border-border hover:shadow-sm transition-all duration-200 cursor-pointer group">
                  <Icon className={`h-4 w-4 ${action.accent} mb-2.5`} />
                  <div className="text-sm font-medium group-hover:text-foreground transition-colors">{action.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{action.desc}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Sync Action */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl bg-background border border-border/60 p-5"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">GitHub Sync</p>
            <p className="text-xs text-muted-foreground">Fetch latest repositories and update project data</p>
          </div>
          <Button
            onClick={handleSync}
            variant="outline"
            size="sm"
            disabled={syncing}
            className="gap-2 rounded-lg"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Now"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

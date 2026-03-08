"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderGit2,
  Briefcase,
  Inbox,
  Eye,
  Star,
  Code,
  RefreshCw,
  Loader2,
  ArrowRight,
  TrendingUp,
  Clock,
  FileText,
  Send,
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
  const { authFetch } = useAuth();
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
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    {
      title: "Projects",
      href: "/admin/projects",
      icon: FolderGit2,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      value: stats?.projects.total ?? 0,
      details: [
        { label: "Visible", value: stats?.projects.visible ?? 0, icon: Eye },
        { label: "Featured", value: stats?.projects.featured ?? 0, icon: Star },
      ],
    },
    {
      title: "Experience",
      href: "/admin/experience",
      icon: Briefcase,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      value: stats?.experiences.total ?? 0,
      details: [],
    },
    {
      title: "Skills",
      href: "/admin/skills",
      icon: Code,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      value: stats?.skills?.total ?? 0,
      details: [],
    },
    {
      title: "Messages",
      href: "/admin/messages",
      icon: Inbox,
      color: "text-green-500",
      bg: "bg-green-500/10",
      value: stats?.messages.total ?? 0,
      details: [
        { label: "Unread", value: stats?.messages.unread ?? 0, icon: Inbox },
        { label: "Today", value: stats?.messages.today ?? 0, icon: Clock },
      ],
    },
    {
      title: "Blog",
      href: "/admin/blog",
      icon: FileText,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      value: stats?.blog?.total ?? 0,
      details: [
        { label: "Published", value: stats?.blog?.published ?? 0, icon: Send },
        { label: "Drafts", value: stats?.blog?.draft ?? 0, icon: FileText },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Overview of your portfolio content
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={card.href}>
                  <div className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow group cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2.5 rounded-lg ${card.bg}`}>
                        <Icon className={`h-5 w-5 ${card.color}`} />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-3xl font-bold">{card.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{card.title}</div>
                    {card.details.length > 0 && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t">
                        {card.details.map((d) => {
                          const DIcon = d.icon;
                          return (
                            <span
                              key={d.label}
                              className="flex items-center gap-1 text-xs text-muted-foreground"
                            >
                              <DIcon className="h-3 w-3" />
                              {d.value} {d.label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Link href="/admin/projects">
              <div className="rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <FolderGit2 className="h-5 w-5 text-blue-500 mb-2" />
                <div className="text-sm font-medium">Manage Projects</div>
                <div className="text-xs text-muted-foreground">Toggle visibility & featured</div>
              </div>
            </Link>
            <Link href="/admin/experience">
              <div className="rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <Briefcase className="h-5 w-5 text-purple-500 mb-2" />
                <div className="text-sm font-medium">Edit Experience</div>
                <div className="text-xs text-muted-foreground">Add or update work history</div>
              </div>
            </Link>
            <Link href="/admin/skills">
              <div className="rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <Code className="h-5 w-5 text-cyan-500 mb-2" />
                <div className="text-sm font-medium">Manage Skills</div>
                <div className="text-xs text-muted-foreground">Update tech proficiencies</div>
              </div>
            </Link>
            <Link href="/admin/messages">
              <div className="rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <Inbox className="h-5 w-5 text-green-500 mb-2" />
                <div className="text-sm font-medium">View Messages</div>
                <div className="text-xs text-muted-foreground">
                  {(stats?.messages.unread ?? 0) > 0
                    ? `${stats?.messages.unread} unread`
                    : "All caught up"}
                </div>
              </div>
            </Link>
            <div
              onClick={handleSync}
              className="rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <TrendingUp className="h-5 w-5 text-orange-500 mb-2" />
              <div className="text-sm font-medium">Sync GitHub</div>
              <div className="text-xs text-muted-foreground">Fetch latest repositories</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

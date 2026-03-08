"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  FolderGit2,
  Briefcase,
  Inbox,
  Code,
  Shield,
  LogOut,
  ExternalLink,
  FileText,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, authFetch } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/api/admin/contact/stats`);
      if (res.ok) {
        const data = await res.json();
        setUnreadMessages(data.unread || 0);
      }
    } catch {}
  }, [authFetch]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [fetchUnread]);

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Projects", href: "/admin/projects", icon: FolderGit2 },
    { label: "Experience", href: "/admin/experience", icon: Briefcase },
    { label: "Skills", href: "/admin/skills", icon: Code },
    { label: "Blog", href: "/admin/blog", icon: FileText },
    { label: "Messages", href: "/admin/messages", icon: Inbox, badge: unreadMessages },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left: Nav links */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <Badge variant="default" className="h-5 min-w-[20px] px-1 text-[10px]">
                      {item.badge}
                    </Badge>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* Right: User + actions */}
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:flex gap-1.5 text-xs text-muted-foreground">
              <Link href="/" target="_blank">
                <ExternalLink className="h-3 w-3" />
                View Site
              </Link>
            </Button>
            {user && (
              <span className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground px-2">
                <Shield className="h-3 w-3" />
                {user.displayName || user.username}
              </span>
            )}
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={async () => {
                await logout();
                router.push("/admin/login");
              }}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

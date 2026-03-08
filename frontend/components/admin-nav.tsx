"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FolderGit2,
  Briefcase,
  Inbox,
  Code,
  LogOut,
  ExternalLink,
  FileText,
  ChevronLeft,
  Menu,
  Sparkles,
  Settings,
  Key,
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Projects", href: "/admin/projects", icon: FolderGit2 },
    { label: "Experience", href: "/admin/experience", icon: Briefcase },
    { label: "Skills", href: "/admin/skills", icon: Code },
    { label: "Blog", href: "/admin/blog", icon: FileText },
    { label: "Messages", href: "/admin/messages", icon: Inbox, badge: unreadMessages },
    { label: "API Tokens", href: "/admin/api-tokens", icon: Key },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={cn(
        "flex items-center h-14 px-4 border-b border-border/40",
        collapsed ? "justify-center" : "gap-3"
      )}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">Portfolio</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Admin</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href as any}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative group",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-primary/8 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
              )}
              <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-primary")} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.badge && item.badge > 0 ? (
                <span className="ml-auto flex items-center justify-center h-5 min-w-[20px] px-1.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
                  {item.badge}
                </span>
              ) : null}
              {collapsed && item.badge && item.badge > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 text-[9px] font-bold rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-md bg-popover border shadow-md text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className={cn("border-t border-border/40 p-3 space-y-1", collapsed && "px-2")}>
        <Link
          href="/"
          target="_blank"
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && <span>View Site</span>}
        </Link>

        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
              {(user.displayName || user.username || "A").charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user.displayName || user.username}</p>
              <p className="text-[10px] text-muted-foreground">Administrator</p>
            </div>
          </div>
        )}

        <div className={cn("flex items-center", collapsed ? "flex-col gap-1" : "gap-1 px-1")}>
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={async () => {
              await logout();
              router.push("/admin/login");
            }}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground ml-auto"
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 border-r border-border/40 bg-background/80 backdrop-blur-xl transition-all duration-200",
          collapsed ? "w-[60px]" : "w-[220px]"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-semibold">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={async () => {
                await logout();
                router.push("/admin/login");
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {mobileOpen && (
          <div className="border-t border-border/40 bg-background p-2">
            <nav className="flex flex-wrap gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href as any}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.badge && item.badge > 0 ? (
                      <span className="flex items-center justify-center h-4 min-w-[16px] px-1 text-[9px] font-bold rounded-full bg-primary text-primary-foreground">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

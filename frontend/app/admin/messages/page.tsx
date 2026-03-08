"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MailOpen,
  Reply,
  Archive,
  Trash2,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Globe,
  Inbox,
  MailCheck,
  Loader2,
  Eye,
  MessageSquare,
  MailX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  ipAddress: string | null;
  userAgent: string | null;
  repliedAt: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Mail }> = {
  unread: { label: "Unread", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Mail },
  read: { label: "Read", color: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: MailOpen },
  replied: { label: "Replied", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: Reply },
  archived: { label: "Archived", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: Archive },
};

export default function AdminContactPage() {
  const { authFetch } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchMessages = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (filterStatus !== "all") params.set("status", filterStatus);
      const res = await authFetch(`${API_URL}/api/admin/contact?${params}`);
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setMessages(data.messages);
      setPagination(data.pagination);
      setUnreadCount(data.unreadCount);
    } catch {
      console.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }, [authFetch, filterStatus, router]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  async function handleStatusChange(id: string, newStatus: string) {
    setActionLoading(id);
    try {
      await authFetch(`${API_URL}/api/admin/contact/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)));
      if (selectedMessage?.id === id) {
        setSelectedMessage((prev) => prev ? { ...prev, status: newStatus } : null);
      }
      setUnreadCount((prev) => {
        const oldMsg = messages.find((m) => m.id === id);
        if (oldMsg?.status === "unread" && newStatus !== "unread") return prev - 1;
        if (oldMsg?.status !== "unread" && newStatus === "unread") return prev + 1;
        return prev;
      });
    } catch {
      console.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this message?")) return;
    setActionLoading(id);
    try {
      await authFetch(`${API_URL}/api/admin/contact/${id}`, { method: "DELETE" });
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch {
      console.error("Failed to delete message");
    } finally {
      setActionLoading(null);
    }
  }

  function openMessage(msg: ContactMessage) {
    setSelectedMessage(msg);
    if (msg.status === "unread") handleStatusChange(msg.id, "read");
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const filteredMessages = searchQuery
    ? messages.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.message.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Messages
            {unreadCount > 0 && (
              <Badge className="text-xs">{unreadCount} new</Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            {pagination.total} total messages
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchMessages()} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: pagination.total, icon: MessageSquare, color: "text-primary" },
          { label: "Unread", value: unreadCount, icon: Mail, color: "text-blue-500" },
          { label: "Replied", value: messages.filter((m) => m.status === "replied").length, icon: Reply, color: "text-green-500" },
          { label: "Archived", value: messages.filter((m) => m.status === "archived").length, icon: Archive, color: "text-orange-500" },
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

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {["all", "unread", "read", "replied", "archived"].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className="h-8 text-xs"
            >
              {status === "all" ? "All" : STATUS_CONFIG[status]?.label || status}
            </Button>
          ))}
        </div>
      </div>

      {/* Content: Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[500px]">
        {/* Message List */}
        <div className="lg:col-span-2 space-y-1.5">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Loading messages...</p>
              </div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex p-4 rounded-2xl bg-muted/50 mb-4">
                <MailX className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="font-semibold mb-1">No messages found</h3>
              <p className="text-sm text-muted-foreground">
                {filterStatus !== "all" ? "Try a different filter" : "Messages will appear here when visitors contact you"}
              </p>
            </div>
          ) : (
            <>
              {filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                const isUnread = msg.status === "unread";
                return (
                  <motion.button
                    key={msg.id}
                    layout
                    onClick={() => openMessage(msg)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/50 bg-card hover:bg-muted/50 hover:border-border"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 transition-colors ${isUnread ? "bg-blue-500" : "bg-transparent"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm truncate ${isUnread ? "font-semibold" : "font-medium"}`}>
                            {msg.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{msg.email}</p>
                        {msg.subject && (
                          <p className={`text-sm truncate mt-1.5 ${isUnread ? "font-medium" : ""}`}>
                            {msg.subject}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground truncate mt-0.5 leading-relaxed">
                          {msg.message.substring(0, 100)}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <span className="text-xs text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={pagination.page <= 1} onClick={() => fetchMessages(pagination.page - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchMessages(pagination.page + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {selectedMessage ? (
              <motion.div
                key={selectedMessage.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-2xl border bg-card overflow-hidden sticky top-24"
              >
                {/* Detail Header */}
                <div className="p-6 border-b space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <h2 className="text-xl font-bold leading-tight">
                        {selectedMessage.subject || "No Subject"}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-3 w-3 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{selectedMessage.name}</span>
                        </div>
                        <span className="text-muted-foreground/60">&lt;{selectedMessage.email}&gt;</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={STATUS_CONFIG[selectedMessage.status]?.color || ""}>
                      {STATUS_CONFIG[selectedMessage.status]?.label || selectedMessage.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </span>
                    {selectedMessage.ipAddress && (
                      <span className="flex items-center gap-1.5">
                        <Globe className="h-3 w-3" />
                        {selectedMessage.ipAddress}
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Body */}
                <div className="p-6 min-h-[200px]">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedMessage.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="p-4 border-t bg-muted/20 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5" asChild>
                    <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || "Your message"}`}>
                      <Reply className="h-3.5 w-3.5" />
                      Reply via Email
                    </a>
                  </Button>
                  {selectedMessage.status !== "replied" && (
                    <Button size="sm" variant="outline" className="gap-1.5" disabled={actionLoading === selectedMessage.id} onClick={() => handleStatusChange(selectedMessage.id, "replied")}>
                      <MailCheck className="h-3.5 w-3.5" />
                      Mark Replied
                    </Button>
                  )}
                  {selectedMessage.status !== "unread" && (
                    <Button size="sm" variant="outline" className="gap-1.5" disabled={actionLoading === selectedMessage.id} onClick={() => handleStatusChange(selectedMessage.id, "unread")}>
                      <Mail className="h-3.5 w-3.5" />
                      Mark Unread
                    </Button>
                  )}
                  {selectedMessage.status !== "archived" && (
                    <Button size="sm" variant="outline" className="gap-1.5" disabled={actionLoading === selectedMessage.id} onClick={() => handleStatusChange(selectedMessage.id, "archived")}>
                      <Archive className="h-3.5 w-3.5" />
                      Archive
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1.5 ml-auto"
                    disabled={actionLoading === selectedMessage.id}
                    onClick={() => handleDelete(selectedMessage.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border bg-card flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="inline-flex p-4 rounded-2xl bg-muted/50 mb-4">
                  <Inbox className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="font-semibold mb-1">Select a message</h3>
                <p className="text-sm text-muted-foreground">Click on a message from the list to read it</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

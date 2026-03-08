"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Mail,
  User,
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Github,
  Linkedin,
  MapPin,
  Clock,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string; // honeypot
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactPage() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "", // honeypot
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errs.email = "Please enter a valid email";
    if (!form.message.trim()) errs.message = "Message is required";
    else if (form.message.trim().length < 10)
      errs.message = "Message must be at least 10 characters";
    else if (form.message.trim().length > 5000)
      errs.message = "Message is too long (max 5000 characters)";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim() || undefined,
          message: form.message.trim(),
          website: form.website, // honeypot
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitResult({ type: "error", message: data.error || "Failed to send message" });
        return;
      }

      setSubmitResult({ type: "success", message: data.message });
      setForm({ name: "", email: "", subject: "", message: "", website: "" });
      setErrors({});
    } catch {
      setSubmitResult({
        type: "error",
        message: "Network error. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  const charCount = form.message.length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-lg font-bold hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Home
            </Link>
            <ModeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Mail className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Get in Touch</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Let&apos;s Work Together
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have a project in mind or just want to say hello? I&apos;d love to hear from you.
              Fill out the form below and I&apos;ll get back to you as soon as possible.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Info Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Info Cards */}
              <div className="rounded-2xl border bg-card p-6 space-y-6">
                <h2 className="text-lg font-semibold">Contact Information</h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <a
                        href="mailto:naradaagastyajiwanta@gmail.com"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        naradaagastyajiwanta@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">Indonesia</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Response Time</p>
                      <p className="text-sm text-muted-foreground">
                        Usually within 24 hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="rounded-2xl border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">Find Me On</h2>
                <div className="space-y-3">
                  <Button asChild variant="outline" className="w-full justify-start gap-3 h-11">
                    <a href="https://github.com/naradaagastyajiwanta" target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start gap-3 h-11">
                    <a href="https://linkedin.com/in/narada-607387219" target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="rounded-2xl border bg-card p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {submitResult?.type === "success" ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center justify-center py-16 text-center space-y-4"
                    >
                      <div className="p-4 rounded-full bg-green-500/10">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-bold">Message Sent!</h3>
                      <p className="text-muted-foreground max-w-md">
                        Thank you for reaching out. I&apos;ll review your message and get back to you soon.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setSubmitResult(null)}
                        className="mt-4"
                      >
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      ref={formRef}
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      {/* Honeypot — hidden from users */}
                      <input
                        type="text"
                        name="website"
                        value={form.website}
                        onChange={(e) => handleChange("website", e.target.value)}
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                      />

                      {submitResult?.type === "error" && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
                        >
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          {submitResult.message}
                        </motion.div>
                      )}

                      {/* Name & Email row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            placeholder="Your name"
                            value={form.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className={errors.name ? "border-red-500" : ""}
                            maxLength={100}
                          />
                          {errors.name && (
                            <p className="text-xs text-red-500">{errors.name}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            Email <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            value={form.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            className={errors.email ? "border-red-500" : ""}
                          />
                          {errors.email && (
                            <p className="text-xs text-red-500">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          Subject
                          <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                        </label>
                        <Input
                          placeholder="What's this about?"
                          value={form.subject}
                          onChange={(e) => handleChange("subject", e.target.value)}
                          maxLength={200}
                        />
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                          Message <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                          placeholder="Tell me about your project, idea, or just say hello..."
                          value={form.message}
                          onChange={(e) => handleChange("message", e.target.value)}
                          className={`min-h-[160px] resize-y ${errors.message ? "border-red-500" : ""}`}
                          maxLength={5000}
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          {errors.message ? (
                            <p className="text-red-500">{errors.message}</p>
                          ) : (
                            <span>Min 10 characters</span>
                          )}
                          <span className={charCount > 4500 ? "text-orange-500" : ""}>
                            {charCount}/5000
                          </span>
                        </div>
                      </div>

                      {/* Submit */}
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="w-full gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} NAJ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

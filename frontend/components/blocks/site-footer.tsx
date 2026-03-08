'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Github, Linkedin, Mail, Twitter, ArrowUp, Heart, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Settings {
    profile: {
        display_name?: string
        title?: string
        email?: string
        location?: string
    }
    social: {
        github?: string
        linkedin?: string
        twitter?: string
    }
}

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
]

export function SiteFooter() {
    const [settings, setSettings] = useState<Settings | null>(null)

    useEffect(() => {
        fetch(`${API_URL}/api/settings/public`)
            .then((r) => r.json())
            .then((data) => setSettings(data))
            .catch(() => {})
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const name = settings?.profile?.display_name || 'NAJ'
    const email = settings?.profile?.email
    const location = settings?.profile?.location
    const github = settings?.social?.github
    const linkedin = settings?.social?.linkedin
    const twitter = settings?.social?.twitter

    const socialLinks = [
        github && { icon: Github, href: github, label: 'GitHub' },
        linkedin && { icon: Linkedin, href: linkedin, label: 'LinkedIn' },
        twitter && { icon: Twitter, href: twitter, label: 'Twitter' },
        email && { icon: Mail, href: `mailto:${email}`, label: 'Email' },
    ].filter(Boolean) as { icon: React.ComponentType<{ className?: string }>; href: string; label: string }[]

    return (
        <footer className="relative border-t border-border/40 bg-background/80 backdrop-blur-xl">
            {/* Scroll to top */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                <button
                    onClick={scrollToTop}
                    className="group flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border/50 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300"
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
            </div>

            <div className="mx-auto max-w-6xl px-6 pt-16 pb-8">
                {/* Top row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="inline-block">
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                {name}
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            Full-Stack Developer crafting modern web experiences with clean code and creative design.
                        </p>
                        {location && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                                <MapPin className="h-3 w-3" />
                                <span>{location}</span>
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Quick Links
                        </h4>
                        <nav className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href as any}
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Connect */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Connect
                        </h4>
                        <div className="flex items-center gap-3">
                            {socialLinks.map((link) => {
                                const Icon = link.icon
                                return (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            "flex items-center justify-center w-9 h-9 rounded-lg",
                                            "bg-muted/50 hover:bg-muted transition-all duration-300",
                                            "text-muted-foreground hover:text-foreground",
                                            "hover:scale-110"
                                        )}
                                        aria-label={link.label}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </a>
                                )
                            })}
                        </div>
                        {email && (
                            <a
                                href={`mailto:${email}`}
                                className="inline-block text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                {email}
                            </a>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                {/* Bottom row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
                    <p className="text-xs text-muted-foreground/60">
                        &copy; {new Date().getFullYear()} {name}. All rights reserved.
                    </p>
                    <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
                        Built with <Heart className="h-3 w-3 text-red-400 fill-red-400" /> using Next.js & TypeScript
                    </p>
                </div>
            </div>
        </footer>
    )
}

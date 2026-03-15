'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail, Github, Linkedin, Twitter, MapPin, Briefcase, Calendar, Award, Download, Sparkles, Zap, Target, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'
import type { SiteSettings } from '@/lib/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const transitionVariants = {
    item: {
        hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
    },
}

export function AboutPreview() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    useEffect(() => {
        fetch(`${API_URL}/api/settings/public`)
            .then((r) => r.json())
            .then((data) => setSettings(data))
            .catch(() => {});
    }, []);

    const location = settings?.profile?.location || 'Indonesia';
    const availability = settings?.profile?.availability || 'Available';
    const yearsExp = settings?.profile?.years_experience || '3';
    const bio = settings?.profile?.bio || "I'm a passionate full-stack developer with expertise in building modern web applications. My journey in software development started in 2020, and since then, I've been continuously learning and adapting to new technologies.";
    const githubUrl = settings?.social?.github_url || '';
    const linkedinUrl = settings?.social?.linkedin_url || '';
    const twitterUrl = settings?.social?.twitter_url || '';
    const email = settings?.social?.email || '';
    const resumeUrl = settings?.profile?.resume_url || '';
    const displayName = settings?.profile?.display_name || '';
    const title = settings?.profile?.title || '';
    const avatarUrl = settings?.profile?.avatar_url || '';

    const firstName = displayName?.split(' ')[0] || 'I';

    return (
        <section className="relative z-10 py-32 md:py-40 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
            </div>

            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    {/* Left Column - Avatar & Info */}
                    <div className="lg:col-span-5">
                        <AnimatedGroup variants={transitionVariants} className="space-y-8">
                            {/* Avatar - clean simple design */}
                            <div className="relative mx-auto w-fit">
                                {/* Main avatar */}
                                <div className="w-56 h-56 rounded-full overflow-hidden border-8 border-background shadow-2xl ring-4 ring-primary/20">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt={displayName || 'Profile'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                            <span className="text-white text-7xl font-bold">{displayName?.charAt(0) || 'N'}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Status indicator */}
                                <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-500 border-4 border-background rounded-full" />
                            </div>

                            {/* Quick stats cards */}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: Briefcase, label: 'Experience', value: `${yearsExp}+ Years`, color: 'from-blue-500 to-cyan-500' },
                                    { icon: MapPin, label: 'Location', value: location, color: 'from-purple-500 to-pink-500' },
                                    { icon: Target, label: 'Focus', value: 'Full-Stack', color: 'from-green-500 to-emerald-500' },
                                    { icon: Heart, label: 'Status', value: 'Available', color: 'from-orange-500 to-red-500' },
                                ].map((item, idx) => (
                                    <div key={idx} className="group relative p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                        <div className={cn('absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300', item.color)} />
                                        <div className="relative">
                                            <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3', item.color)}>
                                                <item.icon className="h-5 w-5 text-white" />
                                            </div>
                                            <p className="text-xs text-muted-foreground">{item.label}</p>
                                            <p className="text-lg font-bold">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AnimatedGroup>
                    </div>

                    {/* Right Column - Bio & CTA */}
                    <div className="lg:col-span-7">
                        <AnimatedGroup variants={transitionVariants} className="space-y-8">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                                <Zap className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-primary">About Me</span>
                            </div>

                            {/* Heading */}
                            <div className="space-y-4">
                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                                    <span className="text-muted-foreground">Hi, I'm </span>
                                    <span>
                                        {displayName || 'Developer'}
                                    </span>
                                </h1>
                                <p className="text-xl md:text-2xl text-muted-foreground font-light">
                                    {title || 'Full-Stack Developer'}
                                </p>
                            </div>

                            {/* Bio */}
                            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed max-w-2xl">
                                <p>{bio}</p>
                            </div>

                            {/* Skills tags */}
                            <div className="flex flex-wrap gap-2">
                                {['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Docker'].map((skill) => (
                                    <Badge key={skill} variant="secondary" className="px-4 py-1 text-sm">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>

                            {/* Social Links */}
                            <div className="pt-4">
                                <p className="text-sm font-medium mb-4 text-muted-foreground">Let's Connect</p>
                                <div className="flex flex-wrap gap-3">
                                    {githubUrl && (
                                        <Button asChild className="gap-2 hover:scale-105 transition-transform">
                                            <Link href={githubUrl as any} target="_blank">
                                                <Github className="h-5 w-5" />
                                                <span>GitHub</span>
                                            </Link>
                                        </Button>
                                    )}
                                    {linkedinUrl && (
                                        <Button asChild variant="outline" className="gap-2 hover:scale-105 transition-transform">
                                            <Link href={linkedinUrl as any} target="_blank">
                                                <Linkedin className="h-5 w-5" />
                                                <span>LinkedIn</span>
                                            </Link>
                                        </Button>
                                    )}
                                    {twitterUrl && (
                                        <Button asChild variant="outline" className="gap-2 hover:scale-105 transition-transform">
                                            <Link href={twitterUrl as any} target="_blank">
                                                <Twitter className="h-5 w-5" />
                                                <span>Twitter</span>
                                            </Link>
                                        </Button>
                                    )}
                                    {email && (
                                        <Button asChild variant="outline" className="gap-2 hover:scale-105 transition-transform">
                                            <Link href={`mailto:${email}` as any}>
                                                <Mail className="h-5 w-5" />
                                                <span>Email</span>
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-4 pt-4">
                                <Button asChild size="lg" className="gap-2 text-base px-8">
                                    <Link href="/about">
                                        <span>More About Me</span>
                                    </Link>
                                </Button>
                                <Button asChild size="lg" variant="outline" className="gap-2 text-base px-8">
                                    <Link href="/projects">
                                        <span>View My Work</span>
                                    </Link>
                                </Button>
                                {resumeUrl && (
                                    <Button asChild size="lg" variant="ghost" className="gap-2">
                                        <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                            <Download className="h-4 w-4" />
                                            <span>Resume</span>
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </AnimatedGroup>
                    </div>
                </div>
            </div>
        </section>
    )
}

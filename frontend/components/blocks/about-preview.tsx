'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail, Github, Linkedin, Twitter, MapPin, Briefcase, Calendar, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SiteSettings } from '@/lib/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
    const bio1 = settings?.profile?.bio || "I'm a passionate full-stack developer with expertise in building modern web applications. My journey in software development started in 2020, and since then, I've been continuously learning and adapting to new technologies.";
    const githubUrl = settings?.social?.github_url || '';
    const linkedinUrl = settings?.social?.linkedin_url || '';
    const twitterUrl = settings?.social?.twitter_url || '';
    const email = settings?.social?.email || '';

    return (
        <section className="relative z-10 py-32 md:py-40">
            <div className="mx-auto max-w-6xl px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Avatar + Key Info */}
                    <div className="space-y-6">
                        {/* Avatar */}
                        <div className="relative mx-auto lg:mx-0 w-fit">
                            <div className="bg-gradient-to-br from-primary/20 via-background to-secondary/20 rounded-2xl p-1">
                                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8">
                                    <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl w-48 h-48 flex items-center justify-center">
                                        <span className="text-white text-8xl font-bold">N</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Info Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl p-4 space-y-2 bg-muted/30 backdrop-blur-sm">
                                <MapPin className="h-5 w-5 text-primary" />
                                <p className="text-sm font-medium">Based in</p>
                                <p className="text-lg font-bold">{location}</p>
                            </div>
                            <div className="rounded-xl p-4 space-y-2 bg-muted/30 backdrop-blur-sm">
                                <Briefcase className="h-5 w-5 text-primary" />
                                <p className="text-sm font-medium">Status</p>
                                <p className="text-lg font-bold">{availability}</p>
                            </div>
                            <div className="rounded-xl p-4 space-y-2 bg-muted/30 backdrop-blur-sm">
                                <Calendar className="h-5 w-5 text-primary" />
                                <p className="text-sm font-medium">Experience</p>
                                <p className="text-lg font-bold">{yearsExp}+ Years</p>
                            </div>
                            <div className="rounded-xl p-4 space-y-2 bg-muted/30 backdrop-blur-sm">
                                <Award className="h-5 w-5 text-primary" />
                                <p className="text-sm font-medium">Focus</p>
                                <p className="text-lg font-bold">Full-Stack</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Bio + CTA */}
                    <div className="space-y-6 text-center lg:text-left">
                        <div className="space-y-2">
                            <Badge variant="outline" className="mb-2">About Me</Badge>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                                Hi, I'm a Full-Stack Developer
                            </h2>
                        </div>

                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p>{bio1}</p>
                            <p>
                                I specialize in Next.js, TypeScript, and modern frontend/backend technologies.
                                I believe in writing clean, maintainable code and creating user experiences that are both
                                beautiful and functional.
                            </p>
                        </div>

                        {/* Social Links */}
                        <div className="pt-4">
                            <p className="text-sm font-medium mb-3">Let's Connect</p>
                            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                {githubUrl && (
                                <Button asChild variant="outline" size="sm" className="gap-2">
                                    <Link href={githubUrl as any} target="_blank">
                                        <Github className="h-4 w-4" />
                                        <span>GitHub</span>
                                    </Link>
                                </Button>
                                )}
                                {linkedinUrl && (
                                <Button asChild variant="outline" size="sm" className="gap-2">
                                    <Link href={linkedinUrl as any} target="_blank">
                                        <Linkedin className="h-4 w-4" />
                                        <span>LinkedIn</span>
                                    </Link>
                                </Button>
                                )}
                                {twitterUrl && (
                                <Button asChild variant="outline" size="sm" className="gap-2">
                                    <Link href={twitterUrl as any} target="_blank">
                                        <Twitter className="h-4 w-4" />
                                        <span>Twitter</span>
                                    </Link>
                                </Button>
                                )}
                                {email && (
                                <Button asChild variant="outline" size="sm" className="gap-2">
                                    <Link href={`mailto:${email}` as any}>
                                        <Mail className="h-4 w-4" />
                                        <span>Email</span>
                                    </Link>
                                </Button>
                                )}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex flex-wrap gap-3 pt-4 justify-center lg:justify-start">
                            <Button asChild size="lg" className="gap-2">
                                <Link href="/about">
                                    <span>More About Me</span>
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="gap-2">
                                <Link href="/projects">
                                    <span>View My Work</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

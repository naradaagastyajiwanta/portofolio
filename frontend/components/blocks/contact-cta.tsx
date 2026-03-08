'use client'
import React from 'react'
import Link from 'next/link'
import { Mail, Github, Linkedin, Twitter, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export function ContactCTA() {
    return (
        <section className="relative z-10 py-32 md:py-40">
            <div className="mx-auto max-w-4xl px-6">
                <AnimatedGroup variants={transitionVariants}>
                    {/* Main CTA Card */}
                    <div className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 rounded-3xl border border-primary/20 overflow-hidden">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

                        <div className="relative px-8 py-16 md:px-12 md:py-20 text-center">
                            {/* Icon */}
                            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg mb-6">
                                <Sparkles className="h-8 w-8 text-white" />
                            </div>

                            {/* Heading */}
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">
                                Let's Work Together
                            </h2>

                            {/* Description */}
                            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Have a project in mind or want to discuss opportunities?
                                I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
                            </p>

                            {/* Primary CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                                <Button
                                    asChild
                                    size="lg"
                                    className="gap-2 text-lg px-8 py-6 h-auto rounded-xl">
                                    <Link href="mailto:contact@naj.dev">
                                        <Mail className="h-5 w-5" />
                                        <span>Send Email</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="gap-2 text-lg px-8 py-6 h-auto rounded-xl">
                                    <Link href="/projects">
                                        <span>View Projects</span>
                                    </Link>
                                </Button>
                            </div>

                            {/* Social Links */}
                            <div className="space-y-4">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Or connect with me on
                                </p>
                                <div className="flex flex-wrap gap-3 justify-center">
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 rounded-xl">
                                        <Link href="https://github.com/naradaagastyajiwanta" target="_blank">
                                            <Github className="h-4 w-4" />
                                            <span>GitHub</span>
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 rounded-xl">
                                        <Link href="https://linkedin.com" target="_blank">
                                            <Linkedin className="h-4 w-4" />
                                            <span>LinkedIn</span>
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 rounded-xl">
                                        <Link href="https://twitter.com" target="_blank">
                                            <Twitter className="h-4 w-4" />
                                            <span>Twitter</span>
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="mt-12 pt-8 border-t border-border/50">
                                <p className="text-sm text-muted-foreground">
                                    📧 contact@naj.dev
                                    <span className="mx-2">•</span>
                                    📍 Based in Indonesia
                                    <span className="mx-2">•</span>
                                    💼 Available for freelance work
                                </p>
                            </div>
                        </div>
                    </div>
                </AnimatedGroup>
            </div>
        </section>
    )
}

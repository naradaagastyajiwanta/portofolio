'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Github, ExternalLink, Star, Code2, Smartphone, Globe, Database, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

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

interface Project {
    id: string
    name: string
    description: string
    stars: number
    techStack: string[]
    githubUrl?: string
    liveUrl?: string
    category: 'web' | 'mobile' | 'api' | 'tool'
    featured: boolean
}

const categoryIcons = {
    web: Globe,
    mobile: Smartphone,
    api: Database,
    tool: Code2,
}

const categoryColors = {
    web: 'from-blue-500 to-cyan-500',
    mobile: 'from-purple-500 to-pink-500',
    api: 'from-green-500 to-emerald-500',
    tool: 'from-orange-500 to-red-500',
}

export function ProjectsShowcase() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'web' | 'mobile' | 'api' | 'tool'>('all')

    useEffect(() => {
        console.log('ProjectsShowcase mounted, API_URL:', API_URL) // Debug log
        const fetchProjectsData = async () => {
            try {
                const url = `${API_URL}/api/projects`
                console.log('Fetching from:', url) // Debug log
                const response = await fetch(url)
                console.log('Response status:', response.status) // Debug log

                if (response.ok) {
                    const data = await response.json()
                    console.log('Raw API response:', data) // Debug log

                    // API returns array directly OR { projects: [...] }
                    let projectsArray: any[] = []
                    if (Array.isArray(data)) {
                        projectsArray = data
                    } else if (data && Array.isArray(data.projects)) {
                        projectsArray = data.projects
                    }
                    console.log('Fetched projects:', projectsArray) // Debug log

                    // Map projects ke format yang dibutuhkan
                    const mappedProjects = projectsArray.slice(0, 6).map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        description: p.description || 'A modern web application built with cutting-edge technologies',
                        stars: p.stars || 0,
                        techStack: p.techStack || [],
                        githubUrl: p.url,
                        liveUrl: p.url,
                        category: 'web' as const,
                        featured: p.featured || false
                    }))
                    console.log('Mapped projects:', mappedProjects) // Debug log
                    setProjects(mappedProjects)
                } else {
                    console.error('Failed to fetch projects:', response.status)
                }
            } catch (error) {
                console.error('Failed to fetch projects:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProjectsData()
    }, [])

    const filteredProjects = filter === 'all'
        ? projects
        : projects.filter(p => p.category === filter)

    if (loading) {
        return (
            <section className="relative z-10 py-32 md:py-40">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="relative z-10 py-32 md:py-40">
            <div className="mx-auto max-w-6xl px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <AnimatedGroup variants={transitionVariants}>
                        <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                            <Code2 className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Featured Work</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Projects Showcase
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            A selection of projects I've built with modern technologies
                        </p>
                    </AnimatedGroup>
                </div>

                {/* Filter Buttons */}
                <AnimatedGroup variants={transitionVariants} className="flex flex-wrap justify-center gap-3 mb-12">
                    {[
                        { value: 'all', label: 'All Projects' },
                        { value: 'web', label: 'Web Apps' },
                        { value: 'mobile', label: 'Mobile' },
                        { value: 'api', label: 'APIs' },
                        { value: 'tool', label: 'Tools' },
                    ].map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value as typeof filter)}
                            className={cn(
                                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                                filter === f.value
                                    ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:scale-105'
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </AnimatedGroup>

                {/* Projects Grid */}
                <AnimatedGroup
                    variants={{
                        container: {
                            visible: {
                                transition: {
                                    staggerChildren: 0.15,
                                    delayChildren: 0.3,
                                },
                            },
                        },
                        ...transitionVariants,
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => {
                        const Icon = categoryIcons[project.category]
                        const gradient = categoryColors[project.category]

                        return (
                            <div
                                key={project.id}
                                className="group relative bg-card/50 backdrop-blur-sm rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
                                {/* Gradient Overlay */}
                                <div className={cn(
                                    'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500',
                                    gradient
                                )} />

                                <div className="relative">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={cn(
                                            'p-2.5 rounded-xl bg-gradient-to-br shadow-lg',
                                            gradient
                                        )}>
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm font-medium">{project.stars}</span>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                        {project.name}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {project.description}
                                    </p>

                                    {/* Tech Stack */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {project.techStack.slice(0, 4).map((tech) => (
                                            <Badge key={tech} variant="secondary" className="text-xs">
                                                {tech}
                                            </Badge>
                                        ))}
                                        {project.techStack.length > 4 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{project.techStack.length - 4}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Links */}
                                    <div className="flex gap-2">
                                        {project.githubUrl && (
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 gap-2">
                                                <Link href={project.githubUrl as any} target="_blank">
                                                    <Github className="h-4 w-4" />
                                                    <span>Code</span>
                                                </Link>
                                            </Button>
                                        )}
                                        {project.liveUrl && (
                                            <Button
                                                asChild
                                                size="sm"
                                                className="flex-1 gap-2">
                                                <Link href={project.liveUrl as any} target="_blank">
                                                    <ExternalLink className="h-4 w-4" />
                                                    <span>Live</span>
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {filteredProjects.length === 0 && (
                        <div className="col-span-full text-center py-16">
                            <Code2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                            <p className="text-muted-foreground">No projects found in this category</p>
                        </div>
                    )}
                </AnimatedGroup>

                {/* CTA */}
                <AnimatedGroup
                    variants={transitionVariants}
                    className="text-center mt-16">
                    <Button
                        asChild
                        size="lg"
                        className="gap-2">
                        <Link href="/projects">
                            <span>View All Projects</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </AnimatedGroup>
            </div>
        </section>
    )
}

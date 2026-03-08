'use client'
import React, { useState, useEffect } from 'react'
import { Code2, Database, Server, Layout, Wrench, Cpu, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface SkillItem {
    name: string
    level: number
}

interface StackGroup {
    category: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    order: number
    skills: SkillItem[]
}

const categoryConfig: Record<string, {
    icon: React.ComponentType<{ className?: string }>
    color: string
    order: number
}> = {
    Language: { icon: Code2, color: 'from-blue-500 to-cyan-500', order: 0 },
    Frontend: { icon: Layout, color: 'from-emerald-500 to-teal-500', order: 1 },
    Backend: { icon: Server, color: 'from-violet-500 to-purple-500', order: 2 },
    Database: { icon: Database, color: 'from-orange-500 to-amber-500', order: 3 },
    DevOps: { icon: Layers, color: 'from-red-500 to-rose-500', order: 4 },
    Tools: { icon: Wrench, color: 'from-indigo-500 to-blue-500', order: 5 },
}

const fallbackConfig = { icon: Cpu, color: 'from-gray-500 to-slate-500', order: 99 }

function buildStacks(apiSkills: { name: string; level: number; category: string }[]): StackGroup[] {
    if (apiSkills.length > 0) {
        const grouped: Record<string, SkillItem[]> = {}
        for (const skill of apiSkills) {
            if (!grouped[skill.category]) grouped[skill.category] = []
            grouped[skill.category].push({ name: skill.name, level: skill.level })
        }
        return Object.entries(grouped)
            .map(([category, items]) => ({
                category,
                skills: items.sort((a, b) => b.level - a.level),
                ...(categoryConfig[category] || fallbackConfig),
            }))
            .sort((a, b) => a.order - b.order)
    }

    // Fallback hardcoded data
    return [
        {
            category: 'Frontend',
            ...categoryConfig['Frontend'],
            skills: [
                { name: 'TypeScript', level: 95 },
                { name: 'React', level: 92 },
                { name: 'Next.js', level: 90 },
                { name: 'Tailwind CSS', level: 95 },
            ],
        },
        {
            category: 'Backend',
            ...categoryConfig['Backend'],
            skills: [
                { name: 'Node.js', level: 88 },
                { name: 'Python', level: 85 },
                { name: 'Express', level: 85 },
                { name: 'REST APIs', level: 90 },
            ],
        },
        {
            category: 'Database',
            ...categoryConfig['Database'],
            skills: [
                { name: 'PostgreSQL', level: 88 },
                { name: 'Prisma ORM', level: 90 },
                { name: 'MongoDB', level: 80 },
            ],
        },
        {
            category: 'DevOps',
            ...categoryConfig['DevOps'],
            skills: [
                { name: 'Git', level: 95 },
                { name: 'Docker', level: 82 },
                { name: 'Linux', level: 80 },
                { name: 'CI/CD', level: 78 },
            ],
        },
    ]
}

export function TechStack() {
    const [stacks, setStacks] = useState<StackGroup[]>(() => buildStacks([]))

    useEffect(() => {
        fetch(`${API_URL}/api/skills`)
            .then((r) => r.json())
            .then((data) => {
                if (data.skills?.length > 0) {
                    setStacks(buildStacks(data.skills))
                }
            })
            .catch(() => {})
    }, [])

    return (
        <section className="relative z-10 py-32 md:py-40">
            <div className="mx-auto max-w-6xl px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-block border rounded-full px-3 py-1 text-xs font-medium mb-4">
                        Skills &amp; Technologies
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Tech Stack
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Technologies and tools I use to bring ideas to life
                    </p>
                </div>

                {/* Tech Stack Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stacks.map((stack) => {
                        const Icon = stack.icon
                        return (
                            <div
                                key={stack.category}
                                className="group relative bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-6 hover:shadow-lg hover:border-border/60 transition-all duration-300">
                                {/* Gradient hover overlay */}
                                <div className={cn(
                                    "absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                                    stack.color
                                )} />

                                {/* Category Header */}
                                <div className="flex items-center gap-3 mb-6 relative">
                                    <div className={cn(
                                        "p-2.5 rounded-lg bg-gradient-to-br",
                                        stack.color
                                    )}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold">{stack.category}</h3>
                                </div>

                                {/* Skills List */}
                                <div className="space-y-3 relative">
                                    {stack.skills.map((skill) => (
                                        <div key={skill.name} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{skill.name}</span>
                                                <span className="text-muted-foreground text-xs">
                                                    {skill.level}%
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full bg-gradient-to-r rounded-full",
                                                        stack.color
                                                    )}
                                                    style={{ width: `${skill.level}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Footer */}
                <div className="text-center mt-12">
                    <p className="text-muted-foreground">
                        Always learning and expanding my tech stack 🚀
                    </p>
                </div>
            </div>
        </section>
    )
}

'use client'
import React from 'react'
import { Code2, Database, Server, Layout, Wrench, Cpu } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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

interface TechSkill {
    name: string
    category: string
    level?: number
}

const techStacks: {
    category: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    skills: TechSkill[]
}[] = [
    {
        category: 'Frontend',
        icon: Layout,
        color: 'from-blue-500 to-cyan-500',
        skills: [
            { name: 'TypeScript', level: 95 },
            { name: 'JavaScript', level: 98 },
            { name: 'React', level: 92 },
            { name: 'Next.js', level: 90 },
            { name: 'Tailwind CSS', level: 95 },
            { name: 'HTML/CSS', level: 98 },
        ]
    },
    {
        category: 'Backend',
        icon: Server,
        color: 'from-green-500 to-emerald-500',
        skills: [
            { name: 'Node.js', level: 88 },
            { name: 'Python', level: 85 },
            { name: 'FastAPI', level: 82 },
            { name: 'Express', level: 85 },
            { name: 'REST APIs', level: 90 },
        ]
    },
    {
        category: 'Database',
        icon: Database,
        color: 'from-purple-500 to-pink-500',
        skills: [
            { name: 'PostgreSQL', level: 88 },
            { name: 'MySQL', level: 85 },
            { name: 'Prisma ORM', level: 90 },
            { name: 'MongoDB', level: 80 },
        ]
    },
    {
        category: 'DevOps & Tools',
        icon: Wrench,
        color: 'from-orange-500 to-red-500',
        skills: [
            { name: 'Git', level: 95 },
            { name: 'Docker', level: 82 },
            { name: 'Linux', level: 80 },
            { name: 'CI/CD', level: 78 },
            { name: 'AWS', level: 75 },
        ]
    },
    {
        category: 'Mobile & Other',
        icon: Cpu,
        color: 'from-indigo-500 to-violet-500',
        skills: [
            { name: 'React Native', level: 75 },
            { name: 'Electron', level: 70 },
            { name: 'GraphQL', level: 80 },
            { name: 'WebRTC', level: 72 },
        ]
    },
]

export function TechStack() {
    return (
        <section className="relative z-10 py-24 md:py-32 bg-muted/30">
            <div className="mx-auto max-w-6xl px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <AnimatedGroup variants={transitionVariants}>
                        <Badge variant="outline" className="mb-4">Skills & Technologies</Badge>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Tech Stack
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Technologies and tools I use to bring ideas to life
                        </p>
                    </AnimatedGroup>
                </div>

                {/* Tech Stack Grid */}
                <AnimatedGroup
                    variants={{
                        container: {
                            visible: {
                                transition: {
                                    staggerChildren: 0.1,
                                    delayChildren: 0.2,
                                },
                            },
                        },
                        ...transitionVariants,
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {techStacks.map((stack) => {
                        const Icon = stack.icon
                        return (
                            <div
                                key={stack.category}
                                className="group relative bg-card rounded-2xl border p-6 hover:shadow-lg transition-all duration-300">
                                {/* Gradient Border Effect */}
                                <div className={cn(
                                    "absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                                    stack.color
                                )} />

                                {/* Header */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={cn(
                                        "p-2.5 rounded-lg bg-gradient-to-br",
                                        stack.color
                                    )}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold">{stack.category}</h3>
                                </div>

                                {/* Skills List */}
                                <div className="space-y-3">
                                    {stack.skills.map((skill) => (
                                        <div key={skill.name} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{skill.name}</span>
                                                {skill.level && (
                                                    <span className="text-muted-foreground text-xs">
                                                        {skill.level}%
                                                    </span>
                                                )}
                                            </div>
                                            {skill.level && (
                                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full bg-gradient-to-r rounded-full transition-all duration-1000",
                                                            stack.color
                                                        )}
                                                        style={{ width: `${skill.level}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </AnimatedGroup>

                {/* Footer Note */}
                <AnimatedGroup
                    variants={transitionVariants}
                    className="text-center mt-12">
                    <p className="text-muted-foreground">
                        Always learning and expanding my tech stack 🚀
                    </p>
                </AnimatedGroup>
            </div>
        </section>
    )
}

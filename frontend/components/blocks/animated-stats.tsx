'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Code2, Star, Trophy, Zap, Target } from 'lucide-react'
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
};

interface StatItem {
    icon: React.ComponentType<{ className?: string }>
    value: number
    label: string
    suffix: string
    color: string
    gradient: string
}

const stats: StatItem[] = [
    {
        icon: Code2,
        value: 15,
        label: 'Projects Built',
        suffix: '+',
        color: 'from-blue-500 to-cyan-500',
        gradient: 'shadow-blue-500/20',
    },
    {
        icon: Star,
        value: 427,
        label: 'GitHub Stars',
        suffix: '+',
        color: 'from-yellow-500 to-orange-500',
        gradient: 'shadow-yellow-500/20',
    },
    {
        icon: Trophy,
        value: 3,
        label: 'Years Experience',
        suffix: '+',
        color: 'from-purple-500 to-pink-500',
        gradient: 'shadow-purple-500/20',
    },
    {
        icon: Zap,
        value: 20,
        label: 'Technologies',
        suffix: '+',
        color: 'from-green-500 to-emerald-500',
        gradient: 'shadow-green-500/20',
    },
]

function useCounter(end: number, duration: number = 2000) {
    const [count, setCount] = useState(0)
    const [isVisible, setIsVisible] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.1 }
        )

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (!isVisible) return

        let startTime: number | null = null
        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime
            const progress = Math.min((currentTime - startTime) / duration, 1)

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4)
            setCount(Math.floor(easeOutQuart * end))

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }, [isVisible, end, duration])

    return { count, ref }
}

function StatCard({ stat, index }: { stat: StatItem; index: number }) {
    const { count, ref } = useCounter(stat.value, 2500)

    return (
        <div ref={ref} className="relative group">
            {/* Glow Effect */}
            <div className={cn(
                'absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl',
                stat.color
            )} />

            {/* Card */}
            <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                {/* Icon */}
                <div className="mb-6">
                    <div className={cn(
                        'inline-flex p-4 rounded-2xl bg-gradient-to-br shadow-lg',
                        stat.color,
                        stat.gradient
                    )}>
                        <stat.icon className="h-8 w-8 text-white" />
                    </div>
                </div>

                {/* Counter */}
                <div className="mb-2">
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                            {count}
                        </span>
                        <span className="text-3xl md:text-4xl font-bold text-muted-foreground">
                            {stat.suffix}
                        </span>
                    </div>
                </div>

                {/* Label */}
                <p className="text-muted-foreground font-medium">
                    {stat.label}
                </p>

                {/* Progress Bar */}
                <div className="mt-6 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                        className={cn(
                            'h-full rounded-full transition-all duration-1000 ease-out',
                            stat.color
                        )}
                        style={{ width: `${(count / stat.value) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    )
}

export function AnimatedStats() {
    const sectionRef = useRef<HTMLDivElement>(null)
    const [dynamicStats, setDynamicStats] = useState(stats)

    useEffect(() => {
        // Fetch real data from API
        Promise.all([
            fetch(`${API_URL}/api/projects`).then(r => r.ok ? r.json() : []),
            fetch(`${API_URL}/api/skills`).then(r => r.ok ? r.json() : { skills: [] }),
            fetch(`${API_URL}/api/settings/public`).then(r => r.ok ? r.json() : {}),
        ])
            .then(([projectsData, skillsData, settings]: [any, any, any]) => {
                const projects = Array.isArray(projectsData) ? projectsData : (projectsData?.projects || [])
                const totalStars = projects.reduce((sum: number, p: any) => sum + (p.stars || 0), 0)
                const skillCount = skillsData?.skills?.length || 0
                const yearsExp = parseInt(settings?.profile?.years_experience) || 3

                setDynamicStats([
                    {
                        icon: Code2,
                        value: projects.length || 15,
                        label: 'Projects Built',
                        suffix: '+',
                        color: 'from-blue-500 to-cyan-500',
                        gradient: 'shadow-blue-500/20',
                    },
                    {
                        icon: Star,
                        value: totalStars || 427,
                        label: 'GitHub Stars',
                        suffix: '+',
                        color: 'from-yellow-500 to-orange-500',
                        gradient: 'shadow-yellow-500/20',
                    },
                    {
                        icon: Trophy,
                        value: yearsExp,
                        label: 'Years Experience',
                        suffix: '+',
                        color: 'from-purple-500 to-pink-500',
                        gradient: 'shadow-purple-500/20',
                    },
                    {
                        icon: Zap,
                        value: skillCount || 20,
                        label: 'Technologies',
                        suffix: '+',
                        color: 'from-green-500 to-emerald-500',
                        gradient: 'shadow-green-500/20',
                    },
                ])
            })
            .catch(() => {})
    }, [])

    return (
        <section ref={sectionRef} className="relative z-10 py-32 md:py-40">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            <div className="mx-auto max-w-6xl px-6 relative">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">Achievements</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Numbers That Matter
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        A glimpse into my journey and impact
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dynamicStats.map((stat, index) => (
                        <StatCard key={index} stat={stat} index={index} />
                    ))}
                </div>

                {/* Footer */}
                <div className="text-center mt-12">
                    <p className="text-muted-foreground">
                        And counting... 🚀
                    </p>
                </div>
            </div>
        </section>
    )
}

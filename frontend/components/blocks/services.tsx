'use client'
import React from 'react'
import { Code2, Database, Smartphone, Layout, Server, Wrench, Cpu, Globe } from 'lucide-react'
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

interface Service {
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
    gradient: string
    features: string[]
}

const services: Service[] = [
    {
        icon: Layout,
        title: 'Frontend Development',
        description: 'Building responsive, performant, and beautiful user interfaces with modern frameworks.',
        gradient: 'from-blue-500 to-cyan-500',
        features: ['React/Next.js', 'TypeScript', 'Tailwind CSS', 'Responsive Design'],
    },
    {
        icon: Server,
        title: 'Backend Development',
        description: 'Creating robust APIs and server-side applications with scalability in mind.',
        gradient: 'from-green-500 to-emerald-500',
        features: ['Node.js', 'Python/FastAPI', 'REST/GraphQL APIs', 'Authentication'],
    },
    {
        icon: Database,
        title: 'Database Design',
        description: 'Designing efficient database schemas and optimizing query performance.',
        gradient: 'from-purple-500 to-pink-500',
        features: ['PostgreSQL', 'Prisma ORM', 'Data Modeling', 'Performance Optimization'],
    },
    {
        icon: Smartphone,
        title: 'Mobile Development',
        description: 'Developing cross-platform mobile applications with native-like performance.',
        gradient: 'from-orange-500 to-red-500',
        features: ['React Native', 'iOS & Android', 'Push Notifications', 'Offline Support'],
    },
    {
        icon: Code2,
        title: 'API Integration',
        description: 'Integrating third-party APIs and building custom API solutions.',
        gradient: 'from-indigo-500 to-violet-500',
        features: ['REST APIs', 'Webhooks', 'Payment Gateways', 'OAuth'],
    },
    {
        icon: Wrench,
        title: 'DevOps & Deployment',
        description: 'Setting up CI/CD pipelines, containerization, and cloud infrastructure.',
        gradient: 'from-teal-500 to-cyan-500',
        features: ['Docker', 'GitHub Actions', 'AWS/Vercel', 'Monitoring'],
    },
]

export function Services() {
    return (
        <section className="relative z-10 py-32 md:py-40 bg-gradient-to-b from-background to-muted/30">
            <div className="mx-auto max-w-6xl px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <AnimatedGroup variants={transitionVariants}>
                        <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                            <Wrench className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Services</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            What I Do
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Comprehensive solutions for your digital needs
                        </p>
                    </AnimatedGroup>
                </div>

                {/* Services Grid */}
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
                    {services.map((service, index) => {
                        const Icon = service.icon

                        return (
                            <div
                                key={index}
                                className="group relative bg-card/50 backdrop-blur-sm rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                                {/* Gradient Border Effect */}
                                <div className={cn(
                                    'absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-500',
                                    service.gradient
                                )} />

                                <div className="relative">
                                    {/* Icon */}
                                    <div className={cn(
                                        'inline-flex p-3 rounded-xl bg-gradient-to-br shadow-lg mb-4',
                                        service.gradient
                                    )}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold mb-2">
                                        {service.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {service.description}
                                    </p>

                                    {/* Features */}
                                    <div className="space-y-2">
                                        {service.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                <div className={cn(
                                                    'h-1.5 w-1.5 rounded-full',
                                                    service.gradient.replace('from-', 'bg-').split(' ')[0]
                                                )} />
                                                <span className="text-muted-foreground">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </AnimatedGroup>
            </div>
        </section>
    )
}

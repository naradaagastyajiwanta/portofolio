'use client'
import React from 'react'
import { Quote, Star } from 'lucide-react'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

interface Testimonial {
    name: string
    role: string
    company: string
    avatar?: string
    quote: string
    rating: number
    project: string
}

const testimonials: Testimonial[] = [
    {
        name: 'Sarah Johnson',
        role: 'Product Manager',
        company: 'TechCorp',
        avatar: 'SJ',
        quote: 'Exceptional developer with great attention to detail. Delivered the project ahead of schedule and the code quality was outstanding. Highly recommend!',
        rating: 5,
        project: 'E-commerce Platform',
    },
    {
        name: 'Michael Chen',
        role: 'CTO',
        company: 'StartupXYZ',
        avatar: 'MC',
        quote: 'One of the best developers I\'ve worked with. Clean code, great communication, and excellent problem-solving skills. Our platform performance improved by 40%.',
        rating: 5,
        project: 'SaaS Dashboard',
    },
    {
        name: 'Emily Rodriguez',
        role: 'Lead Developer',
        company: 'AgencyHub',
        avatar: 'ER',
        quote: 'Talented full-stack developer who understands both frontend and backend deeply. Collaborative and always willing to go the extra mile.',
        rating: 5,
        project: 'API Integration',
    },
]

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={cn(
                        'h-4 w-4',
                        i < rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                    )}
                />
            ))}
        </div>
    )
}

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
    return (
        <div
            className={cn(
                'group relative bg-card/50 backdrop-blur-sm rounded-2xl p-8',
                'hover:shadow-2xl transition-all duration-500 hover:scale-105'
            )}>
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative">
                {/* Quote Icon */}
                <div className="mb-6">
                    <div className="inline-flex p-3 rounded-xl bg-primary/10">
                        <Quote className="h-6 w-6 text-primary" />
                    </div>
                </div>

                {/* Rating */}
                <StarRating rating={testimonial.rating} />

                {/* Quote */}
                <blockquote className="mb-6">
                    <p className="text-foreground leading-relaxed">
                        "{testimonial.quote}"
                    </p>
                </blockquote>

                {/* Author Info */}
                <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback className={cn(
                            'bg-gradient-to-br from-primary to-primary/70 text-white font-bold'
                        )}>
                            {testimonial.avatar}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="font-semibold text-foreground mb-0.5">
                            {testimonial.name}
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                            {testimonial.role} at {testimonial.company}
                        </div>
                        <div className="text-xs font-medium text-primary">
                            Project: {testimonial.project}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function Testimonials() {
    return (
        <section className="relative z-10 py-32 md:py-40">
            <div className="mx-auto max-w-6xl px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <AnimatedGroup variants={transitionVariants}>
                        <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                            <Quote className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Testimonials</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            What People Say
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Feedback from clients and collaborators
                        </p>
                    </AnimatedGroup>
                </div>

                {/* Testimonials Grid */}
                <AnimatedGroup
                    variants={{
                        container: {
                            visible: {
                                transition: {
                                    staggerChildren: 0.2,
                                    delayChildren: 0.3,
                                },
                            },
                        },
                        ...transitionVariants,
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard key={index} testimonial={testimonial} index={index} />
                    ))}
                </AnimatedGroup>

                {/* CTA */}
                <AnimatedGroup
                    variants={transitionVariants}
                    className="text-center mt-12">
                    <p className="text-muted-foreground mb-4">
                        Want to work together? Let's create something amazing!
                    </p>
                    <a
                        href="mailto:contact@naj.dev"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                        Get in Touch
                    </a>
                </AnimatedGroup>
            </div>
        </section>
    )
}

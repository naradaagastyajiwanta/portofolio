'use client'
import React, { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    size: number
    opacity: number
}

interface BackgroundEffectProps {
    className?: string
    type?: 'particles' | 'gradient-blobs' | 'grid-pattern'
    particleCount?: number
}

export function BackgroundEffect({
    className,
    type = 'gradient-blobs',
    particleCount = 50,
}: BackgroundEffectProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationRef = useRef<number>()

    useEffect(() => {
        if (type !== 'particles') return

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)

        // Initialize particles
        const particles: Particle[] = []
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2,
            })
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Update and draw particles
            particles.forEach((particle) => {
                // Update position
                particle.x += particle.vx
                particle.y += particle.vy

                // Bounce off walls
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

                // Draw particle
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(100, 100, 255, ${particle.opacity})`
                ctx.fill()
            })

            // Draw connections
            particles.forEach((p1, i) => {
                particles.slice(i + 1).forEach((p2) => {
                    const dx = p1.x - p2.x
                    const dy = p1.y - p2.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < 150) {
                        ctx.beginPath()
                        ctx.moveTo(p1.x, p1.y)
                        ctx.lineTo(p2.x, p2.y)
                        ctx.strokeStyle = `rgba(100, 100, 255, ${0.15 * (1 - distance / 150)})`
                        ctx.stroke()
                    }
                })
            })

            animationRef.current = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener('resize', resizeCanvas)
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [type, particleCount])

    if (type === 'particles') {
        return (
            <canvas
                ref={canvasRef}
                className={cn('absolute inset-0 w-full h-full pointer-events-none', className)}
            />
        )
    }

    if (type === 'gradient-blobs') {
        return (
            <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
                {/* Primary Blob */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-blob" />
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-blob animation-delay-4000" />

                {/* Secondary Blob */}
                <div className="absolute top-1/3 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-blob animation-delay-1000" />
                <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-3000" />
            </div>
        )
    }

    if (type === 'grid-pattern') {
        return (
            <div
                className={cn(
                    'absolute inset-0 pointer-events-none opacity-20',
                    '[background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]',
                    '[background-size:24px_24px]',
                    className
                )}
            />
        )
    }

    return null
}

// Add this to your globals.css for blob animation
/*
@keyframes blob {
    0% {
        transform: translate(0px, 0px) scale(1);
    }
    33% {
        transform: translate(30px, -50px) scale(1.1);
    }
    66% {
        transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
        transform: translate(0px, 0px) scale(1);
    }
}

.animate-blob {
    animation: blob 7s infinite;
}

.animation-delay-2000 {
    animation-delay: 2s;
}

.animation-delay-4000 {
    animation-delay: 4s;
}

.animation-delay-1000 {
    animation-delay: 1s;
}

.animation-delay-3000 {
    animation-delay: 3s;
}
*/

'use client'
import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

// Tech symbols
const techSymbols = [
  { symbol: '{ }', type: 'code' },
  { symbol: '</>', type: 'code' },
  { symbol: '=>', type: 'code' },
  { symbol: '[]', type: 'code' },
  { symbol: '&&', type: 'code' },
  { symbol: '||', type: 'code' },
]

const shapes = [
  { symbol: '⭕', type: 'shape' },
  { symbol: '▢', type: 'shape' },
  { symbol: '△', type: 'shape' },
  { symbol: '◇', type: 'shape' },
]

const labels = [
  { symbol: 'React', type: 'label' },
  { symbol: 'TS', type: 'label' },
  { symbol: 'Next', type: 'label' },
  { symbol: 'Node', type: 'label' },
  { symbol: 'API', type: 'label' },
]

interface FloatingElement {
  id: string
  symbol: string
  type: 'code' | 'shape' | 'label'
  x: number
  y: number
  size: number
  blur: number
  opacity: number
  layer: number
  parallaxSpeed: number
}

function generateFloatingElements(count: number = 60): FloatingElement[] {
  const elements: FloatingElement[] = []
  const allItems = [...techSymbols, ...shapes, ...labels]

  for (let i = 0; i < count; i++) {
    const item = allItems[Math.floor(Math.random() * allItems.length)]
    const layer = Math.floor(Math.random() * 5) + 1 // 1-5

    const blur = (layer - 1) * 4 // 0, 4, 8, 12, 16
    const size = layer === 5 ? 14 : layer === 4 ? 18 : layer === 3 ? 22 : layer === 2 ? 26 : 32
    const opacity = layer === 5 ? 0.2 : layer === 4 ? 0.3 : layer === 3 ? 0.4 : layer === 2 ? 0.5 : 0.7

    // Parallax speed: subtle tapi visible (30-50px per 1000px scroll)
    const parallaxSpeed = layer === 5 ? 0.01 : layer === 4 ? 0.02 : layer === 3 ? 0.03 : layer === 2 ? 0.04 : 0.05

    elements.push({
      id: `float-${i}`,
      symbol: item.symbol,
      type: item.type as any,
      x: Math.random() * 100,
      y: Math.random() * 100, // 0-100% viewport
      size,
      blur,
      opacity,
      layer,
      parallaxSpeed,
    })
  }

  return elements
}

export function FloatingElements() {
  const [scrollY, setScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mounted])

  if (!mounted) {
    return null
  }

  const elements = generateFloatingElements(60)

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10" style={{ height: '300vh' }}>
      {elements.map((element) => {
        // Parallax: elemen bergerak LEBIH LAMBAT dari scroll speed
        // Scroll 100px, elemen hanya bergerak 10-50px (slowed down)
        const parallaxOffset = scrollY * element.parallaxSpeed

        return (
          <div
            key={element.id}
            className={cn(
              'absolute',
              element.type === 'code' && 'font-mono font-bold text-primary/40',
              element.type === 'shape' && 'text-secondary/30',
              element.type === 'label' && 'font-bold text-accent/30'
            )}
            style={{
              left: `${element.x}%`,
              // Kurangi posisi awal dengan parallax (bergerak ke atas lebih lambat dari scroll)
              top: `calc(${element.y}% - ${parallaxOffset}px)`,
              fontSize: `${element.size}px`,
              filter: `blur(${element.blur}px)`,
              opacity: element.opacity,
              transform: `translate(-50%, -50%)`,
            }}
          >
            {element.symbol}
          </div>
        )
      })}
    </div>
  )
}

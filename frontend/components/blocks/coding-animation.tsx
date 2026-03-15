'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

const SCENE_DURATION = 6500

// ─── Typewriter Hook ─────────────────────────────────────────────────────────
interface TypeLine { text: string; type?: 'cmd' | 'out' | 'err' | 'warn' | 'success' }

function useTypewriter(lines: TypeLine[], charSpeed = 28, lineGap = 380, active = true) {
  const [rendered, setRendered] = useState<TypeLine[]>([])
  const [partial, setPartial] = useState('')
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)

  useEffect(() => {
    if (!active) return
    setRendered([]); setPartial(''); setLineIdx(0); setCharIdx(0)
  }, [active])

  useEffect(() => {
    if (!active || lineIdx >= lines.length) return
    const line = lines[lineIdx]
    const speed = line.type !== 'cmd' ? charSpeed * 0.4 : charSpeed
    if (charIdx < line.text.length) {
      const t = setTimeout(() => { setPartial(line.text.slice(0, charIdx + 1)); setCharIdx(c => c + 1) }, speed)
      return () => clearTimeout(t)
    } else {
      const gap = line.type !== 'cmd' ? lineGap * 0.35 : lineGap
      const t = setTimeout(() => { setRendered(d => [...d, line]); setPartial(''); setLineIdx(l => l + 1); setCharIdx(0) }, gap)
      return () => clearTimeout(t)
    }
  }, [active, lineIdx, charIdx, lines, charSpeed, lineGap])

  return { rendered, partial, done: lineIdx >= lines.length, currentType: lineIdx < lines.length ? lines[lineIdx].type : null }
}

// ─── Scene 1: Webpack Build Terminal ─────────────────────────────────────────
const buildLines: TypeLine[] = [
  { text: 'npm run build', type: 'cmd' },
  { text: '> naj@0.1.0 build', type: 'out' },
  { text: '> next build', type: 'out' },
  { text: '  ▲ Next.js 15.5', type: 'out' },
  { text: '   Creating an optimized production build...', type: 'out' },
  { text: '✓ Compiled successfully', type: 'success' },
  { text: '✓ Linting and checking validity of types', type: 'success' },
  { text: '✓ Collecting page data', type: 'success' },
  { text: '✓ Generating static pages (4/4)', type: 'success' },
  { text: 'Route (app)             Size    First Load JS', type: 'out' },
  { text: '○ /                    4.2 kB        118 kB', type: 'out' },
  { text: '○ /projects            3.8 kB        112 kB', type: 'out' },
  { text: '+ First Load JS: 114 kB shared by all', type: 'warn' },
]

function WebpackProgress({ active }: { active: boolean }) {
  const [pct, setPct] = useState(0)
  const [phase, setPhase] = useState(0)
  const phases = ['Compiling...', 'Optimizing...', 'Bundling...', 'Done!']

  useEffect(() => {
    if (!active) { setPct(0); setPhase(0); return }
    let v = 0
    const interval = setInterval(() => {
      v = Math.min(100, v + Math.random() * 4 + 1)
      setPct(Math.round(v))
      setPhase(Math.floor((v / 100) * (phases.length - 1)))
      if (v >= 100) clearInterval(interval)
    }, 60)
    return () => clearInterval(interval)
  }, [active])

  return (
    <div className="mb-3">
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-gray-500 dark:text-zinc-400">{phases[phase]}</span>
        <span className={pct === 100 ? 'text-green-400' : 'text-blue-400'}>{pct}%</span>
      </div>
      <div className="h-1 w-full bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: pct === 100
              ? 'linear-gradient(90deg, #22c55e, #16a34a)'
              : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
          }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  )
}

function TerminalScene({ active }: { active: boolean }) {
  const { rendered, partial, done, currentType } = useTypewriter(buildLines, 25, 320, active)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [rendered, partial])

  const lineColor: Record<string, string> = {
    cmd: 'text-green-600 dark:text-green-400', out: 'text-gray-700 dark:text-zinc-300', err: 'text-red-500 dark:text-red-400',
    warn: 'text-yellow-600 dark:text-yellow-400', success: 'text-emerald-600 dark:text-emerald-400',
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-zinc-700/80 h-[320px]" style={{ boxShadow: '0 0 40px rgba(59,130,246,0.08)' }}>
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700/60">
        <span className="w-3 h-3 rounded-full bg-red-500/90 shadow-sm" />
        <span className="w-3 h-3 rounded-full bg-yellow-400/90 shadow-sm" />
        <span className="w-3 h-3 rounded-full bg-green-500/90 shadow-sm" />
        <div className="flex-1 flex justify-center">
          <span className="text-gray-500 dark:text-zinc-400 text-xs bg-gray-200 dark:bg-zinc-800 rounded px-3 py-0.5">narada — portfolio — zsh</span>
        </div>
      </div>
      <div ref={scrollRef} className="bg-white dark:bg-zinc-950 px-5 pt-4 h-[320px] overflow-hidden font-mono text-xs space-y-0.5">
        {rendered.map((line, i) => (
          <motion.p key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.12 }}
            className={cn('leading-5', lineColor[line.type ?? 'out'])}>
            {line.type === 'cmd' && <span className="text-blue-400 mr-1.5">›</span>}
            {line.text}
          </motion.p>
        ))}
        {partial && (
          <p className={cn('leading-5', lineColor[currentType ?? 'out'])}>
            {currentType === 'cmd' && <span className="text-blue-400 mr-1.5">›</span>}
            {partial}<span className="animate-pulse text-gray-600 dark:text-zinc-300">▌</span>
          </p>
        )}
        {done && <p className="text-blue-400 leading-5 mt-1">› <span className="animate-pulse">▌</span></p>}
      </div>
      <div className="bg-white dark:bg-zinc-950 px-5 pb-4">
        {active && <WebpackProgress active={active} />}
      </div>
    </div>
  )
}

// ─── Scene 2: VS Code with IntelliSense ──────────────────────────────────────
type Token = { t: string; c: string }

const editorContent: { tokens: Token[] }[] = [
  { tokens: [{ t: 'import', c: 'text-pink-400' }, { t: ' React, { useState, useEffect }', c: 'text-zinc-300' }, { t: ' from', c: 'text-pink-400' }, { t: " 'react'", c: 'text-amber-300' }] },
  { tokens: [] },
  { tokens: [{ t: 'interface', c: 'text-blue-300' }, { t: ' Project', c: 'text-yellow-200' }, { t: ' {', c: 'text-zinc-400' }] },
  { tokens: [{ t: '  id', c: 'text-sky-300' }, { t: ': ', c: 'text-zinc-400' }, { t: 'string', c: 'text-blue-300' }, { t: ';', c: 'text-zinc-500' }] },
  { tokens: [{ t: '  name', c: 'text-sky-300' }, { t: ': ', c: 'text-zinc-400' }, { t: 'string', c: 'text-blue-300' }, { t: ';', c: 'text-zinc-500' }] },
  { tokens: [{ t: '  stars', c: 'text-sky-300' }, { t: ': ', c: 'text-zinc-400' }, { t: 'number', c: 'text-blue-300' }, { t: ';', c: 'text-zinc-500' }] },
  { tokens: [{ t: '  tech', c: 'text-sky-300' }, { t: ': ', c: 'text-zinc-400' }, { t: 'string', c: 'text-blue-300' }, { t: '[]', c: 'text-zinc-400' }, { t: ';', c: 'text-zinc-500' }] },
  { tokens: [{ t: '}', c: 'text-zinc-400' }] },
  { tokens: [] },
  { tokens: [{ t: 'export default function', c: 'text-pink-400' }, { t: ' ', c: '' }, { t: 'ProjectCard', c: 'text-yellow-200' }, { t: '({ name, stars, tech }:', c: 'text-zinc-300' }, { t: ' Project', c: 'text-yellow-200' }, { t: ') {', c: 'text-zinc-400' }] },
  { tokens: [{ t: '  const', c: 'text-pink-400' }, { t: ' [open, setOpen] = ', c: 'text-zinc-300' }, { t: 'useState', c: 'text-yellow-200' }, { t: '<', c: 'text-zinc-400' }, { t: 'boolean', c: 'text-blue-300' }, { t: '>(false)', c: 'text-zinc-400' }] },
  { tokens: [] },
  { tokens: [{ t: '  return', c: 'text-pink-400' }, { t: ' (', c: 'text-zinc-400' }] },
  { tokens: [{ t: '    <', c: 'text-zinc-500' }, { t: 'motion.div', c: 'text-red-400' }, { t: ' whileHover=', c: 'text-sky-300' }, { t: '{{ scale: 1.02 }}', c: 'text-amber-300' }, { t: '>', c: 'text-zinc-500' }] },
  { tokens: [{ t: '      <h2>', c: 'text-zinc-500' }, { t: '{name}', c: 'text-sky-200' }, { t: '</h2>', c: 'text-zinc-500' }] },
  { tokens: [{ t: '    </motion.div>', c: 'text-zinc-500' }] },
  { tokens: [{ t: '  )', c: 'text-zinc-400' }] },
  { tokens: [{ t: '}', c: 'text-zinc-400' }] },
]

const intellisense = [
  { label: 'useState', kind: 'Function', detail: '<S>(initialState: S) => [S, ...]', active: true },
  { label: 'useEffect', kind: 'Function', detail: '(effect: EffectCallback) => void', active: false },
  { label: 'useRef', kind: 'Function', detail: '<T>(initial: T) => MutableRefObject<T>', active: false },
  { label: 'useCallback', kind: 'Function', detail: '<T>(fn: T, deps: []) => T', active: false },
]

function EditorScene({ active }: { active: boolean }) {
  const [visibleLines, setVisibleLines] = useState(0)
  const [showIntellisense, setShowIntellisense] = useState(false)

  useEffect(() => {
    if (!active) { setVisibleLines(0); setShowIntellisense(false); return }
    let idx = 0
    const run = () => {
      if (idx < editorContent.length) {
        idx++; setVisibleLines(idx)
        if (idx === 11) setShowIntellisense(true)
        if (idx === 12) setShowIntellisense(false)
        setTimeout(run, idx <= 2 ? 180 : 200)
      }
    }
    const t = setTimeout(run, 300)
    return () => clearTimeout(t)
  }, [active])

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700/80 shadow-2xl h-[320px]" style={{ boxShadow: '0 0 40px rgba(139,92,246,0.08)' }}>
      <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700/60">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/90" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/90" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/90" />
        <div className="ml-3 flex gap-0 text-[11px]">
          <span className="px-3 py-0.5 text-gray-800 dark:text-zinc-200 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700/60 border-b-transparent rounded-t-md">ProjectCard.tsx</span>
          <span className="px-3 py-0.5 text-gray-400 dark:text-zinc-500">api.ts</span>
          <span className="px-3 py-0.5 text-gray-400 dark:text-zinc-500">layout.tsx</span>
        </div>
        <div className="ml-auto flex items-center gap-3 text-gray-400 dark:text-zinc-500 text-[10px]">
          <span>TypeScript</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Prettier</span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 flex" style={{ height: 320 }}>
        <div className="w-6 bg-gray-100 dark:bg-zinc-900/60 flex flex-col items-center pt-2 gap-3 border-r border-gray-200 dark:border-zinc-800/60">
          {['◫', '⊞', '⎇', '⚙'].map((ic, i) => (
            <span key={i} className="text-[8px] text-gray-400 dark:text-zinc-600">{ic}</span>
          ))}
        </div>
        <div className="flex flex-col px-2 py-2 bg-white dark:bg-zinc-950 text-gray-300 dark:text-zinc-700 text-[10px] font-mono select-none min-w-[24px] border-r border-gray-200 dark:border-zinc-800/40">
          {Array.from({ length: Math.max(visibleLines, 1) }).map((_, i) => (
            <span key={i} className="leading-[18px] text-right">{i + 1}</span>
          ))}
        </div>
        <div className="relative flex-1 px-3 py-2 overflow-hidden">
          {editorContent.slice(0, visibleLines).map((line, lineIdx) => (
            <motion.div key={lineIdx} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.1 }}
              className="leading-[18px] font-mono text-[11px] whitespace-pre">
              {line.tokens.length === 0
                ? <span>&nbsp;</span>
                : line.tokens.map((tok, j) => <span key={j} className={tok.c}>{tok.t}</span>)
              }
            </motion.div>
          ))}
          {visibleLines < editorContent.length && (
            <div className="leading-[18px] font-mono text-[11px]">
              <span className="animate-pulse text-gray-400 dark:text-zinc-400">|</span>
            </div>
          )}
          <AnimatePresence>
            {showIntellisense && (
              <motion.div key="intellisense" initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.15 }}
                className="absolute z-20 left-24 rounded border border-zinc-600/80 shadow-2xl overflow-hidden"
                style={{ top: '146px', background: '#1e1e2e', minWidth: 240 }}>
                <div className="text-[9px] text-zinc-400 px-2 py-1 border-b border-zinc-700/60">React Hooks</div>
                {intellisense.map((item, i) => (
                  <div key={i} className={cn('flex items-start gap-2 px-2 py-1', item.active ? 'bg-blue-600/30 border-l-2 border-blue-500' : 'hover:bg-zinc-800/50')}>
                    <span className="text-[8px] text-yellow-300 font-mono mt-0.5 w-12 shrink-0">{item.kind}</span>
                    <div>
                      <span className={cn('text-[11px] font-mono', item.active ? 'text-white' : 'text-zinc-300')}>{item.label}</span>
                      <span className="ml-2 text-[9px] text-zinc-400 font-mono">{item.detail}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-4 px-3 py-1 bg-blue-700/80 text-[9px] font-mono text-white/80">
        <span>⎇ main</span>
        <span>✓ 0 errors</span>
        <span className="ml-auto">Ln {visibleLines}, Col 1</span>
        <span>TypeScript</span>
        <span>UTF-8</span>
      </div>
    </div>
  )
}

// ─── Scene 3: 3D Parallax Floating Cards ─────────────────────────────────────
const floatCards = [
  {
    lang: 'TypeScript', badge: 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/40',
    glow: '0 0 30px rgba(59,130,246,0.2)', border: 'border-blue-500/30',
    bg: 'from-blue-50/90 to-white/95 dark:from-blue-950/60 dark:to-zinc-900/80',
    code: `type ApiResponse<T> = {\n  data: T\n  status: number\n  ok: boolean\n}`,
    x: 5, y: 8, depth: 1.0, floatY: [-10, 6, -10], floatDur: 4.2,
  },
  {
    lang: 'Prisma', badge: 'bg-teal-500/20 text-teal-600 dark:text-teal-300 border-teal-500/40',
    glow: '0 0 30px rgba(20,184,166,0.2)', border: 'border-teal-500/30',
    bg: 'from-teal-50/90 to-white/95 dark:from-teal-950/60 dark:to-zinc-900/80',
    code: `model Project {\n  id    String @id\n  name  String\n  stars Int\n  @@map("projects")\n}`,
    x: 50, y: 5, depth: 0.7, floatY: [8, -12, 8], floatDur: 5.0,
  },
  {
    lang: 'Shell', badge: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40',
    glow: '0 0 30px rgba(16,185,129,0.2)', border: 'border-emerald-500/30',
    bg: 'from-emerald-50/90 to-white/95 dark:from-emerald-950/60 dark:to-zinc-900/80',
    code: `docker compose up -d\ndocker exec app \\\n  npx prisma migrate deploy\ncurl localhost:3001/health`,
    x: 28, y: 55, depth: 0.85, floatY: [-6, 10, -6], floatDur: 3.8,
  },
]

function FloatingCard({ card, active, index }: { card: typeof floatCards[0]; active: boolean; index: number }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothX = useSpring(mouseX, { stiffness: 60, damping: 20 })
  const smoothY = useSpring(mouseY, { stiffness: 60, damping: 20 })
  const rotateX = useTransform(smoothY, v => -v * card.depth * 0.6)
  const rotateY = useTransform(smoothX, v => v * card.depth * 0.6)

  return (
    <motion.div
      style={{
        position: 'absolute', left: `${card.x}%`, top: `${card.y}%`,
        rotateX, rotateY, perspective: 800, transformStyle: 'preserve-3d',
        boxShadow: card.glow,
      }}
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.8, y: active ? card.floatY : 30 }}
      transition={{
        opacity: { duration: 0.5, delay: index * 0.18 },
        scale: { duration: 0.5, delay: index * 0.18 },
        y: { duration: card.floatDur, repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 },
      }}
      className={cn('rounded-xl border backdrop-blur-md text-[10px] font-mono w-44 p-3 bg-gradient-to-br cursor-default select-none', card.border, card.bg)}
    >
      <span className={cn('rounded border text-[9px] font-bold px-1.5 py-0.5 mb-2 inline-block', card.badge)}>{card.lang}</span>
      <pre className="text-gray-700 dark:text-zinc-300 leading-[16px] whitespace-pre-wrap overflow-hidden">{card.code}</pre>
    </motion.div>
  )
}

function FloatingCardsScene({ active }: { active: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-800/60 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-transparent dark:to-transparent" style={{ height: 320 }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-purple-400/10 dark:bg-purple-600/10 blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-24 h-24 rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-2xl" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full bg-teal-400/10 dark:bg-teal-600/10 blur-2xl" />
      </div>
      <div className="absolute top-3 left-3 z-10 text-[10px] font-mono text-gray-400 dark:text-zinc-600">// hover for parallax</div>
      {floatCards.map((card, i) => (
        <FloatingCard key={i} card={card} active={active} index={i} />
      ))}
    </div>
  )
}

// ─── Scene 4: Animated SVG Git Graph ─────────────────────────────────────────
const GIT_COMMITS = [
  { id: 'a3f7', msg: 'initial commit', branch: 0, sha: 'a3f7b2c', x: 50, y: 50 },
  { id: 'b1e9', msg: 'add layout & nav', branch: 0, sha: 'b1e9d4f', x: 110, y: 50 },
  { id: 'c5d2', msg: 'feat: api routes', branch: 1, sha: 'c5d2a1e', x: 150, y: 95 },
  { id: 'd8f3', msg: 'fix: cors headers', branch: 1, sha: 'd8f3e6c', x: 210, y: 95 },
  { id: 'e2a1', msg: 'feat: projects page', branch: 0, sha: 'e2a1b9d', x: 180, y: 50 },
  { id: 'f9c4', msg: 'merge feature/api', branch: 0, sha: 'f9c4d7a', x: 260, y: 50 },
  { id: 'g4b8', msg: 'deploy v1.0 🚀', branch: 0, sha: 'g4b8c2e', x: 320, y: 50 },
]
const BRANCH_COLORS = ['#22c55e', '#a855f7']
const BRANCH_NAMES = ['main', 'feature/api']

function GitLine({ x1, y1, x2, y2, color, delay }: { x1: number; y1: number; x2: number; y2: number; color: string; delay: number }) {
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  return (
    <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2}
      strokeDasharray={length} strokeDashoffset={length} strokeLinecap="round"
      animate={{ strokeDashoffset: 0 }} transition={{ duration: 0.35, delay, ease: 'easeOut' }} />
  )
}

function GitTimelineScene({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(0)
  const [hoveredCommit, setHoveredCommit] = useState<number | null>(null)
  const { resolvedTheme } = useTheme()
  const nodeStroke = resolvedTheme === 'dark' ? '#09090b' : '#ffffff'

  useEffect(() => {
    if (!active) { setVisible(0); return }
    let i = 0
    const tick = () => { if (i < GIT_COMMITS.length) { i++; setVisible(i); setTimeout(tick, 550) } }
    const t = setTimeout(tick, 400)
    return () => clearTimeout(t)
  }, [active])

  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-700/80 bg-gray-50 dark:bg-zinc-950 overflow-hidden shadow-2xl h-[320px]">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-100/70 dark:bg-zinc-900/70 border-b border-gray-200 dark:border-zinc-800/60">
        <span className="text-gray-700 dark:text-zinc-300 text-xs font-semibold">Git History</span>
        <div className="flex gap-2 ml-auto">
          {BRANCH_NAMES.map((name, i) => (
            <span key={i} className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="w-2 h-2 rounded-full" style={{ background: BRANCH_COLORS[i] }} />
              <span className="text-gray-500 dark:text-zinc-400">{name}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="relative px-3 py-3">
        <svg width="100%" height="160" viewBox="0 0 380 150" className="overflow-visible" preserveAspectRatio="xMidYMid meet">
          {visible >= 2 && <GitLine x1={GIT_COMMITS[1].x} y1={GIT_COMMITS[1].y} x2={GIT_COMMITS[2].x} y2={GIT_COMMITS[2].y} color={BRANCH_COLORS[1]} delay={0} />}
          {visible >= 3 && <GitLine x1={GIT_COMMITS[2].x} y1={GIT_COMMITS[2].y} x2={GIT_COMMITS[3].x} y2={GIT_COMMITS[3].y} color={BRANCH_COLORS[1]} delay={0} />}
          {visible >= 6 && <GitLine x1={GIT_COMMITS[3].x} y1={GIT_COMMITS[3].y} x2={GIT_COMMITS[5].x} y2={GIT_COMMITS[5].y} color={BRANCH_COLORS[1]} delay={0} />}
          {GIT_COMMITS.filter((_, i) => i > 0 && i < visible && GIT_COMMITS[i].branch === 0).map((c) => {
            const prevMain = GIT_COMMITS.slice(0, GIT_COMMITS.indexOf(c)).reverse().find(x => x.branch === 0)
            if (!prevMain) return null
            return <GitLine key={c.id} x1={prevMain.x} y1={prevMain.y} x2={c.x} y2={c.y} color={BRANCH_COLORS[0]} delay={0} />
          })}
          {GIT_COMMITS.slice(0, visible).map((c, i) => (
            <motion.g key={c.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredCommit(i)} onMouseLeave={() => setHoveredCommit(null)}>
              <motion.circle cx={c.x} cy={c.y} r={10} fill="none" stroke={BRANCH_COLORS[c.branch]} strokeWidth={1.5}
                initial={{ r: 8, opacity: 0.8 }} animate={{ r: 20, opacity: 0 }} transition={{ duration: 0.8, delay: i * 0.05 }} />
              <circle cx={c.x} cy={c.y} r={7} fill={BRANCH_COLORS[c.branch]} stroke={nodeStroke} strokeWidth={2.5} />
              <foreignObject x={c.x - 30} y={c.y + 13} width={60} height={30}>
                <div className="text-center">
                  <p className="text-[8px] font-mono leading-tight" style={{ color: BRANCH_COLORS[c.branch] }}>{c.sha.slice(0, 5)}</p>
                  <p className="text-[7px] text-gray-500 dark:text-zinc-500 leading-tight truncate">{c.msg}</p>
                </div>
              </foreignObject>
            </motion.g>
          ))}
        </svg>
        <AnimatePresence>
          {hoveredCommit !== null && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute top-2 right-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 text-[10px] font-mono shadow-xl">
              <p className="text-gray-700 dark:text-zinc-300 font-semibold">{GIT_COMMITS[hoveredCommit].msg}</p>
              <p className="text-gray-400 dark:text-zinc-500 mt-0.5">SHA: {GIT_COMMITS[hoveredCommit].sha}</p>
              <p className="text-gray-400 dark:text-zinc-500">Branch: <span style={{ color: BRANCH_COLORS[GIT_COMMITS[hoveredCommit].branch] }}>{BRANCH_NAMES[GIT_COMMITS[hoveredCommit].branch]}</span></p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Scene 5: Live Preview Split ─────────────────────────────────────────────
const splitLines: TypeLine[] = [
  { text: '<ProjectCard', type: 'cmd' },
  { text: '  name="Portfolio"', type: 'out' },
  { text: '  stars={427}', type: 'out' },
  { text: '  featured={true}', type: 'out' },
  { text: '  tech={[', type: 'out' },
  { text: '    "Next.js",', type: 'out' },
  { text: '    "TypeScript",', type: 'out' },
  { text: '    "Prisma",', type: 'out' },
  { text: '    "Docker"', type: 'out' },
  { text: '  ]}', type: 'out' },
  { text: '/>', type: 'cmd' },
]

function SplitViewScene({ active }: { active: boolean }) {
  const { rendered, partial, done, currentType } = useTypewriter(splitLines, 38, 250, active)
  const progress = rendered.length / splitLines.length
  const lineC: Record<string, string> = { cmd: 'text-pink-400', out: 'text-sky-300' }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-950 overflow-hidden shadow-2xl h-[320px]" style={{ boxShadow: '0 0 40px rgba(20,184,166,0.07)' }}>
      <div className="flex border-b border-gray-200 dark:border-zinc-800/80 bg-gray-50 dark:bg-zinc-900/60">
        <div className="flex-1 flex items-center gap-2 px-4 py-2 border-r border-gray-200 dark:border-zinc-800/60">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-[11px] font-mono text-gray-500 dark:text-zinc-400">index.tsx</span>
        </div>
        <div className="flex-1 flex items-center gap-2 px-4 py-2">
          <motion.span className="w-2 h-2 rounded-full bg-emerald-400" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <span className="text-[11px] font-mono text-gray-500 dark:text-zinc-400">Live Preview</span>
        </div>
      </div>
      <div className="flex divide-x divide-gray-200 dark:divide-zinc-800/60 h-full">
        <div className="flex-1 p-4 font-mono text-[11px] h-[320px] overflow-hidden">
          {rendered.map((line, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className={cn('leading-[18px]', lineC[line.type ?? 'out'])}>
              {line.text}
            </motion.div>
          ))}
          {partial && (
            <div className={cn('leading-[18px]', lineC[currentType ?? 'out'])}>
              {partial}<span className="animate-pulse text-gray-400 dark:text-zinc-300">|</span>
            </div>
          )}
        </div>
        <div className="flex-1 p-4 flex items-start overflow-hidden">
          <AnimatePresence>
            {progress > 0.1 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                <div className="w-full rounded-xl border border-gray-200 dark:border-zinc-700/60 bg-gray-50 dark:bg-zinc-900/80 overflow-hidden"
                  style={{ boxShadow: progress > 0.9 ? '0 0 24px rgba(59,130,246,0.15)' : 'none', transition: 'box-shadow 0.5s' }}>
                  <AnimatePresence>
                    {progress > 0.3 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="w-full px-3 pt-2">
                        <span className="text-[9px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-full px-2 py-0.5">⭐ Featured</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Portfolio</h3>
                    <AnimatePresence>
                      {progress > 0.25 && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-400 text-xs">★</span>
                          <span className="text-gray-600 dark:text-zinc-300 text-xs font-mono">
                            {Math.round(427 * Math.min(progress / 0.25, 1))}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {progress > 0.6 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-1 mt-2">
                          {['Next.js', 'TypeScript', 'Prisma', 'Docker'].map((t, i) => (
                            <motion.span key={t} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                              className="rounded-full bg-blue-500/15 text-blue-300 text-[9px] px-2 py-0.5 border border-blue-500/25">{t}</motion.span>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {done && (
                        <motion.button initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                          className="mt-3 w-full text-[10px] font-semibold rounded-lg py-1.5 bg-blue-600/80 text-white border border-blue-500/60">
                          View Project →
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const SCENES = [
  { key: 'terminal', label: 'Build', Component: TerminalScene },
  { key: 'editor', label: 'Editor', Component: EditorScene },
  { key: 'cards', label: '3D Cards', Component: FloatingCardsScene },
  { key: 'git', label: 'Git', Component: GitTimelineScene },
  { key: 'preview', label: 'Preview', Component: SplitViewScene },
]

export function CodingAnimation() {
  const [scene, setScene] = useState(0)
  const total = SCENES.length

  useEffect(() => {
    const advance = setTimeout(() => setScene(s => (s + 1) % total), SCENE_DURATION)
    return () => clearTimeout(advance)
  }, [scene])

  const { Component } = SCENES[scene]

  return (
    <div className="w-full select-none">
      <AnimatePresence mode="wait">
        <motion.div key={scene}
          initial={{ opacity: 0, scale: 0.97, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.01, filter: 'blur(6px)' }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}>
          <Component active={true} />
        </motion.div>
      </AnimatePresence>

      {/* dot indicators with labels */}
      <div className="mt-4 flex items-center justify-center gap-1.5">
        {SCENES.map((s, i) => (
          <button key={i} onClick={() => setScene(i)} title={s.label} className="group flex flex-col items-center gap-1">
            <motion.div
              animate={i === scene ? { width: 24, opacity: 1 } : { width: 6, opacity: 0.4 }}
              className={cn('h-1.5 rounded-full', i === scene ? 'bg-primary' : 'bg-gray-300 dark:bg-zinc-600 group-hover:bg-gray-400 dark:group-hover:bg-zinc-400')}
              transition={{ duration: 0.25 }}
            />
            <span className={cn('text-[9px] font-mono transition-colors hidden sm:block', i === scene ? 'text-gray-500 dark:text-zinc-400' : 'text-gray-300 dark:text-zinc-600')}>
              {s.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

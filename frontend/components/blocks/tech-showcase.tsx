'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { InfiniteSlider } from '@/components/ui/infinite-slider'

const tools = [
  { name: "Anthropic", src: "https://cdn.jsdelivr.net/npm/simple-icons@v14/icons/anthropic.svg", width: 50, darkFilter: true },
  { name: "OpenAI", src: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg", width: 80, darkFilter: true },
  { name: "GitHub", src: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png", width: 50 },
  { name: "VS Code", src: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg", width: 50 },
  { name: "Docker", src: "https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png", width: 80 },
  { name: "PostgreSQL", src: "https://www.postgresql.org/media/img/about/press/elephant.png", width: 50 },
  { name: "Next.js", src: "https://nextjs.org/favicon.ico", width: 40 },
  { name: "TypeScript", src: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg", width: 50 },
  { name: "Tailwind CSS", src: "https://tailwindcss.com/favicon.ico", width: 40 },
  { name: "Git", src: "https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png", width: 50 },
  { name: "Figma", src: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg", width: 50 },
  { name: "Node.js", src: "https://nodejs.org/static/images/logo.svg", width: 60 },
  { name: "React", src: "https://reactjs.org/favicon.ico", width: 40 },
  { name: "Prisma", src: "https://www.prisma.io/images/favicon-32x32.png", width: 40 },
  { name: "Fastify", src: "https://cdn.worldvectorlogo.com/logos/fastify.svg", width: 80 },
]

const firstRow = tools.slice(0, 7)
const secondRow = tools.slice(7, 14)

export function TechShowcase() {
  return (
    <section className="relative z-10 py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[60%] bg-gradient-to-r from-primary/5 via-purple-500/5 to-secondary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-center">
            <span className="text-muted-foreground">Tools I </span>
            <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
              Use Daily
            </span>
          </h2>
          <p className="text-center mt-3 text-muted-foreground max-w-md">
            Technologies and tools I use to build amazing products
          </p>
        </motion.div>

        {/* Infinite Slider - Row 1 */}
        <div className="mb-8 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <InfiniteSlider gap={64} reverse duration={40} className="py-4">
            {firstRow.map((tool) => (
              <div key={tool.name} className="flex items-center justify-center h-16 mx-6">
                <img
                  src={tool.src}
                  alt={tool.name}
                  style={{ width: tool.width, height: 'auto' }}
                  className={`object-contain opacity-80 ${tool.darkFilter ? 'dark:invert' : ''}`}
                />
              </div>
            ))}
          </InfiniteSlider>
        </div>

        {/* Infinite Slider - Row 2 (reverse) */}
        <div className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <InfiniteSlider gap={64} duration={40} className="py-4">
            {secondRow.map((tool) => (
              <div key={tool.name} className="flex items-center justify-center h-16 mx-6">
                <img
                  src={tool.src}
                  alt={tool.name}
                  style={{ width: tool.width, height: 'auto' }}
                  className={`object-contain opacity-80 ${tool.darkFilter ? 'dark:invert' : ''}`}
                />
              </div>
            ))}
          </InfiniteSlider>
        </div>

        {/* Divider lines */}
        <div className="flex justify-center mt-12">
          <div className="h-px w-full max-w-sm bg-border [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
        </div>
      </div>
    </section>
  )
}

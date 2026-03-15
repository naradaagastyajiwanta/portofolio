'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { TestimonialsColumn, testimonials } from './testimonials-columns'

const firstColumn = testimonials.slice(0, 3)
const secondColumn = testimonials.slice(3, 6)
const thirdColumn = testimonials.slice(6, 9)

export function Testimonials() {
  return (
    <section className="relative z-10 py-32 md:py-40 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center mb-16"
        >
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-sm font-medium text-primary">Testimonials</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center">
            What People Say
          </h2>
          <p className="text-center mt-4 text-muted-foreground max-w-xl">
            Feedback from clients and collaborators I've worked with
          </p>
        </motion.div>

        {/* Testimonials Columns */}
        <div className="flex justify-center gap-6 md:gap-8 lg:gap-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[700px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">
            Want to work together? Let's create something amazing!
          </p>
          <a
            href="mailto:contact@naj.dev"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Get in Touch
          </a>
        </motion.div>
      </div>
    </section>
  )
}

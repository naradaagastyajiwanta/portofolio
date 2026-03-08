import { HeroSection } from "@/components/blocks/hero-section-1";
import { AboutPreview } from "@/components/blocks/about-preview";
import { TechStack } from "@/components/blocks/tech-stack";
import { AnimatedStats } from "@/components/blocks/animated-stats";
import { Testimonials } from "@/components/blocks/testimonials";
import { BackgroundEffect } from "@/components/blocks/background-effects";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Person",
    name: "NAJ",
    url: siteUrl,
    jobTitle: "Full-Stack Developer",
    knowsAbout: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Docker"],
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      {/* Background Effects */}
      <BackgroundEffect type="gradient-blobs" className="fixed inset-0 -z-10" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <AboutPreview />
      <TechStack />
      <AnimatedStats />
      <Testimonials />

      {/* Footer */}
      <footer className="border-t py-8 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} NAJ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

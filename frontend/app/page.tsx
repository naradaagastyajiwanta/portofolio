import { HeroSection } from "@/components/blocks/hero-section-1";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      
      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Developer Portfolio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

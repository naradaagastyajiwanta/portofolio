import Link from "next/link";
import { fetchProjects } from "@/lib/api";
import { ProjectCard } from "@/components/project-card";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function ProjectsPage() {
  const projects = await fetchProjects();
  const featuredProjects = projects.filter((p) => p.featured);
  const otherProjects = projects.filter((p) => !p.featured);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              Portfolio
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/projects" className="text-sm font-medium hover:underline">
                Projects
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
            <p className="text-lg text-muted-foreground">
              A collection of {projects.length} projects I've worked on
            </p>
          </div>

          {/* Featured Projects */}
          {featuredProjects.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold">Featured</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          )}

          {/* All Projects */}
          {otherProjects.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold">
                {featuredProjects.length > 0 ? "Other Projects" : "All Projects"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {projects.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No projects available yet.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Developer Portfolio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

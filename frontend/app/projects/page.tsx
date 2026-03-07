import Link from "next/link";
import { fetchProjects } from "@/lib/api";
import { ProjectCard } from "@/components/project-card";
import { ModeToggle } from "@/components/mode-toggle";
import { ArrowLeft } from "lucide-react";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function ProjectsPage() {
  const projects = await fetchProjects();
  const featuredProjects = projects.filter((p) => p.featured);
  const otherProjects = projects.filter((p) => !p.featured);

  // Calculate statistics
  const totalStars = projects.reduce((sum, p) => sum + p.stars, 0);
  const allTechStack = projects.flatMap(p => p.techStack);
  const techStackCount = allTechStack.reduce((acc, tech) => {
    acc[tech] = (acc[tech] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topTechs = Object.entries(techStackCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([tech, count]) => ({ tech, count, percentage: Math.round((count / projects.length) * 100) }));

  // Recent activity
  const recentProjects = [...projects]
    .filter(p => p.lastCommitAt)
    .sort((a, b) => new Date(b.lastCommitAt!).getTime() - new Date(a.lastCommitAt!).getTime())
    .slice(0, 5);

  // Calculate averages
  const avgStars = projects.length > 0 ? Math.round(totalStars / projects.length) : 0;
  const projectsWithStars = projects.filter(p => p.stars > 0).length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold hover:opacity-80 transition-opacity">
              <ArrowLeft className="h-5 w-5" />
              Back to Home
            </Link>
            <ModeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Header */}
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <span className="text-sm font-medium text-primary">Portfolio</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              My Projects
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A showcase of {projects.length} projects - from web applications to open source contributions
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-6 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                  <h3 className="text-4xl font-bold">{projects.length}</h3>
                  <p className="text-xs text-muted-foreground">{featuredProjects.length} featured</p>
                </div>
                <div className="h-14 w-14 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <svg className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
            </div>

            <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 p-6 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Stars</p>
                  <h3 className="text-4xl font-bold">{totalStars}</h3>
                  <p className="text-xs text-muted-foreground">~{avgStars} per project</p>
                </div>
                <div className="h-14 w-14 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <svg className="h-7 w-7 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
            </div>

            <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-6 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Technologies</p>
                  <h3 className="text-4xl font-bold">{Object.keys(techStackCount).length}</h3>
                  <p className="text-xs text-muted-foreground">unique tech stacks</p>
                </div>
                <div className="h-14 w-14 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <svg className="h-7 w-7 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            </div>

            <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-green-500/10 to-green-500/5 p-6 hover:shadow-lg transition-all hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">With Stars</p>
                  <h3 className="text-4xl font-bold">{projectsWithStars}</h3>
                  <p className="text-xs text-muted-foreground">{Math.round((projectsWithStars / projects.length) * 100)}% of projects</p>
                </div>
                <div className="h-14 w-14 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="h-7 w-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
            </div>
          </div>

          {/* Detailed Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Technology Distribution */}
            <div className="rounded-2xl border bg-card p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                <h2 className="text-2xl font-bold">Technology Distribution</h2>
              </div>
              <div className="space-y-4">
                {topTechs.map(({ tech, count, percentage }, index) => (
                  <div key={tech} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-xs font-bold text-primary">
                          {index + 1}
                        </span>
                        <span className="font-medium">{tech}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{count} {count === 1 ? 'project' : 'projects'}</span>
                        <span className="font-bold text-primary">{percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl border bg-card p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-1 w-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                <h2 className="text-2xl font-bold">Recent Activity</h2>
              </div>
              <div className="space-y-4">
                {recentProjects.length > 0 ? (
                  recentProjects.map((project, index) => (
                    <div key={project.id} className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate group-hover:text-primary transition-colors">{project.name}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>
                            {project.lastCommitAt ? new Date(project.lastCommitAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'No date'}
                          </span>
                        </div>
                      </div>
                      {project.stars > 0 && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          <span className="text-sm font-medium">{project.stars}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No recent activity data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Featured Projects */}
          {featuredProjects.length > 0 && (
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-1 w-12 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
                <h2 className="text-3xl font-bold">Featured Projects</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} featured />
                ))}
              </div>
            </section>
          )}

          {/* All Projects */}
          {otherProjects.length > 0 && (
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-1 w-12 bg-gradient-to-r from-muted-foreground/50 to-muted-foreground/20 rounded-full" />
                <h2 className="text-3xl font-bold">
                  {featuredProjects.length > 0 ? "Other Projects" : "All Projects"}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {projects.length === 0 && (
            <div className="text-center py-20 space-y-4">
              <div className="text-6xl">📦</div>
              <h3 className="text-2xl font-semibold">No projects yet</h3>
              <p className="text-muted-foreground">
                Sync your GitHub repositories to see them here
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
// reload

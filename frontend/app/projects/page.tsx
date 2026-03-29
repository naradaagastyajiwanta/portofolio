import type { Metadata } from "next";
import Link from "next/link";
import { fetchProjects } from "@/lib/api";
import { ProjectCard } from "@/components/project-card";
import { ModeToggle } from "@/components/mode-toggle";
import { ArrowLeft, FolderOpen, Star, Code, TrendingUp, Clock, Sparkles } from "lucide-react";
import { BackgroundEffect } from "@/components/blocks/background-effects";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Projects",
  description: "Browse my open-source projects and repositories — full-stack web apps, tools, and experiments.",
  openGraph: {
    title: "Projects | NAJ",
    description: "Browse my open-source projects and repositories — full-stack web apps, tools, and experiments.",
  },
};

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
  const projectsWithStars = projects.filter((p) => p.stars > 0).length;

  return (
    <div className="min-h-screen relative">
      {/* Background Effects */}
      <BackgroundEffect type="gradient-blobs" className="fixed inset-0 -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
              Back to Home
            </Link>
            <ModeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto space-y-20">
          {/* Hero Section */}
          <section className="relative py-12 md:py-20 text-center">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse animation-delay-2000" />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <FolderOpen className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Portfolio</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                My Projects
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                A showcase of {projects.length} projects — from web applications to open source tools
              </p>

              {/* Quick stats */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                  <span className="font-semibold">{totalStars} total stars</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Code className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{Object.keys(techStackCount).length} technologies</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-semibold">{featuredProjects.length} featured</span>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Cards - Modern Glassmorphism */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative bg-card/50 backdrop-blur-sm rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-primary/5">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Projects</p>
                    <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{projects.length}</h3>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center">
                    <svg className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{featuredProjects.length} featured</p>
              </div>
            </div>

            <div className="group relative bg-card/50 backdrop-blur-sm rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-yellow-500/5">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-500/0 via-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Stars</p>
                    <h3 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{totalStars}</h3>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 flex items-center justify-center">
                    <svg className="h-7 w-7 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">~{avgStars} avg</p>
              </div>
            </div>

            <div className="group relative bg-card/50 backdrop-blur-sm rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-purple-500/5">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/0 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Technologies</p>
                    <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{Object.keys(techStackCount).length}</h3>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center">
                    <svg className="h-7 w-7 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">unique stacks</p>
              </div>
            </div>

            <div className="group relative bg-card/50 backdrop-blur-sm rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-green-500/5">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/0 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Active Projects</p>
                    <h3 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{projectsWithStars}</h3>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center">
                    <svg className="h-7 w-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{Math.round((projectsWithStars / projects.length) * 100)}% with stars</p>
              </div>
            </div>
          </div>

          {/* Detailed Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Technology Distribution */}
            <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/50 to-transparent rounded-l-2xl" />
              <div className="relative space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Code className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Technology Distribution</h2>
                </div>
                <div className="space-y-4">
                  {topTechs.map(({ tech, count, percentage }, index) => (
                    <div key={tech} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {index + 1}
                          </span>
                          <span className="font-semibold text-foreground">{tech}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {count} {count === 1 ? 'project' : 'projects'}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-primary">{percentage}%</span>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary via-primary/70 to-primary/40 rounded-full transition-all duration-700"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500/50 to-transparent rounded-l-2xl" />
              <div className="relative space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold">Recent Activity</h2>
                </div>
                <div className="space-y-3">
                  {recentProjects.length > 0 ? (
                    recentProjects.map((project, index) => (
                      <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="block group"
                      >
                        <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 group-hover:scale-[1.01]">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center text-green-500 font-bold text-sm border border-green-500/20">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate group-hover:text-primary transition-colors">{project.name}</p>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                                <span>{project.stars}</span>
                              </div>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <svg className="h-3 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>
                                  {project.lastCommitAt ? new Date(project.lastCommitAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  }) : 'No date'}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Featured Projects - Bento Grid Layout */}
          {featuredProjects.length > 0 && (
            <section className="space-y-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <h2 className="text-3xl md:text-4xl font-bold">Featured Projects</h2>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{featuredProjects.length} projects</span>
                  <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                  <span>Bento Grid</span>
                </div>
              </div>

              {/* Bento Grid - Dynamic Layout */}
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[200px]">
                {/* First project - Large (2x2) */}
                {featuredProjects[0] && (
                  <div className="md:col-span-2 md:row-span-2 lg:col-span-3 lg:row-span-2">
                    <ProjectCard
                      key={featuredProjects[0].id}
                      project={featuredProjects[0]}
                      featured
                      size="large"
                    />
                  </div>
                )}

                {/* Second project - Medium (2x1) */}
                {featuredProjects[1] && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <ProjectCard
                      key={featuredProjects[1].id}
                      project={featuredProjects[1]}
                      featured
                      size="medium"
                    />
                  </div>
                )}

                {/* Third project - Small (1x1) */}
                {featuredProjects[2] && (
                  <div className="md:col-span-2 lg:col-span-2">
                    <ProjectCard
                      key={featuredProjects[2].id}
                      project={featuredProjects[2]}
                      featured
                      size="small"
                    />
                  </div>
                )}

                {/* Fourth project - Medium (2x1) */}
                {featuredProjects[3] && (
                  <div className="md:col-span-2 lg:col-span-2">
                    <ProjectCard
                      key={featuredProjects[3].id}
                      project={featuredProjects[3]}
                      featured
                      size="medium"
                    />
                  </div>
                )}

                {/* Remaining projects - Small (1x1) */}
                {featuredProjects.slice(4).map((project) => (
                  <div key={project.id} className="md:col-span-2 lg:col-span-2">
                    <ProjectCard project={project} featured size="small" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All Projects - Horizontal Scroll */}
          {otherProjects.length > 0 && (
            <section className="space-y-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-12 bg-gradient-to-r from-muted-foreground/50 to-muted-foreground/20 rounded-full" />
                  <h2 className="text-3xl md:text-4xl font-bold">
                    {featuredProjects.length > 0 ? "More Projects" : "All Projects"}
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{otherProjects.length} projects</span>
                  <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                  <span>Scroll →</span>
                </div>
              </div>

              {/* Horizontal Scroll Container */}
              <div className="relative group">
                {/* Fade gradients on sides */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

                {/* Scroll container */}
                <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/40 transition-all">
                  {otherProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex-shrink-0 w-[400px] md:w-[450px] snap-start"
                    >
                      <ProjectCard project={project} featured />
                    </div>
                  ))}

                  {/* Scroll hint */}
                  {otherProjects.length > 2 && (
                    <div className="flex-shrink-0 flex items-center justify-center w-[200px] border-2 border-dashed border-border/30 rounded-2xl">
                      <div className="text-center space-y-2">
                        <div className="flex justify-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                        </div>
                        <p className="text-xs text-muted-foreground">Scroll for more</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Empty State */}
          {projects.length === 0 && (
            <div className="text-center py-32">
              <div className="inline-flex p-6 rounded-2xl bg-muted/30 backdrop-blur-sm mb-6">
                <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6">
                Sync your GitHub repositories to see them here
              </p>
              <Link
                href="/admin/projects"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <FolderOpen className="h-4 w-4" />
                Go to Admin
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

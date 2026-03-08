import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Star, GitFork, Calendar, Code, Package } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return { title: "Project Not Found" };
  return {
    title: project.name,
    description: project.description || `${project.name} — an open-source project by NAJ.`,
    openGraph: {
      title: `${project.name} | NAJ`,
      description: project.description || `${project.name} — an open-source project by NAJ.`,
    },
  };
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  url: string;
  stars: number;
  techStack: string[];
  featured: boolean;
  lastCommitAt: string | null;
  provider: string;
  repoId: string;
  showOnPortfolio: boolean;
  createdAt: string;
  updatedAt: string;
}

async function getProject(id: string): Promise<Project | null> {
  try {
    const response = await fetch(`${API_URL}/api/projects/${id}`, {
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.project;
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/projects" className="inline-flex items-center gap-2 text-lg font-bold hover:opacity-80 transition-opacity">
              <ArrowLeft className="h-5 w-5" />
              Back to Projects
            </Link>
            <ModeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Project Header */}
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-4xl md:text-5xl font-bold">{project.name}</h1>
                  {project.featured && (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 border-0">
                      ⭐ Featured
                    </Badge>
                  )}
                </div>
                {project.description && (
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>
              <Button asChild size="lg" className="gap-2">
                <Link href={project.url} target="_blank" rel="noopener noreferrer">
                  View on GitHub
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border bg-card p-6 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="h-4 w-4" />
                <span className="text-sm font-medium">Stars</span>
              </div>
              <p className="text-3xl font-bold">{project.stars}</p>
            </div>

            <div className="rounded-xl border bg-card p-6 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Code className="h-4 w-4" />
                <span className="text-sm font-medium">Technologies</span>
              </div>
              <p className="text-3xl font-bold">{project.techStack.length}</p>
            </div>

            <div className="rounded-xl border bg-card p-6 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span className="text-sm font-medium">Provider</span>
              </div>
              <p className="text-2xl font-bold capitalize">{project.provider}</p>
            </div>

            <div className="rounded-xl border bg-card p-6 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Last Update</span>
              </div>
              <p className="text-sm font-bold">
                {project.lastCommitAt 
                  ? new Date(project.lastCommitAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'N/A'
                }
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="rounded-2xl border bg-card p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
              <h2 className="text-2xl font-bold">Technology Stack</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {project.techStack.map((tech) => (
                <Badge 
                  key={tech} 
                  variant="secondary" 
                  className="text-base px-4 py-2 bg-muted/50 hover:bg-muted transition-colors"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          {/* Project Information */}
          <div className="rounded-2xl border bg-card p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              <h2 className="text-2xl font-bold">Project Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Repository ID</p>
                <p className="font-mono text-sm bg-muted px-3 py-2 rounded">{project.repoId}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${project.showOnPortfolio ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <p className="font-medium">{project.showOnPortfolio ? 'Public' : 'Private'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                <p className="font-medium">
                  {new Date(project.createdAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Last Synced</p>
                <p className="font-medium">
                  {new Date(project.updatedAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-primary/5 p-8 text-center space-y-4">
            <h3 className="text-2xl font-bold">Interested in this project?</h3>
            <p className="text-muted-foreground">
              Check out the source code, contribute, or star the repository on GitHub
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link href={project.url} target="_blank" rel="noopener noreferrer">
                <Star className="h-4 w-4" />
                Star on GitHub
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

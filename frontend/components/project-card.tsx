import Link from "next/link";
import { Star, ExternalLink, GitFork, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/api";

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

export function ProjectCard({ project, featured = false }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
        featured ? 'border-primary/50 bg-gradient-to-br from-primary/5 to-transparent' : ''
      }`}>
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {project.name}
                </CardTitle>
                {featured && (
                  <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500 border-0 shadow-sm">
                    ⭐ Featured
                  </Badge>
                )}
              </div>
              {project.description && (
                <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                  {project.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Tech Stack */}
          {project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.techStack.slice(0, 5).map((tech) => (
                <Badge 
                  key={tech} 
                  variant="secondary" 
                  className="text-xs font-medium bg-muted/50 hover:bg-muted transition-colors"
                >
                  {tech}
                </Badge>
              ))}
              {project.techStack.length > 5 && (
                <Badge variant="secondary" className="text-xs bg-muted/50">
                  +{project.techStack.length - 5}
                </Badge>
              )}
            </div>
          )}

          {/* Stats & Link */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                <span className="font-medium">{project.stars}</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
              <span>View Details</span>
              <svg className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

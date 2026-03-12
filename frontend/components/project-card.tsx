import Link from "next/link";
import { Star, ExternalLink, GitFork, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/api";

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
  size?: 'large' | 'medium' | 'small';
}

export function ProjectCard({ project, featured = false, size = 'medium' }: ProjectCardProps) {
  // Size configurations
  const sizeConfig = {
    large: {
      descriptionLines: 4,
      techStackLimit: 8,
      showStats: true,
      compact: false,
    },
    medium: {
      descriptionLines: 2,
      techStackLimit: 5,
      showStats: true,
      compact: false,
    },
    small: {
      descriptionLines: 1,
      techStackLimit: 3,
      showStats: false,
      compact: true,
    },
  };

  const config = sizeConfig[size];

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className={`group relative h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
        featured ? 'border-primary/50 bg-gradient-to-br from-primary/5 to-transparent' : ''
      }`}>
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className={`relative ${config.compact ? 'space-y-2' : 'space-y-3'}`}>
          <div className="flex items-start justify-between gap-4">
            <div className={`space-y-2 ${size === 'large' ? 'flex-1' : 'flex-1'}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className={`font-bold group-hover:text-primary transition-colors ${
                  size === 'large' ? 'text-2xl' : size === 'small' ? 'text-base' : 'text-xl'
                }`}>
                  {project.name}
                </CardTitle>
                {featured && (
                  <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500 border-0 shadow-sm text-xs">
                    ⭐ Featured
                  </Badge>
                )}
              </div>
              {project.description && (
                <CardDescription className={`leading-relaxed ${
                  size === 'large' ? 'text-base line-clamp-4' : size === 'small' ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2'
                }`}>
                  {project.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        {!config.compact && (
          <CardContent className="relative space-y-4">
            {/* Tech Stack */}
            {project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.techStack.slice(0, config.techStackLimit).map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="text-xs font-medium bg-muted/50 hover:bg-muted transition-colors"
                  >
                    {tech}
                  </Badge>
                ))}
                {project.techStack.length > config.techStackLimit && (
                  <Badge variant="secondary" className="text-xs bg-muted/50">
                    +{project.techStack.length - config.techStackLimit}
                  </Badge>
                )}
              </div>
            )}

            {/* Stats & Link */}
            {config.showStats && (
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">{project.stars}</span>
                  </div>
                  {project.language && (
                    <>
                      <div className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                      <span className="text-xs">{project.language}</span>
                    </>
                  )}
                </div>

                <div className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
                  <span>View Details</span>
                  <svg className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            )}
          </CardContent>
        )}

        {/* Compact footer for small cards */}
        {config.compact && (
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {project.techStack.slice(0, config.techStackLimit).map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="text-xs bg-muted/50"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span>{project.stars}</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}

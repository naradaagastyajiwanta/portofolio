import Link from "next/link";
import { ArrowLeft, Mail, Github, Linkedin, Twitter, MapPin, Calendar, Briefcase, Award, Code } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchProjects } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  employmentType?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  responsibilities: string[];
  skills: string[];
  order: number;
}

async function fetchExperiences(): Promise<Experience[]> {
  try {
    const response = await fetch(`${API_URL}/api/experiences`, {
      next: { revalidate: 60 }
    });
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Failed to fetch experiences:', error);
    return [];
  }
}

function formatExperienceDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });
}

export const revalidate = 60;

export default async function AboutPage() {
  const projects = await fetchProjects();
  const experiences = await fetchExperiences();
  const totalStars = projects.reduce((sum, p) => sum + p.stars, 0);
  const allTechStack = projects.flatMap(p => p.techStack);
  const uniqueTechs = [...new Set(allTechStack)];

  const skills = [
    { name: "TypeScript", level: 90, category: "Language" },
    { name: "JavaScript", level: 95, category: "Language" },
    { name: "Python", level: 85, category: "Language" },
    { name: "React", level: 90, category: "Frontend" },
    { name: "Next.js", level: 88, category: "Frontend" },
    { name: "Tailwind CSS", level: 92, category: "Frontend" },
    { name: "Node.js", level: 87, category: "Backend" },
    { name: "PostgreSQL", level: 85, category: "Database" },
    { name: "Docker", level: 80, category: "DevOps" },
    { name: "Git", level: 93, category: "Tools" },
  ];

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
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Header */}
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <span className="text-sm font-medium text-primary">About Me</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Hi, I'm a Full-Stack Developer
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Passionate about building exceptional digital experiences. I specialize in creating modern, 
              performant web applications with clean code and intuitive user interfaces.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">{projects.length}+</div>
              <p className="text-sm text-muted-foreground">Projects Built</p>
            </div>
            <div className="text-center p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">{totalStars}+</div>
              <p className="text-sm text-muted-foreground">GitHub Stars</p>
            </div>
            <div className="text-center p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">{uniqueTechs.length}+</div>
              <p className="text-sm text-muted-foreground">Technologies</p>
            </div>
            <div className="text-center p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
              <div className="text-4xl font-bold text-primary mb-2">3+</div>
              <p className="text-sm text-muted-foreground">Years Experience</p>
            </div>
          </div>

          {/* Professional Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* About */}
            <div className="rounded-2xl border bg-card p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                <h2 className="text-2xl font-bold">Professional Summary</h2>
              </div>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  I'm a passionate full-stack developer with expertise in building modern web applications. 
                  My journey in software development started in 2020, and since then, I've been continuously 
                  learning and adapting to new technologies.
                </p>
                <p>
                  I believe in writing clean, maintainable code and creating user experiences that are both 
                  beautiful and functional. I enjoy solving complex problems and turning ideas into reality.
                </p>
              </div>
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Based in Indonesia</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>Available for freelance work</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>Open to collaboration</span>
                </div>
              </div>
            </div>

            {/* Connect */}
            <div className="rounded-2xl border bg-card p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                <h2 className="text-2xl font-bold">Let's Connect</h2>
              </div>
              <p className="text-muted-foreground">
                I'm always interested in hearing about new projects and opportunities. 
                Feel free to reach out through any of these platforms!
              </p>
              <div className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start gap-3 h-12">
                  <Link href="https://github.com/naradaagastyajiwanta" target="_blank">
                    <Github className="h-5 w-5" />
                    <span>github.com/naradaagastyajiwanta</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start gap-3 h-12">
                  <Link href="https://linkedin.com/in/yourprofile" target="_blank">
                    <Linkedin className="h-5 w-5" />
                    <span>Connect on LinkedIn</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start gap-3 h-12">
                  <Link href="https://twitter.com/yourhandle" target="_blank">
                    <Twitter className="h-5 w-5" />
                    <span>Follow on Twitter</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start gap-3 h-12">
                  <Link href="mailto:naradaagastyajiwanta@gmail.com">
                    <Mail className="h-5 w-5" />
                    <span>naradaagastyajiwanta@gmail.com</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="rounded-2xl border bg-card p-8 space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
              <h2 className="text-2xl font-bold">Skills & Technologies</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skills.map((skill) => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-primary" />
                      <span className="font-medium">{skill.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{skill.category}</Badge>
                      <span className="text-muted-foreground">{skill.level}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Timeline */}
          <div className="rounded-2xl border bg-card p-8 space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
              <h2 className="text-2xl font-bold">Work Experience</h2>
            </div>
            {experiences.length > 0 ? (
              <div className="space-y-8">
                {experiences.map((exp, index) => (
                  <div key={exp.id} className="relative pl-8 pb-8 border-l-2 border-muted last:pb-0">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-xl font-bold">{exp.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-muted-foreground mt-1">
                          <Briefcase className="h-4 w-4" />
                          <span className="font-medium">{exp.company}</span>
                          {exp.location && (
                            <>
                              <span>•</span>
                              <MapPin className="h-4 w-4" />
                              <span>{exp.location}</span>
                            </>
                          )}
                          <span>•</span>
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatExperienceDate(exp.startDate)} - {exp.current ? 'Present' : exp.endDate ? formatExperienceDate(exp.endDate) : 'N/A'}
                          </span>
                          {exp.employmentType && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">{exp.employmentType}</Badge>
                            </>
                          )}
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-muted-foreground leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                      {exp.responsibilities.length > 0 && (
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {exp.responsibilities.slice(0, 3).map((resp, idx) => (
                            <li key={idx}>• {resp}</li>
                          ))}
                        </ul>
                      )}
                      {exp.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {exp.skills.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No work experience added yet.</p>
                <Link href="/admin/experience" className="text-primary hover:underline mt-2 inline-block">
                  Add your experience in the admin panel
                </Link>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-primary/5 p-12 text-center space-y-6">
            <Award className="h-16 w-16 text-primary mx-auto" />
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Interested in working together?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link href="/projects">
                  <Briefcase className="h-4 w-4" />
                  View My Work
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link href="mailto:naradaagastyajiwanta@gmail.com">
                  <Mail className="h-4 w-4" />
                  Get in Touch
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

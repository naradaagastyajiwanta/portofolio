import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, Github, Linkedin, Twitter, MapPin, Calendar, Briefcase, Award, Code, Sparkles, Zap, Target, Heart, TrendingUp, Users, Rocket } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchProjects, fetchSettings } from "@/lib/api";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn more about NAJ — a full-stack developer passionate about building modern, performant web applications.",
  openGraph: {
    title: "About | NAJ",
    description:
      "Learn more about NAJ — a full-stack developer passionate about building modern, performant web applications.",
  },
};

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
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

async function fetchSkills(): Promise<Skill[]> {
  try {
    const response = await fetch(`${API_URL}/api/skills`, {
      next: { revalidate: 60 }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.skills;
  } catch (error) {
    console.error('Failed to fetch skills:', error);
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
  const [projects, experiences, skills, settings] = await Promise.all([
    fetchProjects(),
    fetchExperiences(),
    fetchSkills(),
    fetchSettings(),
  ]);
  const totalStars = projects.reduce((sum, p) => sum + p.stars, 0);
  const allTechStack = projects.flatMap(p => p.techStack);
  const uniqueTechs = [...new Set(allTechStack)];

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
        <div className="max-w-6xl mx-auto space-y-20">

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">About Me</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                  Hi, I'm <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">{settings.profile.display_name || 'Developer'}</span>
                </h1>
                <p className="text-xl text-muted-foreground font-light">
                  {settings.profile.title || 'Full-Stack Developer'}
                </p>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                {settings.profile.bio || "I'm a passionate full-stack developer with expertise in building modern web applications."}
              </p>

              {/* Quick info */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>{settings.profile.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <span>{settings.profile.availability}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-5 w-5 text-primary" />
                  <span>Open to collaborate</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap gap-3 pt-4">
                {settings.social.github_url && (
                  <Button asChild className="gap-2">
                    <Link href={settings.social.github_url as any} target="_blank">
                      <Github className="h-5 w-5" />
                      GitHub
                    </Link>
                  </Button>
                )}
                {settings.social.linkedin_url && (
                  <Button asChild variant="outline" className="gap-2">
                    <Link href={settings.social.linkedin_url as any} target="_blank">
                      <Linkedin className="h-5 w-5" />
                      LinkedIn
                    </Link>
                  </Button>
                )}
                {settings.social.twitter_url && (
                  <Button asChild variant="outline" className="gap-2">
                    <Link href={settings.social.twitter_url as any} target="_blank">
                      <Twitter className="h-5 w-5" />
                      Twitter
                    </Link>
                  </Button>
                )}
                {settings.social.email && (
                  <Button asChild variant="outline" className="gap-2">
                    <Link href={`mailto:${settings.social.email}` as any}>
                      <Mail className="h-5 w-5" />
                      Email
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Rocket, label: 'Projects Built', value: projects.length, suffix: '+', color: 'from-blue-500 to-cyan-500' },
                { icon: Award, label: 'GitHub Stars', value: totalStars, suffix: '+', color: 'from-yellow-500 to-orange-500' },
                { icon: Code, label: 'Technologies', value: uniqueTechs.length, suffix: '+', color: 'from-purple-500 to-pink-500' },
                { icon: TrendingUp, label: 'Years Experience', value: settings.profile.years_experience || '3', suffix: '+', color: 'from-green-500 to-emerald-500' },
              ].map((stat, idx) => (
                <div key={idx} className="group relative p-6 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${stat.color}`} />
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stat.value}{stat.suffix}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Section */}
          <div className="rounded-3xl border bg-card/50 backdrop-blur-sm p-8 md:p-12 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-1 h-12 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full" />
              <div>
                <h2 className="text-3xl font-bold">Skills & Technologies</h2>
                <p className="text-muted-foreground">Technologies I work with</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skills.map((skill) => (
                <div key={skill.id} className="space-y-3 p-4 rounded-2xl bg-background/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Code className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{skill.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{skill.category}</Badge>
                      <span className="text-sm text-muted-foreground font-mono">{skill.level}%</span>
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
              {skills.length === 0 && (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No skills added yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Experience Timeline */}
          <div className="rounded-3xl border bg-card/50 backdrop-blur-sm p-8 md:p-12 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-1 h-12 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
              <div>
                <h2 className="text-3xl font-bold">Work Experience</h2>
                <p className="text-muted-foreground">My professional journey</p>
              </div>
            </div>
            {experiences.length > 0 ? (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-red-500 to-pink-500" />

                <div className="space-y-8">
                  {experiences.map((exp, index) => (
                    <div key={exp.id} className="relative pl-12">
                      {/* Timeline dot */}
                      <div className="absolute left-2 top-2 w-5 h-5 rounded-full bg-gradient-to-br from-orange-500 to-red-500 border-4 border-background shadow-lg" />

                      <div className="p-6 rounded-2xl bg-background/50 border border-border/50 hover:border-primary/20 transition-all duration-300">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-xl font-bold">{exp.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-muted-foreground mt-1">
                              <Briefcase className="h-4 w-4" />
                              <span className="font-medium">{exp.company}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatExperienceDate(exp.startDate)} - {exp.current ? 'Present' : exp.endDate ? formatExperienceDate(exp.endDate) : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {exp.location && (
                          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                            <MapPin className="h-4 w-4" />
                            <span>{exp.location}</span>
                            {exp.employmentType && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">{exp.employmentType}</Badge>
                              </>
                            )}
                          </div>
                        )}

                        {exp.description && (
                          <p className="text-muted-foreground leading-relaxed mb-4">
                            {exp.description}
                          </p>
                        )}

                        {exp.responsibilities.length > 0 && (
                          <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                            {exp.responsibilities.slice(0, 3).map((resp, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>{resp}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {exp.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {exp.skills.map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No work experience added yet.</p>
                <Link href="/admin/experience" className="text-primary hover:underline mt-2 inline-block">
                  Add your experience in the admin panel
                </Link>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="relative overflow-hidden rounded-3xl">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-secondary/20" />

            <div className="relative p-12 md:p-16 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto">
                <Users className="h-10 w-10 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl md:text-5xl font-bold">Let's Work Together</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  I'm always interested in hearing about new projects and opportunities. Feel free to reach out!
                </p>
              </div>
              <div className="flex flex-wrap gap-4 justify-center pt-4">
                <Button asChild size="lg" className="gap-2 text-base px-8">
                  <Link href="/projects">
                    <Briefcase className="h-5 w-5" />
                    View My Work
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2 text-base px-8">
                  <Link href="/contact">
                    <Mail className="h-5 w-5" />
                    Get in Touch
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

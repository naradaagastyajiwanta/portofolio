import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

const defaults: { key: string; value: string; group: string }[] = [
  // ─── Profile ─────────────────────────────────────────────────────────
  { key: 'profile.display_name', value: 'NAJ', group: 'profile' },
  { key: 'profile.title', value: 'Full-Stack Developer', group: 'profile' },
  { key: 'profile.bio', value: "I'm a passionate full-stack developer with expertise in building modern web applications. My journey in software development started in 2020, and since then, I've been continuously learning and adapting to new technologies.", group: 'profile' },
  { key: 'profile.location', value: 'Indonesia', group: 'profile' },
  { key: 'profile.availability', value: 'Available for freelance work', group: 'profile' },
  { key: 'profile.years_experience', value: '3', group: 'profile' },
  { key: 'profile.avatar_url', value: '', group: 'profile' },
  { key: 'profile.resume_url', value: '', group: 'profile' },

  // ─── Social Links ────────────────────────────────────────────────────
  { key: 'social.github_url', value: 'https://github.com/naradaagastyajiwanta', group: 'social' },
  { key: 'social.linkedin_url', value: 'https://linkedin.com/in/narada-607387219', group: 'social' },
  { key: 'social.twitter_url', value: '', group: 'social' },
  { key: 'social.email', value: 'naradaagastyajiwanta@gmail.com', group: 'social' },

  // ─── SEO & Metadata ─────────────────────────────────────────────────
  { key: 'seo.site_title', value: 'NAJ — Full-Stack Developer Portfolio', group: 'seo' },
  { key: 'seo.site_description', value: 'Portfolio of NAJ, a full-stack developer specializing in TypeScript, React, Next.js, Node.js, and modern web technologies.', group: 'seo' },
  { key: 'seo.keywords', value: 'developer,portfolio,full-stack,TypeScript,React,Next.js,Node.js,web developer', group: 'seo' },
  { key: 'seo.og_image_url', value: '', group: 'seo' },

  // ─── Integrations ───────────────────────────────────────────────────
  { key: 'integrations.github_username', value: 'naradaagastyajiwanta', group: 'integrations' },
  { key: 'integrations.github_token', value: process.env.GITHUB_TOKEN || '', group: 'integrations' },
  { key: 'integrations.linkedin_slug', value: process.env.LINKEDIN_SLUG || '', group: 'integrations' },
  { key: 'integrations.linkedin_li_at', value: process.env.LINKEDIN_LI_AT || '', group: 'integrations' },
  { key: 'integrations.linkedin_jsessionid', value: process.env.LINKEDIN_JSESSIONID || '', group: 'integrations' },
  { key: 'integrations.smtp_host', value: process.env.SMTP_HOST || '', group: 'integrations' },
  { key: 'integrations.smtp_port', value: process.env.SMTP_PORT || '587', group: 'integrations' },
  { key: 'integrations.smtp_user', value: process.env.SMTP_USER || '', group: 'integrations' },
  { key: 'integrations.smtp_pass', value: process.env.SMTP_PASS || '', group: 'integrations' },
  { key: 'integrations.notify_email', value: process.env.NOTIFY_EMAIL || '', group: 'integrations' },
];

async function seed() {
  console.log('Seeding default site settings...');

  let created = 0;
  let skipped = 0;

  for (const setting of defaults) {
    const existing = await prisma.siteSetting.findUnique({ where: { key: setting.key } });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.siteSetting.create({ data: setting });
    created++;
  }

  console.log(`Done: ${created} created, ${skipped} already existed.`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

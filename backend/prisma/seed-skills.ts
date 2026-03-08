import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const skills = [
  { name: 'TypeScript', level: 90, category: 'Language', order: 1 },
  { name: 'JavaScript', level: 95, category: 'Language', order: 2 },
  { name: 'Python', level: 85, category: 'Language', order: 3 },
  { name: 'React', level: 90, category: 'Frontend', order: 4 },
  { name: 'Next.js', level: 88, category: 'Frontend', order: 5 },
  { name: 'Tailwind CSS', level: 92, category: 'Frontend', order: 6 },
  { name: 'Node.js', level: 87, category: 'Backend', order: 7 },
  { name: 'Fastify', level: 82, category: 'Backend', order: 8 },
  { name: 'PostgreSQL', level: 85, category: 'Database', order: 9 },
  { name: 'Prisma', level: 84, category: 'Database', order: 10 },
  { name: 'Docker', level: 80, category: 'DevOps', order: 11 },
  { name: 'Git', level: 93, category: 'Tools', order: 12 },
];

async function main() {
  console.log('Seeding skills...');
  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: { level: skill.level, category: skill.category, order: skill.order },
      create: skill,
    });
    console.log(`  ✓ ${skill.name} (${skill.category}) — ${skill.level}%`);
  }
  console.log(`\nDone! Seeded ${skills.length} skills.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

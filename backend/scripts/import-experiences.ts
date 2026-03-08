import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const experiences = [
  {
    title: "Software Engineer",
    company: "Asosiasi AI Indonesia",
    location: "Jakarta Raya, Indonesia",
    employmentType: "Full-time",
    startDate: new Date("2025-08-01"),
    endDate: null,
    current: true,
    description: "Developed and maintained a comprehensive Finance Management System using CodeIgniter, integrating a Python-based Agentic AI to automate and enhance financial workflows. Designed and implemented API integrations to streamline data processing and improve reporting efficiency within the finance module. Served as AI Facilitator and Trainer, delivering workshops and assisting participants in AI and BNSP Certification Programs.",
    responsibilities: [
      "Developed Finance Management System using CodeIgniter with Python Agentic AI integration",
      "Implemented API integrations for streamlined data processing and reporting",
      "Facilitated AI workshops and BNSP Certification Programs",
      "Collaborated with cross-functional teams for system reliability and scalability"
    ],
    skills: ["CodeIgniter", "Python", "AI Integration", "API Development", "Training"],
    order: 0,
    showOnAbout: true
  },
  {
    title: "Post Production Manager",
    company: "G1Production",
    location: "India",
    employmentType: "Full-time",
    startDate: new Date("2025-05-01"),
    endDate: null,
    current: true,
    description: "Managing post-production workflows and coordinating creative teams.",
    responsibilities: [
      "Oversee post-production processes",
      "Coordinate with creative teams",
      "Manage production timelines"
    ],
    skills: ["Post-Production", "Project Management", "Team Leadership"],
    order: 1,
    showOnAbout: true
  },
  {
    title: "Freelance Video Editor",
    company: "G1Production",
    location: "India",
    employmentType: "Contract",
    startDate: new Date("2024-12-01"),
    endDate: new Date("2025-05-01"),
    current: false,
    description: "Freelance video editing for various projects.",
    responsibilities: [
      "Edited video content for clients",
      "Managed project deadlines",
      "Collaborated with creative teams"
    ],
    skills: ["Video Editing", "Adobe Premiere", "After Effects"],
    order: 2,
    showOnAbout: true
  },
  {
    title: "Marketing Staff",
    company: "Rumah Sehat Holistik Satu Bumi",
    location: "Bogor, West Java, Indonesia",
    employmentType: "Full-time",
    startDate: new Date("2023-12-01"),
    endDate: null,
    current: true,
    description: "Managing marketing campaigns and digital presence.",
    responsibilities: [
      "Manage end-to-end marketing campaigns",
      "Increased website traffic by 30% through SEO",
      "Created social media strategy",
      "Analyzed campaign performance and ROI"
    ],
    skills: ["Digital Marketing", "SEO", "Social Media", "Analytics"],
    order: 3,
    showOnAbout: true
  },
  {
    title: "Marketing Staff",
    company: "Asosiasi Meditasi Aushadh Yoga Indonesia",
    location: "Jakarta, Indonesia",
    employmentType: "Full-time",
    startDate: new Date("2022-08-01"),
    endDate: new Date("2025-08-01"),
    current: false,
    description: "Led marketing initiatives for wellness association.",
    responsibilities: [
      "Managed marketing campaigns across platforms",
      "Increased Instagram & TikTok followers by 20%",
      "Managed influencer and brand ambassador relationships",
      "Created marketing materials and content"
    ],
    skills: ["Marketing Strategy", "Social Media Marketing", "Content Creation", "Partnership Management"],
    order: 4,
    showOnAbout: true
  },
  {
    title: "Chairman Committee",
    company: "MinuteComp.2021",
    location: "Bali, Indonesia",
    employmentType: "Volunteer",
    startDate: new Date("2021-01-01"),
    endDate: new Date("2021-05-01"),
    current: false,
    description: "Led committee to organize poster and video competition for 160 high school students across Indonesia.",
    responsibilities: [
      "Led committee of 15 students",
      "Organized competition for 160 high school students",
      "Managed $1000 budget and sponsorships",
      "Facilitated technical meetings and judging process"
    ],
    skills: ["Leadership", "Event Management", "Budget Management", "Team Coordination"],
    order: 5,
    showOnAbout: true
  }
];

async function importExperiences() {
  try {
    console.log('Starting import...');

    for (const exp of experiences) {
      const result = await prisma.experience.upsert({
        where: {
          // Try to find by title + company
          id: (await prisma.experience.findFirst({
            where: { title: exp.title, company: exp.company },
            select: { id: true }
          }))?.id || 'new'
        },
        create: exp,
        update: exp
      });
      console.log(`✅ Imported: ${exp.title} at ${exp.company}`);
    }

    console.log('\n✅ All experiences imported successfully!');
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importExperiences();

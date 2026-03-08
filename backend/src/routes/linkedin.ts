import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { scrapeLinkedInProfile, positionToExperienceData } from '../services/linkedinScraper.js';

const prisma = new PrismaClient();

const LINKEDIN_SLUG = process.env.LINKEDIN_SLUG ?? 'narada-607387219';

export default async function linkedinRoutes(fastify: FastifyInstance) {

  // GET preview — fetch from LinkedIn tapi jangan simpan ke DB
  fastify.get('/api/admin/linkedin/preview', async (_request, reply) => {
    try {
      const profile = await scrapeLinkedInProfile(LINKEDIN_SLUG);
      return { success: true, profile };
    } catch (err: any) {
      reply.code(400).send({ success: false, error: err.message });
    }
  });

  // POST sync — fetch dari LinkedIn dan upsert ke DB
  fastify.post('/api/admin/linkedin/sync', async (_request, reply) => {
    try {
      const profile = await scrapeLinkedInProfile(LINKEDIN_SLUG);

      if (profile.positions.length === 0) {
        return reply.code(400).send({
          success: false,
          error: 'Tidak ada data experience ditemukan. Pastikan LINKEDIN_LI_AT valid dan profil bisa diakses.',
        });
      }

      const results = await Promise.all(
        profile.positions.map(async (pos, i) => {
          const expData = positionToExperienceData(pos, i);

          // Upsert: match berdasarkan title + company
          const existing = await prisma.experience.findFirst({
            where: { title: expData.title, company: expData.company },
            select: { id: true },
          });

          if (existing) {
            return prisma.experience.update({
              where: { id: existing.id },
              data: {
                location: expData.location,
                description: expData.description,
                startDate: expData.startDate,
                endDate: expData.endDate,
                current: expData.current,
                order: expData.order,
              },
            });
          } else {
            return prisma.experience.create({ data: expData });
          }
        })
      );

      return {
        success: true,
        message: `Berhasil sync ${results.length} experience dari LinkedIn`,
        count: results.length,
        profile: {
          name: `${profile.firstName} ${profile.lastName}`,
          headline: profile.headline,
        },
      };
    } catch (err: any) {
      reply.code(400).send({ success: false, error: err.message });
    }
  });
}

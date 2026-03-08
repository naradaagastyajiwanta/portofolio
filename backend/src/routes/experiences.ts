import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// Parse LinkedIn date format e.g. "Jan 2020", "Feb 2022", "2020-01"
function parseLinkedInDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  const trimmed = dateStr.trim();
  // Format: "Jan 2020"
  const shortMonth = trimmed.match(/^([A-Za-z]{3})\s+(\d{4})$/);
  if (shortMonth) {
    return new Date(`${shortMonth[1]} 1, ${shortMonth[2]}`);
  }
  // Format: "2020-01" or "2020-01-15"
  const isoLike = trimmed.match(/^(\d{4})-(\d{2})/);
  if (isoLike) {
    return new Date(trimmed);
  }
  // Try fallback
  const fallback = new Date(trimmed);
  return isNaN(fallback.getTime()) ? null : fallback;
}

export default async function experienceRoutes(fastify: FastifyInstance) {
  // Get all experiences (public)
  fastify.get('/api/experiences', async (request, reply) => {
    try {
      const experiences = await prisma.experience.findMany({
        where: { showOnAbout: true },
        orderBy: [
          { order: 'asc' },
          { startDate: 'desc' }
        ],
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          employmentType: true,
          startDate: true,
          endDate: true,
          current: true,
          description: true,
          responsibilities: true,
          skills: true,
          order: true
        }
      });

      return experiences;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch experiences' });
    }
  });

  // Get single experience (public)
  fastify.get<{ Params: { id: string } }>('/api/experiences/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      
      const experience = await prisma.experience.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          employmentType: true,
          startDate: true,
          endDate: true,
          current: true,
          description: true,
          responsibilities: true,
          skills: true,
          order: true,
          showOnAbout: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!experience) {
        return reply.code(404).send({ error: 'Experience not found' });
      }

      return experience;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch experience' });
    }
  });

  // Get all experiences for admin (including hidden)
  fastify.get('/api/admin/experiences', async (request, reply) => {
    try {
      const experiences = await prisma.experience.findMany({
        orderBy: [
          { order: 'asc' },
          { startDate: 'desc' }
        ]
      });

      return experiences;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch experiences' });
    }
  });

  // Create experience (admin/webhook)
  fastify.post<{
    Body: {
      title: string;
      company: string;
      location?: string;
      employmentType?: string;
      startDate: string;
      endDate?: string;
      current?: boolean;
      description?: string;
      responsibilities?: string[];
      skills?: string[];
      order?: number;
      showOnAbout?: boolean;
    }
  }>('/api/admin/experiences', async (request, reply) => {
    try {
      const experience = await prisma.experience.create({
        data: {
          title: request.body.title,
          company: request.body.company,
          location: request.body.location,
          employmentType: request.body.employmentType,
          startDate: new Date(request.body.startDate),
          endDate: request.body.endDate ? new Date(request.body.endDate) : null,
          current: request.body.current ?? false,
          description: request.body.description,
          responsibilities: request.body.responsibilities ?? [],
          skills: request.body.skills ?? [],
          order: request.body.order ?? 0,
          showOnAbout: request.body.showOnAbout ?? true
        }
      });

      return experience;
    } catch (error) {
      console.error('Create experience error:', error);
      reply.code(500).send({ error: 'Failed to create experience' });
    }
  });

  // Update experience (admin)
  fastify.put<{
    Params: { id: string };
    Body: {
      title?: string;
      company?: string;
      location?: string;
      employmentType?: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
      description?: string;
      responsibilities?: string[];
      skills?: string[];
      order?: number;
      showOnAbout?: boolean;
    }
  }>('/api/admin/experiences/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const updateData: any = { ...request.body };

      // Convert date strings to Date objects
      if (updateData.startDate) {
        updateData.startDate = new Date(updateData.startDate);
      }
      if (updateData.endDate) {
        updateData.endDate = new Date(updateData.endDate);
      }

      const experience = await prisma.experience.update({
        where: { id },
        data: updateData
      });

      return experience;
    } catch (error) {
      console.error('Update experience error:', error);
      reply.code(500).send({ error: 'Failed to update experience' });
    }
  });

  // Delete experience (admin)
  fastify.delete<{ Params: { id: string } }>('/api/admin/experiences/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      await prisma.experience.delete({
        where: { id }
      });

      return { success: true, message: 'Experience deleted' };
    } catch (error) {
      console.error('Delete experience error:', error);
      reply.code(500).send({ error: 'Failed to delete experience' });
    }
  });

  // Bulk upsert for Zapier/Make.com webhooks
  fastify.post<{
    Body: {
      experiences: Array<{
        title: string;
        company: string;
        location?: string;
        employmentType?: string;
        startDate: string;
        endDate?: string;
        current?: boolean;
        description?: string;
        responsibilities?: string[];
        skills?: string[];
      }>
    }
  }>('/api/webhook/experiences', async (request, reply) => {
    try {
      const { experiences } = request.body;

      // Clear existing and insert new
      await prisma.experience.deleteMany({});

      const created = await Promise.all(
        experiences.map((exp, index) =>
          prisma.experience.create({
            data: {
              title: exp.title,
              company: exp.company,
              location: exp.location,
              employmentType: exp.employmentType,
              startDate: new Date(exp.startDate),
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              current: exp.current ?? false,
              description: exp.description,
              responsibilities: exp.responsibilities ?? [],
              skills: exp.skills ?? [],
              order: index,
              showOnAbout: true
            }
          })
        )
      );

      return {
        success: true,
        message: `Successfully synced ${created.length} experiences`,
        count: created.length
      };
    } catch (error) {
      console.error('Webhook sync error:', error);
      reply.code(500).send({ error: 'Failed to sync experiences' });
    }
  });

  // Import from LinkedIn Positions.csv
  // CSV columns: Company Name, Title, Description, Location, Started On, Finished On
  fastify.post('/api/admin/linkedin/import', async (request, reply) => {
    try {
      const file = await request.file();
      if (!file) {
        return reply.code(400).send({ error: 'No file uploaded' });
      }

      const chunks: Buffer[] = [];
      for await (const chunk of file.file) {
        chunks.push(chunk);
      }
      const csvContent = Buffer.concat(chunks).toString('utf-8');

      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true, // handle UTF-8 BOM from LinkedIn export
      }) as Record<string, string>[];

      if (records.length === 0) {
        return reply.code(400).send({ error: 'CSV file is empty or invalid' });
      }

      // Detect column names (LinkedIn uses different names depending on export language)
      const sample = records[0];
      const companyKey = Object.keys(sample).find(k => /company/i.test(k)) ?? 'Company Name';
      const titleKey = Object.keys(sample).find(k => /title/i.test(k)) ?? 'Title';
      const descKey = Object.keys(sample).find(k => /description/i.test(k)) ?? 'Description';
      const locationKey = Object.keys(sample).find(k => /location/i.test(k)) ?? 'Location';
      const startedKey = Object.keys(sample).find(k => /started/i.test(k)) ?? 'Started On';
      const finishedKey = Object.keys(sample).find(k => /finished/i.test(k)) ?? 'Finished On';

      const imported: typeof records = [];
      const skipped: string[] = [];

      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        const company = row[companyKey]?.trim();
        const title = row[titleKey]?.trim();
        const startDateRaw = row[startedKey]?.trim();

        if (!company || !title || !startDateRaw) {
          skipped.push(`Row ${i + 2}: missing company, title, or start date`);
          continue;
        }

        const startDate = parseLinkedInDate(startDateRaw);
        if (!startDate) {
          skipped.push(`Row ${i + 2}: invalid start date "${startDateRaw}"`);
          continue;
        }

        const finishedRaw = row[finishedKey]?.trim();
        const endDate = finishedRaw ? parseLinkedInDate(finishedRaw) : null;
        const current = !finishedRaw;

        // Upsert: match on title + company to avoid duplicates
        await prisma.experience.upsert({
          where: {
            // We use a unique compound — fallback to create if not found
            // Prisma doesn't support findFirst in upsert so we use a workaround
            id: (await prisma.experience.findFirst({
              where: { title, company },
              select: { id: true }
            }))?.id ?? 'new',
          },
          create: {
            title,
            company,
            location: row[locationKey]?.trim() || undefined,
            description: row[descKey]?.trim() || undefined,
            startDate,
            endDate,
            current,
            responsibilities: [],
            skills: [],
            order: i,
            showOnAbout: true,
          },
          update: {
            location: row[locationKey]?.trim() || undefined,
            description: row[descKey]?.trim() || undefined,
            startDate,
            endDate,
            current,
          },
        });
        imported.push(row);
      }

      return {
        success: true,
        message: `Imported ${imported.length} experience(s)${skipped.length ? `, skipped ${skipped.length}` : ''}`,
        imported: imported.length,
        skipped,
      };
    } catch (error) {
      console.error('LinkedIn CSV import error:', error);
      reply.code(500).send({ error: 'Failed to import CSV' });
    }
  });
}

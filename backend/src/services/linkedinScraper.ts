export interface LinkedInPosition {
  title: string;
  companyName: string;
  locationName?: string;
  description?: string;
  timePeriod: {
    startDate?: { year: number; month?: number };
    endDate?: { year: number; month?: number };
  };
  current: boolean;
}

export interface LinkedInProfile {
  firstName: string;
  lastName: string;
  headline?: string;
  summary?: string;
  positions: LinkedInPosition[];
}

function buildHeaders(liAt: string): Record<string, string> {
  const csrfToken = process.env.LINKEDIN_JSESSIONID ?? 'ajax:0123456789';
  return {
    'Cookie': `li_at=${liAt}; JSESSIONID="${csrfToken}"`,
    'Csrf-Token': csrfToken,
    'X-Restli-Protocol-Version': '2.0.0',
    'X-Li-Lang': 'en_US',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/vnd.linkedin.normalized+json+2.1',
    'Accept-Language': 'en-US,en;q=0.9',
    'x-li-track':
      '{"clientVersion":"1.13.2000","mpVersion":"1.13.2000","osName":"web","timezoneOffset":7,"timezone":"Asia/Jakarta","deviceFormFactor":"DESKTOP","mpName":"voyager-web"}',
  };
}

function parseDate(d?: { year: number; month?: number }): Date | null {
  if (!d?.year) return null;
  return new Date(d.year, (d.month ?? 1) - 1, 1);
}

export async function scrapeLinkedInProfile(slug: string): Promise<LinkedInProfile> {
  const liAt = process.env.LINKEDIN_LI_AT;
  if (!liAt) throw new Error('LINKEDIN_LI_AT not set in environment variables');

  const url = `https://www.linkedin.com/voyager/api/identity/profiles/${slug}/profileView`;

  // Use undici for better fetch support
  const undici = await import('undici');
  const res = await undici.fetch(url, {
    headers: buildHeaders(liAt),
    signal: AbortSignal.timeout(15000),
  } as any);

  if (res.status === 401 || res.status === 403) {
    throw new Error('LinkedIn auth failed — cek nilai LINKEDIN_LI_AT di .env (mungkin sudah expired)');
  }
  if (res.status === 999) {
    throw new Error('LinkedIn memblokir request — coba lagi beberapa menit kemudian');
  }
  if (!res.ok) {
    throw new Error(`LinkedIn request gagal: HTTP ${res.status}`);
  }

  const data: any = await res.json();

  const profile = data?.data ?? data;
  const included: any[] = data?.included ?? [];

  const firstName: string = profile?.profile?.firstName ?? profile?.firstName ?? '';
  const lastName: string = profile?.profile?.lastName ?? profile?.lastName ?? '';
  const headline: string = profile?.profile?.headline ?? profile?.headline ?? '';
  const summary: string = profile?.profile?.summary ?? profile?.summary ?? '';

  const rawPositions: any[] =
    profile?.positionView?.values ??
    profile?.positions?.values ??
    included.filter((i: any) => i?.$type?.includes('Position') || i?.$type?.includes('position')) ??
    [];

  const positions: LinkedInPosition[] = rawPositions.map((p: any) => ({
    title: p.title ?? '',
    companyName: p.companyName ?? p.company?.name ?? '',
    locationName: p.locationName ?? p.location?.name ?? undefined,
    description: p.description ?? undefined,
    timePeriod: {
      startDate: p.timePeriod?.startDate ?? undefined,
      endDate: p.timePeriod?.endDate ?? undefined,
    },
    current: p.timePeriod?.endDate == null,
  }));

  return { firstName, lastName, headline, summary, positions };
}

export function positionToExperienceData(pos: LinkedInPosition, order: number) {
  const startDate = parseDate(pos.timePeriod.startDate) ?? new Date();
  const endDate = parseDate(pos.timePeriod.endDate) ?? null;

  return {
    title: pos.title,
    company: pos.companyName,
    location: pos.locationName ?? null,
    description: pos.description ?? null,
    startDate,
    endDate,
    current: endDate === null,
    responsibilities: [] as string[],
    skills: [] as string[],
    order,
    showOnAbout: true,
  };
}

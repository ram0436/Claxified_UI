export interface BusinessUrlSource {
  tabRefGUID?: string | null;
  businessId?: string | null;
  businessName?: string | null;
  city?: string | null;
  area?: string | null;
  businessAddressDto?: { city?: string | null; area?: string | null } | null;
}

const FALLBACK_CITY = 'india';

export function slugify(value: string | null | undefined): string {
  return (value || '')
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** First few letters of the GUID, till the first "-" */
export function getUniqueSlug(guid: string | null | undefined): string {
  return ((guid || '').trim().split('-')[0] || '').toLowerCase();
}

/** Last "-" separated part of "{business-name}-{area}-{unique-slug}" */
export function extractUniqueSlug(
  businessSlug: string | null | undefined,
): string {
  const parts = (businessSlug || '').trim().split('-');
  return (parts[parts.length - 1] || '').toLowerCase();
}

// ---- slug -> full GUID cache (persisted, so refresh / new tab is instant) ----
const CACHE_KEY = 'biz_slug_guid_map';
const CACHE_LIMIT = 500;

function readCache(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

export function rememberBusinessGuid(guid: string | null | undefined): void {
  const slug = getUniqueSlug(guid);
  if (!slug || !guid) return;
  try {
    const map = readCache();
    if (map[slug] === guid) return;
    delete map[slug];
    map[slug] = guid;
    const keys = Object.keys(map);
    if (keys.length > CACHE_LIMIT) {
      keys.slice(0, keys.length - CACHE_LIMIT).forEach((k) => delete map[k]);
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {}
}

/** Batch version: a single localStorage read/write for many GUIDs */
export function rememberBusinessGuids(
  guids: (string | null | undefined)[],
): void {
  try {
    const map = readCache();
    for (const guid of guids) {
      const slug = getUniqueSlug(guid);
      if (!slug || !guid) continue;
      delete map[slug];
      map[slug] = guid;
    }
    const keys = Object.keys(map);
    if (keys.length > CACHE_LIMIT) {
      keys.slice(0, keys.length - CACHE_LIMIT).forEach((k) => delete map[k]);
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {}
}

export function getCachedBusinessGuid(slug: string): string | null {
  return readCache()[(slug || '').toLowerCase()] || null;
}

export function forgetBusinessSlug(slug: string): void {
  try {
    const map = readCache();
    delete map[(slug || '').toLowerCase()];
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {}
}

/** Returns router commands: ['/business', city, 'name-area-slug'] or null if no GUID */
export function buildBusinessCommands(b: BusinessUrlSource): string[] | null {
  const guid = b.tabRefGUID || b.businessId || '';
  const uniqueSlug = getUniqueSlug(guid);
  if (!uniqueSlug) return null;
  rememberBusinessGuid(guid);

  const city = slugify(b.businessAddressDto?.city ?? b.city) || FALLBACK_CITY;
  const area = slugify(b.businessAddressDto?.area ?? b.area);
  const name = slugify(b.businessName) || 'business';

  const last = [name, area, uniqueSlug].filter(Boolean).join('-');
  return ['/business', city, last];
}

export function buildBusinessPath(b: BusinessUrlSource): string {
  const cmds = buildBusinessCommands(b);
  return cmds ? cmds.join('/').replace('//', '/') : '';
}

import {
  getUniqueSlug,
  slugify,
} from '../../modules/business/utils/business-url.util';

/**
 * Classified-ad post URL helpers.
 *
 * URL format:
 *   /classified-ads/{category}/{city}/{title}-{unique-slug}
 * e.g.
 *   /classified-ads/properties/bangalore/furnished-4bhk-house-for-sale-in-bangalore-06f3e516
 *
 * {unique-slug} = first segment of the post tabRefGUID (up to the first "-").
 */

export const CATEGORY_ID_TO_SLUG: { [id: number]: string } = {
  1: 'gadgets',
  2: 'vehicles',
  3: 'properties',
  4: 'jobs',
  5: 'electronics',
  6: 'furniture',
  7: 'books',
  8: 'sports',
  9: 'pets',
  10: 'fashion',
  11: 'commercial-services',
};

export interface PostUrlSource {
  tableRefGuid?: string | null;
  tabRefGuid?: string | null;
  tabRefGUID?: string | null;
  id?: string | null; // classified-ads home uses `id` for the GUID
  title?: string | null;
  city?: string | null;
  categoryId?: number | string | null;
  /** Optional: category name / route when categoryId is not available */
  category?: string | null;
}

const FALLBACK_CITY = 'india';
const MAX_TITLE_SLUG = 70;

/** "Electronics & Appliances" / "Electronics" / "Commercial Services" -> url slug */
export function categorySlugFromName(name: string | null | undefined): string {
  const n = slugify(name);
  if (!n) return '';
  if (n.startsWith('electronics')) return 'electronics';
  if (n.startsWith('sports')) return 'sports';
  if (n === 'commercial-service') return 'commercial-services';
  return n;
}

export function categorySlugFromId(id: number | string | null | undefined): string {
  return CATEGORY_ID_TO_SLUG[Number(id)] || '';
}

/** Router commands, or null when the GUID / category cannot be determined */
export function buildPostCommands(p: PostUrlSource): string[] | null {
  const guid = p.tableRefGuid || p.tabRefGuid || p.tabRefGUID || p.id || '';
  const uniqueSlug = getUniqueSlug(guid);
  const category =
    categorySlugFromId(p.categoryId) || categorySlugFromName(p.category);
  if (!uniqueSlug || !category) return null;

  rememberPostGuid(guid);

  const city = slugify(p.city) || FALLBACK_CITY;
  const title = slugify(p.title).slice(0, MAX_TITLE_SLUG).replace(/-+$/g, '');
  const last = [title || 'post', uniqueSlug].join('-');
  return ['/classified-ads', category, city, last];
}

export function buildPostPath(p: PostUrlSource): string {
  const cmds = buildPostCommands(p);
  return cmds ? cmds.join('/') : '';
}

/** Last "-" separated part of "{title}-{unique-slug}" */
export function extractPostUniqueSlug(postSlug: string | null | undefined): string {
  const parts = (postSlug || '').trim().split('-');
  return (parts[parts.length - 1] || '').toLowerCase();
}

// ---- slug -> full GUID cache (persisted: refresh / new tab stay instant) ----
// An in-memory copy avoids re-parsing localStorage for every card on every change detection.
const CACHE_KEY = 'post_slug_guid_map';
const CACHE_LIMIT = 1000;
let memCache: Record<string, string> | null = null;
let flushScheduled = false;

function cache(): Record<string, string> {
  if (!memCache) {
    try {
      memCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') || {};
    } catch {
      memCache = {};
    }
  }
  return memCache as Record<string, string>;
}

function scheduleFlush(): void {
  if (flushScheduled) return;
  flushScheduled = true;
  Promise.resolve().then(() => {
    flushScheduled = false;
    try {
      const map = cache();
      const keys = Object.keys(map);
      if (keys.length > CACHE_LIMIT) {
        keys.slice(0, keys.length - CACHE_LIMIT).forEach((k) => delete map[k]);
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(map));
    } catch {}
  });
}

export function rememberPostGuids(guids: (string | null | undefined)[]): void {
  const map = cache();
  let changed = false;
  for (const guid of guids) {
    const slug = getUniqueSlug(guid);
    if (!slug || !guid || map[slug] === guid) continue;
    delete map[slug];
    map[slug] = guid;
    changed = true;
  }
  if (changed) scheduleFlush();
}

export function rememberPostGuid(guid: string | null | undefined): void {
  rememberPostGuids([guid]);
}

export function getCachedPostGuid(slug: string): string | null {
  return cache()[(slug || '').toLowerCase()] || null;
}

export function forgetPostSlug(slug: string): void {
  delete cache()[(slug || '').toLowerCase()];
  scheduleFlush();
}

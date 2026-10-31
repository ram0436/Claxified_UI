export enum BusinessAnalyticsEventType {
  ProfileView = 1,
  SearchAppearance = 2,
  SavedBusiness = 3,
  Wishlist = 4,
  Share = 5,
  GalleryView = 6,
  ReviewView = 7,
  OfferView = 8,
  Call = 9,
  WhatsAppClick = 10,
  Enquiry = 11,
  WebsiteClick = 12,
  DirectionClick = 13,
  Lead = 14,
  ConvertedLead = 15,
}

export enum BusinessOfferingAnalyticsEventType {
  View = 1,
  Call = 2,
  WhatsAppClick = 3,
  Enquiry = 4,
  Lead = 5,
  ConvertedLead = 6,
}

export type AnalyticsGranularity = 'daily' | 'weekly' | 'monthly';

export interface AnalyticsEventMeta {
  id: number;
  key: string;
  label: string;
  icon: string;
  color: string;
}

const meta = (
  id: number,
  key: string,
  label: string,
  icon: string,
  color: string,
): AnalyticsEventMeta => ({ id, key, label, icon, color });

export const BUSINESS_EVENT_META: AnalyticsEventMeta[] = [
  meta(1, 'ProfileView', 'Profile Views', 'visibility', '#5b31e0'),
  meta(2, 'SearchAppearance', 'Search Appearances', 'search', '#0f3b5f'),
  meta(3, 'SavedBusiness', 'Saves', 'bookmark', '#e5194f'),
  meta(4, 'Wishlist', 'Wishlists', 'favorite', '#d6336c'),
  meta(5, 'Share', 'Shares', 'share', '#1c7ed6'),
  meta(6, 'GalleryView', 'Gallery Views', 'photo_library', '#7048e8'),
  meta(7, 'ReviewView', 'Review Views', 'rate_review', '#f08c00'),
  meta(8, 'OfferView', 'Offer Views', 'local_offer', '#e8590c'),
  meta(9, 'Call', 'Calls', 'call', '#1fa971'),
  meta(10, 'WhatsAppClick', 'WhatsApp Clicks', 'chat', '#2f9e44'),
  meta(11, 'Enquiry', 'Enquiries', 'mail_outline', '#0c8599'),
  meta(12, 'WebsiteClick', 'Website Clicks', 'language', '#3b5bdb'),
  meta(13, 'DirectionClick', 'Direction Clicks', 'directions', '#862e9c'),
  meta(14, 'Lead', 'Leads', 'person_add', '#c2255c'),
  meta(15, 'ConvertedLead', 'Converted Leads', 'verified', '#087f5b'),
];

export const OFFERING_EVENT_META: AnalyticsEventMeta[] = [
  meta(1, 'View', 'Views', 'visibility', '#5b31e0'),
  meta(2, 'Call', 'Calls', 'call', '#1fa971'),
  meta(3, 'WhatsAppClick', 'WhatsApp Clicks', 'chat', '#2f9e44'),
  meta(4, 'Enquiry', 'Enquiries', 'mail_outline', '#0c8599'),
  meta(5, 'Lead', 'Leads', 'person_add', '#c2255c'),
  meta(6, 'ConvertedLead', 'Converted Leads', 'verified', '#087f5b'),
];

export interface AnalyticsSeriesPoint {
  date: Date | null;
  label: string;
  counts: Record<number, number>;
}

export type AnalyticsTotals = Record<number, number>;

const WRAPPER_KEYS = [
  'items',
  'data',
  'results',
  'result',
  'summary',
  'totals',
  'events',
  'series',
  'points',
  'buckets',
  'daily',
  'weekly',
  'monthly',
];

const DATE_KEYS = [
  'date',
  'day',
  'period',
  'periodStart',
  'startDate',
  'weekStart',
  'monthStart',
  'month',
  'week',
  'label',
  'name',
];

const COUNT_KEYS = ['count', 'total', 'value', 'totalCount', 'eventCount'];

const EVENT_KEYS = ['eventType', 'event', 'type', 'eventName'];

function unwrap(raw: any): any {
  let cur = raw;
  for (let i = 0; i < 3; i++) {
    if (Array.isArray(cur) || cur === null || typeof cur !== 'object') break;
    const key = WRAPPER_KEYS.find(
      (k) => Array.isArray(cur[k]) || (cur[k] && typeof cur[k] === 'object'),
    );
    if (!key) break;
    cur = cur[key];
  }
  return cur;
}

function toNumber(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function lower(s: string): string {
  return String(s)
    .replace(/[\s_-]/g, '')
    .toLowerCase();
}

function keyMatches(rk: string, m: AnalyticsEventMeta): boolean {
  const k = lower(rk);
  const n = lower(m.key);
  return k === n || k === n + 's' || k === n.replace(/y$/, 'ies');
}

function resolveEventId(v: any, metas: AnalyticsEventMeta[]): number | null {
  if (v === null || v === undefined) return null;
  const asNum = Number(v);
  if (Number.isFinite(asNum) && metas.some((m) => m.id === asNum)) {
    return asNum;
  }
  const found = metas.find((m) => keyMatches(String(v), m));
  return found ? found.id : null;
}

function pick(row: any, keys: string[]): any {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null) return row[k];
  }
  return undefined;
}

export function normalizeTotals(
  raw: any,
  metas: AnalyticsEventMeta[],
): AnalyticsTotals {
  const totals: AnalyticsTotals = {};
  metas.forEach((m) => (totals[m.id] = 0));
  const data = unwrap(raw);
  if (!data) return totals;

  if (Array.isArray(data)) {
    data.forEach((row) => {
      if (!row || typeof row !== 'object') return;
      const id = resolveEventId(pick(row, EVENT_KEYS), metas);
      if (id !== null) {
        totals[id] += toNumber(pick(row, COUNT_KEYS));
        return;
      }
      metas.forEach((m) => {
        const k = Object.keys(row).find((rk) => keyMatches(rk, m));
        if (k) totals[m.id] += toNumber(row[k]);
      });
    });
    return totals;
  }

  if (typeof data === 'object') {
    Object.keys(data).forEach((k) => {
      const id = resolveEventId(k, metas);
      if (id !== null) {
        const v = data[k];
        totals[id] += toNumber(
          v && typeof v === 'object' ? pick(v, COUNT_KEYS) : v,
        );
      }
    });
  }
  return totals;
}

function parseDate(v: any): Date | null {
  if (v === undefined || v === null || v === '') return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function formatLabel(
  date: Date | null,
  fallback: string,
  g: AnalyticsGranularity,
): string {
  if (!date) return fallback;
  if (g === 'monthly') {
    return date.toLocaleDateString('en-GB', {
      month: 'short',
      year: '2-digit',
    });
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function normalizeSeries(
  raw: any,
  metas: AnalyticsEventMeta[],
  granularity: AnalyticsGranularity,
): AnalyticsSeriesPoint[] {
  const data = unwrap(raw);
  if (!Array.isArray(data)) return [];

  const buckets = new Map<string, AnalyticsSeriesPoint>();
  const emptyCounts = () => {
    const c: Record<number, number> = {};
    metas.forEach((m) => (c[m.id] = 0));
    return c;
  };

  data.forEach((row, index) => {
    if (!row || typeof row !== 'object') return;
    const rawDate = pick(row, DATE_KEYS);
    const date = parseDate(rawDate);
    const key = date ? date.toISOString() : String(rawDate ?? index);

    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        date,
        label: formatLabel(
          date,
          rawDate !== undefined ? String(rawDate) : String(index + 1),
          granularity,
        ),
        counts: emptyCounts(),
      };
      buckets.set(key, bucket);
    }

    const id = resolveEventId(pick(row, EVENT_KEYS), metas);
    if (id !== null) {
      bucket.counts[id] += toNumber(pick(row, COUNT_KEYS));
    } else {
      const nested = row['events'] ?? row['counts'] ?? row['totals'];
      const source = nested && !Array.isArray(nested) ? nested : row;
      metas.forEach((m) => {
        const k = Object.keys(source).find((rk) => keyMatches(rk, m));
        if (k) bucket!.counts[m.id] += toNumber(source[k]);
      });
      if (Array.isArray(nested)) {
        nested.forEach((n: any) => {
          const nid = resolveEventId(pick(n, EVENT_KEYS), metas);
          if (nid !== null)
            bucket!.counts[nid] += toNumber(pick(n, COUNT_KEYS));
        });
      }
    }
  });

  return Array.from(buckets.values()).sort(
    (a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0),
  );
}

export function totalsFromSeries(
  points: AnalyticsSeriesPoint[],
  metas: AnalyticsEventMeta[],
): AnalyticsTotals {
  const totals: AnalyticsTotals = {};
  metas.forEach((m) => (totals[m.id] = 0));
  points.forEach((p) =>
    metas.forEach((m) => (totals[m.id] += p.counts[m.id] || 0)),
  );
  return totals;
}

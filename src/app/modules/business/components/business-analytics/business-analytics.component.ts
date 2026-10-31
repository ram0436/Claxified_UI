import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { BusinessOfferingDto } from '../../model/Business';
import { BusinessService } from '../../service/business.service';
import {
  AnalyticsEventMeta,
  AnalyticsGranularity,
  AnalyticsSeriesPoint,
  AnalyticsTotals,
  BUSINESS_EVENT_META,
  OFFERING_EVENT_META,
  normalizeSeries,
  normalizeTotals,
  totalsFromSeries,
} from '../../model/business-analytics';

type AnalyticsScope = 'business' | 'offerings';
type RangePreset = '7d' | '30d' | '90d' | 'custom';

interface ChartMetric {
  key: string;
  label: string;
  ids: number[];
  color: string;
}

interface KpiCard {
  label: string;
  icon: string;
  color: string;
  value: number;
  delta: number | null;
  isNew: boolean;
  hint?: string;
}

interface EventGroup {
  title: string;
  icon: string;
  ids: number[];
}

interface FunnelStep {
  label: string;
  value: number;
  width: number;
  rate: number | null;
  color: string;
}

interface ChartGeometry {
  line: string;
  area: string;
  points: { x: number; y: number; value: number; label: string }[];
  yTicks: { label: string; bottom: number }[];
  xTicks: { label: string; left: number }[];
  max: number;
}

const BUSINESS_CHART_METRICS: ChartMetric[] = [
  { key: 'views', label: 'Profile Views', ids: [1], color: '#5b31e0' },
  { key: 'search', label: 'Search Appearances', ids: [2], color: '#0f3b5f' },
  {
    key: 'engagement',
    label: 'Engagement',
    ids: [3, 4, 5, 6, 7, 8],
    color: '#e5194f',
  },
  {
    key: 'contacts',
    label: 'Contact Actions',
    ids: [9, 10, 11, 12, 13],
    color: '#1fa971',
  },
  { key: 'leads', label: 'Leads', ids: [14], color: '#c2255c' },
];

const OFFERING_CHART_METRICS: ChartMetric[] = OFFERING_EVENT_META.map((m) => ({
  key: m.key,
  label: m.label,
  ids: [m.id],
  color: m.color,
}));

const DAY_MS = 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-business-analytics',
  templateUrl: './business-analytics.component.html',
  styleUrls: ['./business-analytics.component.css'],
})
export class BusinessAnalyticsComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() businessId!: number;
  @Input() businessName: string = '';
  @Input() offerings: BusinessOfferingDto[] = [];
  @Output() close = new EventEmitter<void>();
  @Input() embedded = false;

  readonly businessMeta = BUSINESS_EVENT_META;
  readonly offeringMeta = OFFERING_EVENT_META;
  readonly businessChartMetrics = BUSINESS_CHART_METRICS;
  readonly offeringChartMetrics = OFFERING_CHART_METRICS;

  readonly businessGroups: EventGroup[] = [
    { title: 'Reach', icon: 'travel_explore', ids: [1, 2] },
    { title: 'Engagement', icon: 'favorite_border', ids: [3, 4, 5, 6, 7, 8] },
    { title: 'Contact', icon: 'support_agent', ids: [9, 10, 11, 12, 13] },
    { title: 'Leads', icon: 'person_add_alt', ids: [14, 15] },
  ];

  scope: AnalyticsScope = 'business';
  preset: RangePreset = '30d';
  granularity: AnalyticsGranularity = 'daily';

  customFrom = '';
  customTo = '';
  rangeError = '';

  from!: Date;
  to!: Date;

  bizNotFound = false;
  offNotFound = false;

  // ----- Business state ---------------------------------------------------
  bizLoading = false;
  bizError = '';
  bizTotals: AnalyticsTotals = {};
  bizPrevTotals: AnalyticsTotals | null = null;
  bizSeries: AnalyticsSeriesPoint[] = [];
  bizMetricKey = 'views';
  bizChart: ChartGeometry | null = null;
  bizHover: number | null = null;

  // ----- Offering state ---------------------------------------------------
  offeringSearch = '';
  selectedOfferingId: number | null = null;
  offLoading = false;
  offError = '';
  offTotals: AnalyticsTotals = {};
  offSeries: AnalyticsSeriesPoint[] = [];
  offMetricKey = 'View';
  offChart: ChartGeometry | null = null;
  offHover: number | null = null;

  private bizSub?: Subscription;
  private offSub?: Subscription;
  private previousBodyOverflow = '';

  constructor(private analytics: BusinessService) {}

  ngOnInit(): void {
    if (!this.embedded) {
      this.previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    this.applyPreset('30d');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['offerings']) {
      const stillThere = (this.offerings || []).some(
        (o) => o.id === this.selectedOfferingId,
      );
      if (!stillThere) {
        this.selectedOfferingId = this.offerings?.[0]?.id ?? null;
      }
    }

    const businessChanged =
      changes['businessId'] && !changes['businessId'].firstChange;

    if (businessChanged) {
      this.bizTotals = {};
      this.bizPrevTotals = null;
      this.bizSeries = [];
      this.bizChart = null;
      this.offTotals = {};
      this.offSeries = [];
      this.offChart = null;
      this.offError = '';
      this.offeringSearch = '';
      this.reload();
    } else if (
      changes['offerings'] &&
      !changes['offerings'].firstChange &&
      this.scope === 'offerings'
    ) {
      this.loadOffering();
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = this.previousBodyOverflow;
    this.bizSub?.unsubscribe();
    this.offSub?.unsubscribe();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  // =========================================================================
  // Scope & range
  // =========================================================================

  setScope(scope: AnalyticsScope): void {
    if (this.scope === scope) return;
    this.scope = scope;
    if (scope === 'offerings') {
      if (this.selectedOfferingId === null) {
        this.selectedOfferingId = this.offerings[0]?.id ?? null;
      }
      this.loadOffering();
    }
  }

  /** Sets the range from "last N days" (today included) in local time. */
  applyPreset(preset: RangePreset): void {
    this.preset = preset;
    this.rangeError = '';

    if (preset === 'custom') {
      if (!this.customFrom || !this.customTo) {
        this.customTo = this.toInputDate(new Date());
        this.customFrom = this.toInputDate(new Date(Date.now() - 29 * DAY_MS));
      }
      this.applyCustomRange();
      return;
    }

    const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
    const end = new Date();
    const start = new Date(end.getTime() - (days - 1) * DAY_MS);
    this.from = this.startOfDay(start);
    this.to = this.endOfDay(end);
    this.granularity = days >= 90 ? 'weekly' : 'daily';
    this.reload();
  }

  applyCustomRange(): void {
    const from = this.parseInputDate(this.customFrom);
    const to = this.parseInputDate(this.customTo);
    if (!from || !to) {
      this.rangeError = 'Please choose both dates.';
      return;
    }
    if (from.getTime() > to.getTime()) {
      this.rangeError = '"From" date must be on or before "To" date.';
      return;
    }
    this.rangeError = '';
    this.from = this.startOfDay(from);
    this.to = this.endOfDay(to);

    const days = Math.round((to.getTime() - from.getTime()) / DAY_MS) + 1;
    this.granularity = days > 120 ? 'monthly' : days > 45 ? 'weekly' : 'daily';
    this.reload();
  }

  setGranularity(g: AnalyticsGranularity): void {
    if (this.granularity === g) return;
    this.granularity = g;
    this.reload();
  }

  reload(): void {
    this.loadBusiness();
    if (this.scope === 'offerings') this.loadOffering();
  }

  get maxInputDate(): string {
    return this.toInputDate(new Date());
  }

  get rangeLabel(): string {
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    return `${fmt(this.from)} – ${fmt(this.to)}`;
  }

  // =========================================================================
  // Business loading
  // =========================================================================

  loadBusiness(): void {
    if (!this.businessId || !this.from) return;
    this.bizSub?.unsubscribe();
    this.bizLoading = true;
    this.bizError = '';
    this.bizNotFound = false;

    const span = this.to.getTime() - this.from.getTime() + 1;
    const prevTo = new Date(this.from.getTime() - 1);
    const prevFrom = new Date(this.from.getTime() - span);

    this.bizSub = forkJoin({
      summary: this.analytics.getBusinessSummary(
        this.businessId,
        this.from,
        this.to,
      ),
      previous: this.analytics
        .getBusinessSummary(this.businessId, prevFrom, prevTo)
        .pipe(catchError(() => of(null))),
      series: this.analytics.getBusinessSeries(
        this.businessId,
        this.granularity,
        this.from,
        this.to,
      ),
    }).subscribe({
      next: ({ summary, previous, series }) => {
        this.bizTotals = normalizeTotals(summary, BUSINESS_EVENT_META);
        this.bizPrevTotals = previous
          ? normalizeTotals(previous, BUSINESS_EVENT_META)
          : null;
        this.bizSeries = normalizeSeries(
          series,
          BUSINESS_EVENT_META,
          this.granularity,
        );
        this.bizLoading = false;
        this.bizHover = null;
        this.rebuildBusinessChart();
      },
      error: (err) => {
        this.bizLoading = false;
        this.bizError = this.errorMessage(err);
        this.bizNotFound = err?.status === 404;
        this.bizError = this.errorMessage(err);
      },
    });
  }

  setBusinessMetric(key: string): void {
    this.bizMetricKey = key;
    this.bizHover = null;
    this.rebuildBusinessChart();
  }

  private rebuildBusinessChart(): void {
    const metric = this.currentBusinessMetric;
    this.bizChart = this.buildChart(this.bizSeries, metric.ids);
  }

  get currentBusinessMetric(): ChartMetric {
    return (
      BUSINESS_CHART_METRICS.find((m) => m.key === this.bizMetricKey) ||
      BUSINESS_CHART_METRICS[0]
    );
  }

  // ----- Business derived values -----------------------------------------

  bizCount(id: number): number {
    return this.bizTotals[id] || 0;
  }

  bizSum(ids: number[]): number {
    return ids.reduce((s, id) => s + this.bizCount(id), 0);
  }

  private prevSum(ids: number[]): number | null {
    if (!this.bizPrevTotals) return null;
    return ids.reduce((s, id) => s + (this.bizPrevTotals![id] || 0), 0);
  }

  private kpi(
    label: string,
    icon: string,
    color: string,
    ids: number[],
    hint?: string,
  ): KpiCard {
    const value = this.bizSum(ids);
    const prev = this.prevSum(ids);
    let delta: number | null = null;
    let isNew = false;
    if (prev !== null) {
      if (prev > 0) delta = ((value - prev) / prev) * 100;
      else if (value > 0) isNew = true;
      else delta = 0;
    }
    return { label, icon, color, value, delta, isNew, hint };
  }

  get bizKpis(): KpiCard[] {
    return [
      this.kpi('Profile Views', 'visibility', '#5b31e0', [1]),
      this.kpi('Search Appearances', 'search', '#0f3b5f', [2]),
      this.kpi(
        'Contact Actions',
        'touch_app',
        '#1fa971',
        [9, 10, 11, 12, 13],
        'Calls, WhatsApp, enquiries, website & directions',
      ),
      this.kpi('Leads', 'person_add_alt', '#c2255c', [14]),
    ];
  }

  get bizBreakdown(): {
    meta: AnalyticsEventMeta;
    value: number;
    pct: number;
  }[] {
    const rows = BUSINESS_EVENT_META.map((meta) => ({
      meta,
      value: this.bizCount(meta.id),
    }));
    const max = Math.max(1, ...rows.map((r) => r.value));
    return rows
      .sort((a, b) => b.value - a.value)
      .map((r) => ({ ...r, pct: (r.value / max) * 100 }));
  }

  get bizFunnel(): FunnelStep[] {
    return this.buildFunnel([
      {
        label: 'Search appearances',
        value: this.bizCount(2),
        color: '#0f3b5f',
      },
      { label: 'Profile views', value: this.bizCount(1), color: '#5b31e0' },
      {
        label: 'Contact actions',
        value: this.bizSum([9, 10, 11, 12, 13]),
        color: '#1fa971',
      },
      { label: 'Leads', value: this.bizCount(14), color: '#c2255c' },
      { label: 'Converted', value: this.bizCount(15), color: '#087f5b' },
    ]);
  }

  get bizHasData(): boolean {
    return Object.values(this.bizTotals).some((v) => v > 0);
  }

  get bizHoverPoint(): AnalyticsSeriesPoint | null {
    return this.bizHover === null
      ? null
      : this.bizSeries[this.bizHover] || null;
  }

  // =========================================================================
  // Offering loading
  // =========================================================================

  get filteredOfferings(): BusinessOfferingDto[] {
    const term = this.offeringSearch.trim().toLowerCase();
    return (this.offerings || []).filter(
      (o) => !term || (o.name || '').toLowerCase().includes(term),
    );
  }

  get selectedOffering(): BusinessOfferingDto | null {
    return (
      (this.offerings || []).find((o) => o.id === this.selectedOfferingId) ||
      null
    );
  }

  selectOffering(offering: BusinessOfferingDto): void {
    if (this.selectedOfferingId === offering.id) return;
    this.selectedOfferingId = offering.id;
    this.loadOffering();
  }

  loadOffering(): void {
    if (!this.businessId || !this.selectedOfferingId || !this.from) {
      return;
    }
    this.offSub?.unsubscribe();
    this.offLoading = true;
    this.offError = '';

    this.offSub = this.analytics
      .getOfferingSeries(
        this.businessId,
        this.selectedOfferingId,
        this.granularity,
        this.from,
        this.to,
      )
      .subscribe({
        next: (series) => {
          this.offSeries = normalizeSeries(
            series,
            OFFERING_EVENT_META,
            this.granularity,
          );
          // Totals are summed from the series so they always match the chart.
          this.offTotals = totalsFromSeries(
            this.offSeries,
            OFFERING_EVENT_META,
          );
          this.offLoading = false;
          this.offHover = null;
          this.rebuildOfferingChart();
        },
        error: (err) => {
          this.offLoading = false;
          this.offError = this.errorMessage(err);
        },
      });
  }

  setOfferingMetric(key: string): void {
    this.offMetricKey = key;
    this.offHover = null;
    this.rebuildOfferingChart();
  }

  private rebuildOfferingChart(): void {
    this.offChart = this.buildChart(
      this.offSeries,
      this.currentOfferingMetric.ids,
    );
  }

  get currentOfferingMetric(): ChartMetric {
    return (
      OFFERING_CHART_METRICS.find((m) => m.key === this.offMetricKey) ||
      OFFERING_CHART_METRICS[0]
    );
  }

  offCount(id: number): number {
    return this.offTotals[id] || 0;
  }

  get offKpis(): KpiCard[] {
    return OFFERING_EVENT_META.map((m) => ({
      label: m.label,
      icon: m.icon,
      color: m.color,
      value: this.offCount(m.id),
      delta: null,
      isNew: false,
    }));
  }

  get offFunnel(): FunnelStep[] {
    return this.buildFunnel([
      { label: 'Views', value: this.offCount(1), color: '#5b31e0' },
      {
        label: 'Calls, WhatsApp & enquiries',
        value: this.offCount(2) + this.offCount(3) + this.offCount(4),
        color: '#0c8599',
      },
      { label: 'Leads', value: this.offCount(5), color: '#c2255c' },
      { label: 'Converted', value: this.offCount(6), color: '#087f5b' },
    ]);
  }

  get offHasData(): boolean {
    return Object.values(this.offTotals).some((v) => v > 0);
  }

  get offHoverPoint(): AnalyticsSeriesPoint | null {
    return this.offHover === null
      ? null
      : this.offSeries[this.offHover] || null;
  }

  /** Lead conversion = converted / leads, shown on the offering header. */
  get offConversionRate(): number | null {
    const leads = this.offCount(5);
    return leads > 0 ? (this.offCount(6) / leads) * 100 : null;
  }

  // =========================================================================
  // Chart helpers
  // =========================================================================

  pointValue(point: AnalyticsSeriesPoint | null, ids: number[]): number {
    if (!point) return 0;
    return ids.reduce((s, id) => s + (point.counts[id] || 0), 0);
  }

  onPlotMove(event: PointerEvent, scope: AnalyticsScope): void {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    if (!rect.width) return;
    const chart = scope === 'business' ? this.bizChart : this.offChart;
    if (!chart || !chart.points.length) return;

    const xPct = ((event.clientX - rect.left) / rect.width) * 100;
    let best = 0;
    let bestDist = Infinity;
    chart.points.forEach((p, i) => {
      const d = Math.abs(p.x - xPct);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    if (scope === 'business') this.bizHover = best;
    else this.offHover = best;
  }

  onPlotLeave(scope: AnalyticsScope): void {
    if (scope === 'business') this.bizHover = null;
    else this.offHover = null;
  }

  private buildChart(
    series: AnalyticsSeriesPoint[],
    ids: number[],
  ): ChartGeometry | null {
    if (!series.length) return null;

    const values = series.map((p) => this.pointValue(p, ids));
    const max = this.niceMax(Math.max(...values, 0));
    const left = 3;
    const width = 94;
    const n = series.length;

    const points = values.map((value, i) => ({
      x: n === 1 ? 50 : left + (i / (n - 1)) * width,
      y: 100 - (value / max) * 100,
      value,
      label: series[i].label,
    }));

    const line = this.smoothPath(points);
    const first = points[0];
    const last = points[points.length - 1];
    const area = `${line} L ${last.x} 100 L ${first.x} 100 Z`;

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
      label: this.compact(Math.round(max * f)),
      bottom: f * 100,
    }));

    const maxLabels = 7;
    const step = Math.max(1, Math.ceil(n / maxLabels));
    const xTicks: { label: string; left: number }[] = [];
    points.forEach((p, i) => {
      if (i % step === 0 || i === n - 1) {
        // Skip the second-to-last label if it would collide with the last.
        if (i !== n - 1 && n - 1 - i < step / 2) return;
        xTicks.push({ label: p.label, left: p.x });
      }
    });

    return { line, area, points, yTicks, xTicks, max };
  }

  /** Catmull-Rom → cubic Bézier, clamped so the curve never dips below 0. */
  private smoothPath(pts: { x: number; y: number }[]): string {
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const t = 0.18;
      const c1x = p1.x + (p2.x - p0.x) * t;
      const c1y = Math.min(100, Math.max(0, p1.y + (p2.y - p0.y) * t));
      const c2x = p2.x - (p3.x - p1.x) * t;
      const c2y = Math.min(100, Math.max(0, p2.y - (p3.y - p1.y) * t));
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }

  private niceMax(value: number): number {
    if (value <= 4) return 4;
    const pow = Math.pow(10, Math.floor(Math.log10(value)));
    const unit = value / pow;
    const nice =
      unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 4 ? 4 : unit <= 5 ? 5 : 10;
    // Keep it divisible into 4 ticks.
    const candidate = nice * pow;
    return Math.ceil(candidate / 4) * 4;
  }

  private buildFunnel(
    steps: { label: string; value: number; color: string }[],
  ): FunnelStep[] {
    const max = Math.max(1, ...steps.map((s) => s.value));
    return steps.map((s, i) => {
      const prev = i > 0 ? steps[i - 1].value : 0;
      const rate =
        i > 0 && prev > 0 && s.value <= prev ? (s.value / prev) * 100 : null;
      return {
        label: s.label,
        value: s.value,
        width: s.value > 0 ? Math.max(4, (s.value / max) * 100) : 0,
        rate,
        color: s.color,
      };
    });
  }

  // =========================================================================
  // Formatting & utils
  // =========================================================================

  compact(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 10_000) return `${Math.round(value / 1000)}k`;
    if (value >= 1_000) return `${(value / 1000).toFixed(1)}k`;
    return String(value);
  }

  full(value: number): string {
    return (value || 0).toLocaleString('en-IN');
  }

  trackById(_: number, item: { id: number }): number {
    return item.id;
  }

  initials(name: string): string {
    return (name || '?')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('');
  }

  private errorMessage(err: any): string {
    if (err?.status === 0) {
      return 'Could not reach the server. Check your connection and try again.';
    }
    if (err?.status === 400) {
      const e = err?.error?.errors;
      if (e) {
        return (Object.values(e) as any[])
          .reduce((acc: string[], v: any) => acc.concat(v), [])
          .join(' ');
      }
    }
    if (err?.status === 401 || err?.status === 403) {
      return 'You do not have permission to view these analytics.';
    }
    return 'Something went wrong while loading analytics. Please try again.';
  }

  private startOfDay(d: Date): Date {
    const r = new Date(d);
    r.setHours(0, 0, 0, 0);
    return r;
  }

  private endOfDay(d: Date): Date {
    const r = new Date(d);
    r.setHours(23, 59, 59, 999);
    return r;
  }

  private toInputDate(d: Date): string {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  private parseInputDate(value: string): Date | null {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }
}

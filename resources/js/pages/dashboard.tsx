import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type Auth, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import BookingCalendar from '@/components/dashboard/BookingCalendar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: dashboard().url,
  },
];

type DashboardEvent = {
  id: number | string;
  title: string;
  start: string;
  end: string;
  status?: string | null;

  kind?: 'booking' | 'block';
  block_id?: number;
  block?: string;
  area?: string | null;
  groupKey?: string | null;
};

type DashboardProps = {
  counts?: Partial<Record<string, number>>;
  month: string; // 'YYYY-MM'
  monthAvailability: Record<
    string,
    {
      AM: boolean;
      PM: boolean;
      EVE: boolean;
      is_fully_booked?: boolean;
    }
  >;
  events: DashboardEvent[];
};

function normalizeKind(ev: DashboardEvent): 'booking' | 'block' {
  if (ev.kind === 'block' || typeof ev.block_id === 'number') return 'block';
  return 'booking';
}

function normalizeStatusKey(s?: string | null): string {
  const k = String(s || '').toLowerCase().trim();
  return k || 'unknown';
}

function statusLabel(statusKey: string): string {
  const s = (statusKey || '').toLowerCase();
  switch (s) {
    case '__all__':
      return 'All';
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    case 'declined':
      return 'Declined';
    case 'cancelled':
      return 'Cancelled';
    case '__blocked__':
    case 'unavailable':
      return 'Blocked';
    default: {
      const pretty = s.replace(/[_-]+/g, ' ').trim();
      return pretty.replace(/\b\w/g, (m) => m.toUpperCase()) || 'Unknown';
    }
  }
}

function statusToneClass(statusKey: string): string {
  const s = (statusKey || '').toLowerCase();
  switch (s) {
    case '__all__':
      return 'bg-black dark:bg-white';
    case 'pending':
      return 'bg-slate-600';
    case 'confirmed':
      return 'bg-green-600';
    case 'active':
      return 'bg-sky-500';
    case 'completed':
      return 'bg-blue-800';
    case 'declined':
      return 'bg-orange-600';
    case 'cancelled':
    case 'canceled':
      return 'bg-red-600';
    case '__blocked__':
    case 'blocked':
    case 'unavailable':
      return 'bg-slate-300 dark:bg-slate-400';
    default:
      return 'bg-slate-500';
  }
}

/**
 * Roles can arrive as:
 * - auth.roles: string[]
 * - auth.roles: {name:string}[]
 * - auth.user.roles: same as above
 */
type RoleLike = string | { name?: string | null } | null | undefined;
type AuthLike = { roles?: RoleLike[] | null; user?: { roles?: RoleLike[] | null } | null };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function getRoleNames(auth: unknown): string[] {
  if (!isRecord(auth)) return [];
  const raw = (auth as AuthLike).roles ?? (auth as AuthLike).user?.roles ?? [];
  if (!Array.isArray(raw)) return [];

  return raw
    .map((r) => {
      if (typeof r === 'string') return r;
      if (isRecord(r) && typeof r.name === 'string') return r.name;
      return '';
    })
    .filter(Boolean);
}

export default function Dashboard({ counts: _counts, events, month, monthAvailability }: DashboardProps) {
  const { props } = usePage<{ auth: Auth }>();

  const roleNames = useMemo(
    () => getRoleNames(props.auth).map((r) => r.toLowerCase()),
    [props.auth],
  );

  const isClient = roleNames.includes('user');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const statusCards = useMemo(() => {
    const bookingCounts: Record<string, number> = {};
    let blockedCount = 0;

    for (const ev of events || []) {
      const kind = normalizeKind(ev);
      if (kind === 'block') {
        blockedCount += 1;
        continue;
      }
      const key = normalizeStatusKey(ev.status);
      bookingCounts[key] = (bookingCounts[key] || 0) + 1;
    }

    const CLIENT_KEYS = ['pending', 'confirmed', 'declined', 'cancelled', 'active', 'completed'];
    const STAFF_BASE_KEYS = ['pending', 'confirmed', 'active', 'completed', 'declined', 'cancelled'];

    const base = isClient ? CLIENT_KEYS : STAFF_BASE_KEYS;

    const known = new Set(base);
    const extras = Object.keys(bookingCounts)
      .filter((k) => !known.has(k))
      .sort((a, b) => a.localeCompare(b));

    const totalBookings = Object.values(bookingCounts).reduce((s, n) => s + n, 0);
    const totalItems = totalBookings + (isClient ? 0 : blockedCount);

    const cards: Array<{ key: string; label: string; value: number; toneCls: string }> = [];

    cards.push({
      key: '__all__',
      label: 'All',
      value: totalItems,
      toneCls: statusToneClass('__all__'),
    });

    for (const k of base) {
      cards.push({
        key: k,
        label: statusLabel(k),
        value: bookingCounts[k] || 0,
        toneCls: statusToneClass(k),
      });
    }

    if (!isClient) {
      for (const k of extras) {
        cards.push({
          key: k,
          label: statusLabel(k),
          value: bookingCounts[k] || 0,
          toneCls: statusToneClass(k),
        });
      }

      cards.push({
        key: '__blocked__',
        label: 'Blocked',
        value: blockedCount,
        toneCls: statusToneClass('__blocked__'),
      });
    }

    return cards;
  }, [events, isClient]);

  function isCardActive(cardKey: string) {
    if (cardKey === '__all__') return !statusFilter;
    return statusFilter === cardKey;
  }

  function toggleFilter(cardKey: string) {
    const next = cardKey === '__all__' ? null : cardKey;
    setStatusFilter((prev) => (prev === next ? null : next));
  }

  const filterLabel = statusFilter ? statusLabel(statusFilter) : 'All';
  const cardsGridCls =
    'grid w-full min-w-0 gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8';

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <div className="flex h-full w-full min-w-0 flex-1 flex-col gap-4 rounded-xl p-4">
        {/* Header row */}
        <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold">Bookings summary</div>
            <div className="text-[11px] text-muted-foreground">
              Click a status to filter the calendar (click again to clear).
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>
              Month: <span className="font-semibold text-foreground">{month}</span>
            </span>

            <span className="hidden sm:inline">•</span>

            <span>
              Filter: <span className="font-semibold text-foreground">{filterLabel}</span>
            </span>

            {statusFilter && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStatusFilter(null)}
                className="h-7 px-2 text-[11px]"
                title="Clear filter"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className={cardsGridCls}>
          {statusCards.map((c) => (
            <StatCard
              key={c.key}
              label={c.label}
              value={c.value}
              toneCls={c.toneCls}
              active={isCardActive(c.key)}
              onClick={() => toggleFilter(c.key)}
            />
          ))}
        </div>

        {/* Calendar */}
        <div className="relative min-h-[70vh] w-full min-w-0 flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <BookingCalendar
            events={events || []}
            month={month}
            monthAvailability={monthAvailability || {}}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({
  label,
  value,
  toneCls,
  active,
  onClick,
}: {
  label: string;
  value: number;
  toneCls: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'relative w-full min-w-0 overflow-hidden rounded-xl border border-sidebar-border/70 text-left transition-colors dark:border-sidebar-border',
        'hover:bg-muted/30',
        active && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
      )}
      title="Click to filter calendar"
    >
      <div className="flex min-w-0 flex-col gap-2 p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
          <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', toneCls)} />
          <span className="min-w-0 truncate">{label}</span>
        </div>

        <div className="text-3xl font-semibold tabular-nums sm:text-4xl">{value}</div>

        <div className={cn('h-1.5 w-full rounded', toneCls)} />
      </div>
    </button>
  );
}

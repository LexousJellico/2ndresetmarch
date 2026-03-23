import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
  Bell,
  Calendar,
  CreditCard,
  RefreshCw,
  Info,
  CheckCheck,
  Search,
  Package,
  Users,
  CalendarOff,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Notifications', href: '/notifications' }];

type NotificationRow = {
  id: number;
  type: string | null;
  title: string;
  message: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string | null;

  // optional if backend provides it
  is_unread?: boolean;
};

interface LaravelPaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

type SharedSummary = {
  unread_count: number;
  latest: NotificationRow[];
};

type NotificationFeed = {
  data: NotificationRow[];
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    links: LaravelPaginationLink[];
    to?: number | null;
    total?: number;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
};

type PageProps = {
  notifications: SharedSummary;
  notificationFeed: NotificationFeed;
};

function formatRelativeTime(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 45) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return d.toLocaleDateString();
}

function normalizeLabel(label: any): string {
  const raw = String(label ?? '');
  return raw.replace(/&laquo;|&raquo;/g, '').replace(/<[^>]*>/g, '').trim();
}

function NotificationIcon({ type }: { type: string | null }) {
  if (!type) return <Info className="h-4 w-4 text-slate-500" />;

  if (type === 'booking_status_changed') return <RefreshCw className="h-4 w-4 text-amber-600" />;
  if (type.startsWith('booking')) return <Calendar className="h-4 w-4 text-emerald-600" />;
  if (type.startsWith('payment')) return <CreditCard className="h-4 w-4 text-blue-600" />;
  if (type.startsWith('calendar_block')) return <CalendarOff className="h-4 w-4 text-rose-600" />;
  if (type.includes('roles')) return <Shield className="h-4 w-4 text-violet-600" />;
  if (type.endsWith('_updated')) return <RefreshCw className="h-4 w-4 text-amber-600" />;
  if (type.startsWith('service_') || type.startsWith('service_type_')) {
    return <Package className="h-4 w-4 text-indigo-600" />;
  }
  if (type.startsWith('user_')) return <Users className="h-4 w-4 text-cyan-700" />;

  return <Info className="h-4 w-4 text-slate-500" />;
}

export default function NotificationsIndex() {
  const pageProps = usePage<PageProps>().props;

  const summaryFromProps = pageProps.notifications;
  const feedFromProps = pageProps.notificationFeed;

  // ✅ local state so we can highlight NEW until click/mark-all (optimistic UI)
  const [unreadCount, setUnreadCount] = useState<number>(summaryFromProps?.unread_count ?? 0);
  const [rows, setRows] = useState<NotificationRow[]>(feedFromProps?.data ?? []);

  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [query, setQuery] = useState<string>('');

  // ✅ keep state in sync when Inertia brings new props (pagination/refresh)
  useEffect(() => {
    setUnreadCount(summaryFromProps?.unread_count ?? 0);
  }, [summaryFromProps?.unread_count]);

  useEffect(() => {
    setRows(feedFromProps?.data ?? []);
  }, [feedFromProps?.data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return (rows ?? []).filter((n) => {
      const isUnread = typeof n.is_unread === 'boolean' ? n.is_unread : !n.read_at;

      if (tab === 'unread' && !isUnread) return false;
      if (!q) return true;

      const haystack = `${n.title ?? ''} ${n.message ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, tab, query]);

  const handleOpen = (n: NotificationRow) => {
    const isUnread = typeof n.is_unread === 'boolean' ? n.is_unread : !n.read_at;

    // ✅ Optimistic: remove highlight + NEW immediately when clicked
    if (isUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setRows((prev) =>
        prev.map((x) =>
          x.id === n.id
            ? { ...x, read_at: x.read_at ?? new Date().toISOString(), is_unread: false }
            : x,
        ),
      );
    }

    router.visit(`/notifications/${n.id}/open`);
  };

  const handleMarkAllAsRead = () => {
    if (!unreadCount) return;

    const nowIso = new Date().toISOString();

    // ✅ Optimistic UI: immediately remove highlight + NEW everywhere
    setUnreadCount(0);
    setRows((prev) => prev.map((x) => (x.read_at ? x : { ...x, read_at: nowIso, is_unread: false })));

    router.post(
      '/notifications/read-all',
      {},
      {
        preserveScroll: true,
        onSuccess: () => router.reload({ only: ['notifications', 'notificationFeed'] }),
        onError: () => router.reload({ only: ['notifications', 'notificationFeed'] }),
      },
    );
  };

  const handleRefresh = () => {
    router.reload({ only: ['notifications', 'notificationFeed'] });
  };

  const handlePagination = (url: string | null) => (e: React.MouseEvent) => {
    if (!url) {
      e.preventDefault();
      return;
    }
    e.preventDefault();

    router.visit(url, {
      preserveScroll: true,
      preserveState: true,
      replace: true,
      only: ['notifications', 'notificationFeed'],
    });
  };

  const paginationLinks = feedFromProps?.meta?.links ?? [];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Notifications" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <Card>
          <CardHeader className="flex flex-col gap-3 px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <CardTitle className="text-base">Notifications</CardTitle>
                <CardDescription>
                  {unreadCount > 0
                    ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}.`
                    : 'You’re all caught up.'}
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>

                <Button type="button" size="sm" onClick={handleMarkAllAsRead} disabled={!unreadCount}>
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Mark all as read
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <ToggleGroup
                type="single"
                value={tab}
                onValueChange={(v) => {
                  if (!v) return;
                  setTab(v as 'all' | 'unread');
                }}
                variant="outline"
                size="sm"
              >
                <ToggleGroupItem value="all">All</ToggleGroupItem>
                <ToggleGroupItem value="unread">Unread</ToggleGroupItem>
              </ToggleGroup>

              <div className="relative w-full sm:w-[320px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search notifications..."
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <div className="mt-3 text-sm font-medium">
                  {query ? 'No results' : tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {query
                    ? 'Try a different keyword.'
                    : tab === 'unread'
                      ? 'Everything has been read.'
                      : 'When something happens, it will show up here.'}
                </div>
              </div>
            ) : (
              <div className="-mx-6 divide-y">
                {filtered.map((n) => {
                  const isUnread = typeof n.is_unread === 'boolean' ? n.is_unread : !n.read_at;

                  const isUpdateType =
                    n.type === 'booking_updated' ||
                    n.type === 'payment_updated' ||
                    n.type === 'booking_status_changed' ||
                    (n.type?.endsWith('_updated') ?? false);

                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleOpen(n)}
                      className={cn(
                        'relative w-full text-left px-6 py-4 hover:bg-muted/30 transition',
                        // ✅ highlight unread
                        isUnread && 'bg-amber-50/70 dark:bg-amber-950/25',
                      )}
                    >
                      {/* ✅ left accent bar while NEW */}
                      {isUnread && <span className="absolute left-0 top-0 h-full w-1 bg-amber-500/70" />}

                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'mt-0.5 h-10 w-10 shrink-0 rounded-full border flex items-center justify-center',
                            isUnread
                              ? 'bg-amber-200/40 border-amber-500/30'
                              : 'bg-muted/40 border-border',
                          )}
                        >
                          <NotificationIcon type={n.type} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="font-medium truncate">{n.title}</div>

                                {isUpdateType && (
                                  <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 text-[10px] px-2 py-[2px] font-medium">
                                    Updated
                                  </span>
                                )}
                              </div>

                              {n.message && (
                                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{n.message}</p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* ✅ NEW tag stays until clicked or mark all */}
                              {isUnread && (
                                <span className="inline-flex items-center rounded-md bg-amber-200/70 px-2 py-0.5 text-[10px] font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                                  NEW
                                </span>
                              )}

                              <span className="text-xs text-muted-foreground">{formatRelativeTime(n.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {paginationLinks?.length > 0 && (
              <div className="pt-4">
                <Pagination>
                  <PaginationContent>
                    {paginationLinks.map((link, i) => {
                      const label = normalizeLabel(link.label);
                      const lower = label.toLowerCase();

                      const isPrev = lower.includes('previous');
                      const isNext = lower.includes('next');
                      const isDots = label === '...';

                      return (
                        <PaginationItem key={i}>
                          {isPrev ? (
                            <PaginationPrevious
                              href={link.url ?? '#'}
                              aria-disabled={!link.url}
                              tabIndex={link.url ? 0 : -1}
                              onClick={handlePagination(link.url)}
                            >
                              Previous
                            </PaginationPrevious>
                          ) : isNext ? (
                            <PaginationNext
                              href={link.url ?? '#'}
                              aria-disabled={!link.url}
                              tabIndex={link.url ? 0 : -1}
                              onClick={handlePagination(link.url)}
                            >
                              Next
                            </PaginationNext>
                          ) : isDots ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              isActive={link.active}
                              href={link.url ?? '#'}
                              aria-current={link.active ? 'page' : undefined}
                              aria-disabled={!link.url}
                              tabIndex={link.url ? 0 : -1}
                              onClick={handlePagination(link.url)}
                            >
                              {label}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      );
                    })}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

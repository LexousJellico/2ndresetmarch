import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bell,
  Calendar,
  CreditCard,
  RefreshCw,
  Info,
  CheckCheck,
  Package,
  Users,
  CalendarOff,
  Shield,
} from 'lucide-react';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type NotificationSummary = {
  id: number;
  type: string | null;
  title: string;
  message: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string | null;

  is_unread?: boolean;

  actor_name?: string | null;
  actor_email?: string | null;
  acted_at?: string | null;
};

type SharedProps = {
  notifications?: {
    unread_count: number;
    latest: NotificationSummary[];
  };
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

function formatAbsoluteTime(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseMetaFromMessage(message: string | null): {
  meta: { name: string; email?: string; at: string } | null;
  body: string | null;
} {
  if (!message) return { meta: null, body: null };

  const msg = message.trim();

  let m = msg.match(/^By\s+(.+?)\s+\((.+?)\)\s+•\s+(.+?)\.\s*(.*)$/s);
  if (m) {
    const name = (m[1] ?? '').trim();
    const email = (m[2] ?? '').trim();
    const at = (m[3] ?? '').trim();
    const body = (m[4] ?? '').trim();
    return {
      meta: name && at ? { name, email: email || undefined, at } : null,
      body: body || null,
    };
  }

  m = msg.match(/^By\s+(.+?)\s+•\s+(.+?)\.\s*(.*)$/s);
  if (m) {
    const name = (m[1] ?? '').trim();
    const at = (m[2] ?? '').trim();
    const body = (m[3] ?? '').trim();
    return {
      meta: name && at ? { name, at } : null,
      body: body || null,
    };
  }

  return { meta: null, body: msg };
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

export default function NotificationBell() {
  const page = usePage<SharedProps>();
  const initialUnread = page.props.notifications?.unread_count ?? 0;
  const initialLatest = page.props.notifications?.latest ?? [];

  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnread);
  const [latest, setLatest] = useState<NotificationSummary[]>(initialLatest);

  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;

    try {
      const res = await fetch('/notifications/summary', {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });

      if (!res.ok) return;

      const data = (await res.json()) as {
        unread_count?: number;
        latest?: NotificationSummary[];
      };

      setUnreadCount(typeof data.unread_count === 'number' ? data.unread_count : 0);
      setLatest(Array.isArray(data.latest) ? data.latest : []);
    } catch {
      // ignore
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden) refresh();
    }, 15000);

    return () => window.clearInterval(id);
  }, [refresh]);

  const handleOpen = (n: NotificationSummary) => {
    const isUnreadNow = typeof n.is_unread === 'boolean' ? n.is_unread : !n.read_at;

    // optimistic UI
    if (isUnreadNow) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setLatest((prev) =>
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
    router.post('/notifications/read-all', {}, {
      preserveScroll: true,
      onSuccess: () => {
        const nowIso = new Date().toISOString();
        setUnreadCount(0);
        setLatest((prev) => prev.map((x) => (x.read_at ? x : { ...x, read_at: nowIso, is_unread: false })));
        refresh();
      },
    });
  };

  const isScrollable = latest.length > 5;

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) refresh();
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center px-[5px] shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" forceMount className="w-[380px] p-0 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold truncate">Notifications</span>

            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] px-2 py-[2px] font-medium">
                {unreadCount} unread
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8 px-2 text-xs"
            >
              <CheckCheck className="mr-1 h-4 w-4" />
              Mark all
            </Button>
          )}
        </div>

        {latest.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Bell className="mx-auto h-9 w-9 text-muted-foreground/50" />
            <div className="mt-3 text-sm font-medium">No notifications</div>
            <div className="mt-1 text-xs text-muted-foreground">You’re all caught up.</div>
          </div>
        ) : (
          <div className={cn('py-1', isScrollable && 'max-h-[360px] overflow-y-auto')}>
            {latest.map((n) => {
              const isUnread = typeof n.is_unread === 'boolean' ? n.is_unread : !n.read_at;

              const isUpdateType =
                n.type === 'booking_updated' ||
                n.type === 'payment_updated' ||
                n.type === 'booking_status_changed' ||
                (n.type?.endsWith('_updated') ?? false);

              const parsed = parseMetaFromMessage(n.message);

              const meta =
                parsed.meta ??
                (n.actor_name || n.actor_email || n.acted_at
                  ? {
                      name: (n.actor_name ?? 'System').trim() || 'System',
                      email: n.actor_email ?? undefined,
                      at: (n.acted_at ?? formatAbsoluteTime(n.created_at)).trim(),
                    }
                  : null);

              const body = parsed.body;
              const absoluteAt = meta?.at?.trim() || formatAbsoluteTime(n.created_at) || '';

              return (
                <DropdownMenuItem
                  key={n.id}
                  onClick={() => handleOpen(n)}
                  className={cn(
                    'relative cursor-pointer px-3 py-3 focus:bg-muted/40',
                    isUnread && 'bg-amber-50/70 dark:bg-amber-950/25',
                  )}
                >
                  {isUnread && <span className="absolute left-0 top-0 h-full w-1 bg-amber-500/70" />}

                  <div className="flex items-start gap-3 w-full">
                    <div
                      className={cn(
                        'mt-0.5 h-9 w-9 shrink-0 rounded-full border flex items-center justify-center',
                        isUnread ? 'bg-amber-200/40 border-amber-500/30' : 'bg-muted/40 border-border',
                      )}
                    >
                      <NotificationIcon type={n.type} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium leading-tight truncate">{n.title}</div>

                            {isUpdateType && (
                              <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 text-[10px] px-2 py-[2px] font-medium">
                                Updated
                              </span>
                            )}
                          </div>

                          {(meta || absoluteAt) && (
                            <div className="mt-1 text-[11px] text-muted-foreground leading-snug">
                              <span>By </span>
                              <span className="font-medium text-foreground/80">{meta?.name ?? 'System'}</span>
                              {meta?.email ? (
                                <>
                                  <span> (</span>
                                  <a
                                    href={`mailto:${meta.email}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="underline decoration-dotted hover:decoration-solid"
                                  >
                                    {meta.email}
                                  </a>
                                  <span>)</span>
                                </>
                              ) : null}
                              {absoluteAt ? <span> • {absoluteAt}</span> : null}
                            </div>
                          )}

                          {body && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{body}</p>}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isUnread && (
                            <span className="inline-flex items-center rounded-md bg-amber-200/70 px-2 py-0.5 text-[10px] font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                              NEW
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground">{formatRelativeTime(n.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
        )}

        <div className="border-t bg-background p-2">
          {/* ✅ This ONLY navigates. It must not mark notifications as read. */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-center text-xs"
            onClick={() => {
              setOpen(false);
              router.visit('/notifications');
            }}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    CircleAlert,
    Clock3,
    Lock,
    MapPin,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { events } from '@/data/events';
import PublicLayout from '@/layouts/public-layout';

type RawEvent = {
    title: string;
    date: string;
    summary?: string;
    description?: string;
    note?: string;
    venue?: string;
    image?: string;
    lightImage?: string;
    darkImage?: string;
    category?: string;
    featured?: boolean;
    highlighted?: boolean;
    scope?: 'bccc' | 'city';
    isPublic?: boolean;
};

type NormalizedEvent = {
    title: string;
    date: string;
    summary: string;
    description: string;
    note: string;
    venue: string;
    category: string;
    image: string;
    lightImage: string;
    darkImage: string;
    scope: 'bccc' | 'city';
    isPublic: boolean;
    featured: boolean;
    highlighted: boolean;
};

type CalendarStatus = 'available' | 'public_booked' | 'private_booked' | 'blocked';

function parseDate(input: string): Date | null {
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }
    return parsed;
}

function formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatLongDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

function monthLabel(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
    }).format(date);
}

function normalizeScope(event: RawEvent): 'bccc' | 'city' {
    if (event.scope === 'bccc' || event.scope === 'city') {
        return event.scope;
    }

    const combined = `${event.category ?? ''} ${event.venue ?? ''} ${event.title}`.toLowerCase();

    if (combined.includes('city')) {
        return 'city';
    }

    return event.featured ? 'bccc' : 'city';
}

function normalizeEvents(items: RawEvent[]): NormalizedEvent[] {
    return items
        .map((item) => {
            const scope = normalizeScope(item);
            const image = item.image ?? '/marketing/images/events/1.jpg';

            return {
                title: item.title,
                date: item.date,
                summary: item.summary ?? 'Public event information will be shown here.',
                description:
                    item.description ??
                    item.summary ??
                    'This event is currently presented as part of the public-facing schedule layer.',
                note: item.note ?? 'Schedule details remain subject to final operational confirmation.',
                venue:
                    item.venue ??
                    (scope === 'bccc'
                        ? 'Baguio Convention and Cultural Center'
                        : 'Baguio City'),
                category:
                    item.category ??
                    (scope === 'bccc' ? 'BCCC Public Event' : 'Baguio City Event'),
                image,
                lightImage: item.lightImage ?? image,
                darkImage: item.darkImage ?? image,
                scope,
                isPublic: item.isPublic ?? true,
                featured: item.featured ?? false,
                highlighted: item.highlighted ?? item.featured ?? false,
            };
        })
        .filter((item) => !!parseDate(item.date))
        .sort((a, b) => {
            const aDate = parseDate(a.date)?.getTime() ?? 0;
            const bDate = parseDate(b.date)?.getTime() ?? 0;
            return aDate - bDate;
        });
}

function getMonthMatrix(baseDate: Date) {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const totalDays = lastDay.getDate();
    const mondayFirstIndex = (firstDay.getDay() + 6) % 7;

    const cells: Array<Date | null> = [];

    for (let i = 0; i < mondayFirstIndex; i += 1) {
        cells.push(null);
    }

    for (let day = 1; day <= totalDays; day += 1) {
        cells.push(new Date(year, month, day));
    }

    while (cells.length % 7 !== 0) {
        cells.push(null);
    }

    return cells;
}

function statusStyles(status: CalendarStatus, selected: boolean) {
    if (status === 'private_booked') {
        return selected
            ? 'border-[#b58922] bg-[#b58922] text-white'
            : 'border-[#d7b14b] bg-[#f4e2ac] text-[#6a4f00]';
    }

    if (status === 'public_booked') {
        return selected
            ? 'border-[#1d5bd8] bg-[#1d5bd8] text-white'
            : 'border-[#8eb2ff] bg-[#e4eeff] text-[#1645ac]';
    }

    if (status === 'blocked') {
        return selected
            ? 'border-[#c53434] bg-[#c53434] text-white'
            : 'border-[#f1aaaa] bg-[#ffe5e5] text-[#a52a2a]';
    }

    return selected
        ? 'border-[#174f40] bg-[#174f40] text-white dark:border-[#2d47ff] dark:bg-[#2d47ff]'
        : 'border-black/10 bg-white text-[#22221f] dark:border-white/10 dark:bg-[#17181c] dark:text-white';
}

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarPage() {
    const normalizedEvents = useMemo(
        () => normalizeEvents(events as RawEvent[]),
        [],
    );

    const privateLockedDates = useMemo(
        () => ['2026-04-18', '2026-05-16', '2026-06-07'],
        [],
    );

    const blockedDates = useMemo(
        () => ['2026-04-24', '2026-05-09', '2026-06-21'],
        [],
    );

    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1),
    );
    const [selectedDateKey, setSelectedDateKey] = useState(formatDateKey(today));

    const monthCells = useMemo(() => getMonthMatrix(currentMonth), [currentMonth]);

    const publicEventsByDate = useMemo(() => {
        const map = new Map<string, NormalizedEvent[]>();

        normalizedEvents
            .filter((item) => item.isPublic)
            .forEach((item) => {
                const parsed = parseDate(item.date);
                if (!parsed) return;

                const key = formatDateKey(parsed);
                const existing = map.get(key) ?? [];
                existing.push(item);
                map.set(key, existing);
            });

        return map;
    }, [normalizedEvents]);

    const getDateStatus = (dateKey: string): CalendarStatus => {
        if (blockedDates.includes(dateKey)) return 'blocked';
        if (publicEventsByDate.has(dateKey)) return 'public_booked';
        if (privateLockedDates.includes(dateKey)) return 'private_booked';
        return 'available';
    };

    const selectedDate = useMemo(() => {
        const parsed = new Date(`${selectedDateKey}T00:00:00`);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }, [selectedDateKey]);

    const selectedStatus = selectedDate ? getDateStatus(selectedDateKey) : 'available';
    const selectedEvents = publicEventsByDate.get(selectedDateKey) ?? [];

    const monthlyHighlights = useMemo(() => {
        return normalizedEvents.filter((item) => {
            const parsed = parseDate(item.date);
            if (!parsed || !item.isPublic) return false;

            return (
                parsed.getFullYear() === currentMonth.getFullYear() &&
                parsed.getMonth() === currentMonth.getMonth()
            );
        });
    }, [currentMonth, normalizedEvents]);

    const handleDateClick = (date: Date) => {
        const key = formatDateKey(date);
        const status = getDateStatus(key);

        if (status === 'private_booked') {
            return;
        }

        setSelectedDateKey(key);
    };

    return (
        <PublicLayout>
            <Head title="Calendar" />

            <section className="px-4 py-8 lg:px-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#16171b]">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                            Public Calendar
                        </p>
                        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                            Public venue status, monthly events, and schedule highlights.
                        </h1>
                        <p className="mt-3 max-w-4xl text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                            Gold means privately booked and locked to public users, blue means a public or government event,
                            red means admin-blocked and unavailable, and neutral means open on the current frontend layer.
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link
                                href="/contact"
                                className="inline-flex items-center rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white dark:bg-[#2d47ff]"
                            >
                                Ask About Availability
                            </Link>
                            <Link
                                href="/events"
                                className="inline-flex items-center rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
                            >
                                View Public Events
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                        <article className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#16171b]">
                            <div className="flex flex-col gap-4 border-b border-black/10 px-5 py-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#174f40] dark:text-[#9dc0ff]">
                                        Monthly View
                                    </p>
                                    <h2 className="mt-2 text-2xl font-black tracking-tight">
                                        {monthLabel(currentMonth)}
                                    </h2>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCurrentMonth(
                                                new Date(
                                                    currentMonth.getFullYear(),
                                                    currentMonth.getMonth() - 1,
                                                    1,
                                                ),
                                            )
                                        }
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 dark:border-white/10"
                                        aria-label="Previous month"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCurrentMonth(
                                                new Date(
                                                    currentMonth.getFullYear(),
                                                    currentMonth.getMonth() + 1,
                                                    1,
                                                ),
                                            )
                                        }
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 dark:border-white/10"
                                        aria-label="Next month"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-2 px-4 pt-4 sm:px-5">
                                {weekdayLabels.map((label) => (
                                    <div
                                        key={label}
                                        className="rounded-xl bg-[#f7f2e8] px-2 py-3 text-center text-xs font-bold uppercase tracking-[0.14em] text-[#6a665f] dark:bg-[#1d1e23] dark:text-[#a9a9b1]"
                                    >
                                        {label}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-2 p-4 sm:p-5">
                                {monthCells.map((cell, index) => {
                                    if (!cell) {
                                        return (
                                            <div
                                                key={`empty-${index}`}
                                                className="h-20 rounded-2xl border border-dashed border-black/5 bg-transparent dark:border-white/5"
                                            />
                                        );
                                    }

                                    const key = formatDateKey(cell);
                                    const status = getDateStatus(key);
                                    const selected = key === selectedDateKey;
                                    const isLocked = status === 'private_booked';
                                    const dayEvents = publicEventsByDate.get(key) ?? [];

                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => handleDateClick(cell)}
                                            disabled={isLocked}
                                            className={`group relative flex h-20 flex-col items-start justify-between rounded-2xl border p-3 text-left transition ${statusStyles(
                                                status,
                                                selected,
                                            )} ${isLocked ? 'cursor-not-allowed opacity-85' : 'hover:-translate-y-0.5'}`}
                                        >
                                            <div className="flex w-full items-start justify-between gap-2">
                                                <span className="text-sm font-black">
                                                    {cell.getDate()}
                                                </span>

                                                {status === 'private_booked' && (
                                                    <Lock className="h-4 w-4" />
                                                )}
                                            </div>

                                            <div className="w-full">
                                                {status === 'public_booked' && (
                                                    <span className="line-clamp-1 text-[10px] font-bold uppercase tracking-[0.12em]">
                                                        Public Event
                                                    </span>
                                                )}

                                                {status === 'blocked' && (
                                                    <span className="line-clamp-1 text-[10px] font-bold uppercase tracking-[0.12em]">
                                                        Blocked
                                                    </span>
                                                )}

                                                {status === 'available' && (
                                                    <span className="line-clamp-1 text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
                                                        Available
                                                    </span>
                                                )}

                                                {dayEvents.length > 0 && (
                                                    <p className="mt-1 line-clamp-1 text-[11px] font-semibold">
                                                        {dayEvents[0].title}
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="border-t border-black/10 px-5 py-5 dark:border-white/10">
                                <div className="grid gap-3 text-xs sm:grid-cols-2 xl:grid-cols-4">
                                    <div className="rounded-2xl bg-[#f4e2ac] px-4 py-3 font-semibold text-[#6a4f00]">
                                        Gold = Private / Fully Booked
                                    </div>
                                    <div className="rounded-2xl bg-[#e4eeff] px-4 py-3 font-semibold text-[#1645ac]">
                                        Blue = Public / Government Event
                                    </div>
                                    <div className="rounded-2xl bg-[#ffe5e5] px-4 py-3 font-semibold text-[#a52a2a]">
                                        Red = Admin Blocked / Unavailable
                                    </div>
                                    <div className="rounded-2xl bg-[#f7f2e8] px-4 py-3 font-semibold text-[#4d4a45] dark:bg-[#1d1e23] dark:text-[#cdced3]">
                                        Neutral = Available
                                    </div>
                                </div>
                            </div>
                        </article>

                        <aside className="space-y-6">
                            <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#16171b]">
                                <div className="border-b border-black/10 px-5 py-5 dark:border-white/10">
                                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#174f40] dark:text-[#9dc0ff]">
                                        Schedule Highlights
                                    </p>
                                    <h2 className="mt-2 text-2xl font-black tracking-tight">
                                        Upcoming events this month
                                    </h2>
                                    <p className="mt-2 text-sm leading-7 text-[#5a5650] dark:text-[#c8c8ce]">
                                        This list shows only the public events within the selected month. When there are many,
                                        the panel becomes scrollable.
                                    </p>
                                </div>

                                <div className="max-h-[30rem] space-y-4 overflow-y-auto p-5">
                                    {monthlyHighlights.length > 0 ? (
                                        monthlyHighlights.map((item) => (
                                            <button
                                                key={`${item.title}-${item.date}`}
                                                type="button"
                                                onClick={() => {
                                                    const parsed = parseDate(item.date);
                                                    if (!parsed) return;
                                                    setSelectedDateKey(formatDateKey(parsed));
                                                }}
                                                className="block w-full rounded-[1.4rem] border border-black/10 bg-[#fbf8f2] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm dark:border-white/10 dark:bg-[#1d1e23]"
                                            >
                                                <span className="inline-flex rounded-full bg-[#dfe9ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1c54c7] dark:bg-[#1e2945] dark:text-[#a6c0ff]">
                                                    {item.category}
                                                </span>

                                                <h3 className="mt-3 text-lg font-black">{item.title}</h3>

                                                <div className="mt-3 space-y-2 text-sm text-[#595651] dark:text-[#c8c8ce]">
                                                    <p className="flex items-center gap-2">
                                                        <CalendarDays className="h-4 w-4" />
                                                        {item.date}
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        {item.venue}
                                                    </p>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="rounded-[1.4rem] border border-dashed border-black/10 bg-[#fbf8f2] p-4 text-sm text-[#5d5a55] dark:border-white/10 dark:bg-[#1d1e23] dark:text-[#c8c8ce]">
                                            No public events are currently mapped to this month on the frontend layer.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#16171b]">
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#174f40] dark:text-[#9dc0ff]">
                                    Selected Date Details
                                </p>

                                {selectedDate ? (
                                    <>
                                        <h3 className="mt-2 text-2xl font-black tracking-tight">
                                            {formatLongDate(selectedDate)}
                                        </h3>

                                        {selectedStatus === 'private_booked' && (
                                            <div className="mt-4 rounded-[1.4rem] bg-[#f4e2ac] p-4 text-sm text-[#6a4f00]">
                                                This date is reserved as a private fully booked schedule. On the public page,
                                                details remain hidden and the date is locked.
                                            </div>
                                        )}

                                        {selectedStatus === 'blocked' && (
                                            <div className="mt-4 rounded-[1.4rem] bg-[#ffe5e5] p-4 text-sm text-[#a52a2a]">
                                                This date is unavailable because it has been blocked on the admin side for venue
                                                control, maintenance, or non-public restrictions.
                                            </div>
                                        )}

                                        {selectedStatus === 'available' && (
                                            <div className="mt-4 rounded-[1.4rem] bg-[#f7f2e8] p-4 text-sm text-[#4e4b46] dark:bg-[#1d1e23] dark:text-[#d0d1d6]">
                                                The selected date is currently neutral on the frontend layer and appears available
                                                for inquiry. The final live result will later come from the backend booking
                                                availability endpoint.
                                            </div>
                                        )}

                                        {selectedStatus === 'public_booked' && (
                                            <div className="mt-4 space-y-4">
                                                {selectedEvents.map((item) => (
                                                    <article
                                                        key={`${item.title}-${item.date}`}
                                                        className="overflow-hidden rounded-[1.4rem] border border-black/10 bg-[#fbf8f2] dark:border-white/10 dark:bg-[#1d1e23]"
                                                    >
                                                        <div className="relative h-48 overflow-hidden">
                                                            <img
                                                                src={item.lightImage}
                                                                alt={item.title}
                                                                className="h-full w-full object-cover dark:hidden"
                                                            />
                                                            <img
                                                                src={item.darkImage}
                                                                alt={item.title}
                                                                className="hidden h-full w-full object-cover dark:block"
                                                            />
                                                        </div>

                                                        <div className="space-y-3 p-4">
                                                            <span className="inline-flex rounded-full bg-[#dfe9ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1c54c7] dark:bg-[#1e2945] dark:text-[#a6c0ff]">
                                                                Public Event
                                                            </span>

                                                            <h4 className="text-xl font-black">{item.title}</h4>

                                                            <div className="space-y-2 text-sm text-[#5a5650] dark:text-[#c8c8ce]">
                                                                <p className="flex items-center gap-2">
                                                                    <MapPin className="h-4 w-4" />
                                                                    {item.venue}
                                                                </p>
                                                                <p className="flex items-center gap-2">
                                                                    <Clock3 className="h-4 w-4" />
                                                                    Event details are visible to all users on public dates.
                                                                </p>
                                                            </div>

                                                            <p className="text-sm leading-7 text-[#5a5650] dark:text-[#c8c8ce]">
                                                                {item.description}
                                                            </p>

                                                            <div className="rounded-2xl bg-[#f2efe8] p-3 text-sm text-[#57534e] dark:bg-[#17181d] dark:text-[#c8c8ce]">
                                                                {item.note}
                                                            </div>
                                                        </div>
                                                    </article>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="mt-4 rounded-[1.4rem] bg-[#f7f2e8] p-4 text-sm text-[#4e4b46] dark:bg-[#1d1e23] dark:text-[#d0d1d6]">
                                        Select a date to view the public schedule details below.
                                    </div>
                                )}

                                <div className="mt-5 flex items-start gap-3 rounded-[1.4rem] border border-[#d79b2f]/35 bg-[#fff7e4] p-4 text-sm text-[#7b5a1f] dark:border-[#d79b2f]/25 dark:bg-[#2a2419] dark:text-[#f1d08c]">
                                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>
                                        This page is a frontend public calendar layer. In the next phase, these statuses will
                                        be connected to the live backend availability and admin block data.
                                    </span>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
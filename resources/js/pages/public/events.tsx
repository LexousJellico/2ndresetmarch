import { Head, Link } from '@inertiajs/react';
import { CalendarDays, MapPin, Sparkles } from 'lucide-react';
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

function parseDate(input: string): Date | null {
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }
    return parsed;
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
                    'This entry is currently part of the public-facing event presentation layer.',
                note: item.note ?? 'Final schedule details remain subject to operational confirmation.',
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

type FilterMode = 'all' | 'bccc' | 'city';

export default function EventsPage() {
    const normalizedEvents = useMemo(
        () => normalizeEvents(events as RawEvent[]).filter((item) => item.isPublic),
        [],
    );

    const bcccEvents = useMemo(
        () => normalizedEvents.filter((item) => item.scope === 'bccc'),
        [normalizedEvents],
    );

    const cityEvents = useMemo(
        () => normalizedEvents.filter((item) => item.scope === 'city'),
        [normalizedEvents],
    );

    const featuredEvent =
        bcccEvents.find((item) => item.highlighted || item.featured) ??
        bcccEvents[0] ??
        normalizedEvents[0];

    const [filter, setFilter] = useState<FilterMode>('all');

    const visibleBcccEvents =
        filter === 'all' || filter === 'bccc' ? bcccEvents : [];
    const visibleCityEvents =
        filter === 'all' || filter === 'city' ? cityEvents : [];

    return (
        <PublicLayout>
            <Head title="Events" />

            <section className="px-4 py-8 lg:px-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#16171b]">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                            Events & Announcements
                        </p>
                        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                            Public convention-center events and Baguio City highlights.
                        </h1>
                        <p className="mt-3 max-w-4xl text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                            This page separates BCCC public events from Baguio City public events so your frontend presentation
                            already follows the content structure you want for the admin-config phase later.
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link
                                href="/calendar"
                                className="inline-flex items-center rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white dark:bg-[#2d47ff]"
                            >
                                View Calendar
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
                            >
                                Ask About Events
                            </Link>
                        </div>
                    </div>

                    {featuredEvent && (
                        <article className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#16171b]">
                            <div className="grid gap-0 xl:grid-cols-[1.08fr_0.92fr]">
                                <div className="relative min-h-[20rem] overflow-hidden">
                                    <img
                                        src={featuredEvent.lightImage}
                                        alt={featuredEvent.title}
                                        className="h-full w-full object-cover dark:hidden"
                                    />
                                    <img
                                        src={featuredEvent.darkImage}
                                        alt={featuredEvent.title}
                                        className="hidden h-full w-full object-cover dark:block"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                    <div className="absolute left-5 top-5">
                                        <span className="inline-flex rounded-full bg-[#174f40] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white dark:bg-[#2d47ff]">
                                            Featured BCCC Event
                                        </span>
                                    </div>

                                    <div className="absolute bottom-5 left-5 right-5 text-white">
                                        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                                            {featuredEvent.title}
                                        </h2>
                                    </div>
                                </div>

                                <div className="space-y-5 p-6">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex rounded-full bg-[#f7f2e8] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#174f40] dark:bg-[#1d1e23] dark:text-[#9dc0ff]">
                                            {featuredEvent.category}
                                        </span>
                                        {featuredEvent.highlighted && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-[#fff0c7] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8a6500] dark:bg-[#322911] dark:text-[#f3d17a]">
                                                <Sparkles className="h-3.5 w-3.5" />
                                                Highlighted
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-2 text-sm text-[#595651] dark:text-[#c8c8ce]">
                                        <p className="flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4" />
                                            {featuredEvent.date}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            {featuredEvent.venue}
                                        </p>
                                    </div>

                                    <p className="text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                                        {featuredEvent.description}
                                    </p>

                                    <div className="rounded-[1.4rem] bg-[#f7f2e8] p-4 text-sm text-[#54504a] dark:bg-[#1d1e23] dark:text-[#c9c9cf]">
                                        {featuredEvent.note}
                                    </div>
                                </div>
                            </div>
                        </article>
                    )}

                    <div className="flex flex-wrap gap-3">
                        {[
                            { key: 'all', label: 'All Public Events' },
                            { key: 'bccc', label: 'BCCC Events' },
                            { key: 'city', label: 'Baguio City Events' },
                        ].map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => setFilter(item.key as FilterMode)}
                                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                                    filter === item.key
                                        ? 'bg-[#174f40] text-white dark:bg-[#2d47ff]'
                                        : 'border border-black/10 bg-white text-[#232320] dark:border-white/10 dark:bg-[#16171b] dark:text-white'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {(filter === 'all' || filter === 'bccc') && (
                        <section className="space-y-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                                    BCCC Events
                                </p>
                                <h2 className="mt-2 text-2xl font-black tracking-tight">
                                    Public events held at the convention center
                                </h2>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {visibleBcccEvents.map((event) => (
                                    <article
                                        key={`${event.title}-${event.date}`}
                                        className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#16171b]"
                                    >
                                        <div className="relative h-56 overflow-hidden">
                                            <img
                                                src={event.lightImage}
                                                alt={event.title}
                                                className="h-full w-full object-cover dark:hidden"
                                            />
                                            <img
                                                src={event.darkImage}
                                                alt={event.title}
                                                className="hidden h-full w-full object-cover dark:block"
                                            />
                                        </div>

                                        <div className="space-y-4 p-5">
                                            <div className="flex flex-wrap gap-2">
                                                <span className="inline-flex rounded-full bg-[#e8f2ee] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#174f40] dark:bg-[#18231f] dark:text-[#9dc0ff]">
                                                    {event.category}
                                                </span>
                                                {event.highlighted && (
                                                    <span className="inline-flex rounded-full bg-[#fff0c7] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8a6500] dark:bg-[#322911] dark:text-[#f3d17a]">
                                                        Highlighted
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-2xl font-black tracking-tight">{event.title}</h3>

                                            <div className="space-y-2 text-sm text-[#595651] dark:text-[#c8c8ce]">
                                                <p className="flex items-center gap-2">
                                                    <CalendarDays className="h-4 w-4" />
                                                    {event.date}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    {event.venue}
                                                </p>
                                            </div>

                                            <p className="text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                                                {event.summary}
                                            </p>

                                            <div className="rounded-[1.2rem] bg-[#f7f2e8] p-4 text-sm text-[#54504a] dark:bg-[#1d1e23] dark:text-[#c9c9cf]">
                                                {event.note}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {(filter === 'all' || filter === 'city') && (
                        <section className="space-y-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                                    Baguio City Events
                                </p>
                                <h2 className="mt-2 text-2xl font-black tracking-tight">
                                    Public city highlights and community activities
                                </h2>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {visibleCityEvents.map((event) => (
                                    <article
                                        key={`${event.title}-${event.date}`}
                                        className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#16171b]"
                                    >
                                        <div className="relative h-52 overflow-hidden">
                                            <img
                                                src={event.lightImage}
                                                alt={event.title}
                                                className="h-full w-full object-cover dark:hidden"
                                            />
                                            <img
                                                src={event.darkImage}
                                                alt={event.title}
                                                className="hidden h-full w-full object-cover dark:block"
                                            />
                                        </div>

                                        <div className="space-y-4 p-5">
                                            <span className="inline-flex rounded-full bg-[#dfe9ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1c54c7] dark:bg-[#1e2945] dark:text-[#a6c0ff]">
                                                {event.category}
                                            </span>

                                            <h3 className="text-2xl font-black tracking-tight">{event.title}</h3>

                                            <div className="space-y-2 text-sm text-[#595651] dark:text-[#c8c8ce]">
                                                <p className="flex items-center gap-2">
                                                    <CalendarDays className="h-4 w-4" />
                                                    {event.date}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    {event.venue}
                                                </p>
                                            </div>

                                            <p className="text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                                                {event.summary}
                                            </p>

                                            <div className="rounded-[1.2rem] bg-[#f7f2e8] p-4 text-sm text-[#54504a] dark:bg-[#1d1e23] dark:text-[#c9c9cf]">
                                                {event.note}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
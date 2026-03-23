import { Link } from '@inertiajs/react';
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';

import { events } from '@/data/events';

const CITY_PAGE_SIZE = 2;

export default function EventsHighlights() {
    const featuredEvents = useMemo(
        () => events.filter((item) => item.scope === 'bccc' && item.highlighted && item.isPublic),
        [],
    );

    const cityEvents = useMemo(() => events.filter((item) => item.scope === 'city' && item.isPublic), []);

    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [cityPage, setCityPage] = useState(0);

    const totalCityPages = Math.max(1, Math.ceil(cityEvents.length / CITY_PAGE_SIZE));
    const activeFeatured = featuredEvents[featuredIndex] ?? featuredEvents[0];
    const visibleCityEvents = cityEvents.slice(cityPage * CITY_PAGE_SIZE, cityPage * CITY_PAGE_SIZE + CITY_PAGE_SIZE);

    const nextFeatured = () => {
        if (featuredEvents.length <= 1) return;
        setFeaturedIndex((prev) => (prev + 1) % featuredEvents.length);
    };

    const prevFeatured = () => {
        if (featuredEvents.length <= 1) return;
        setFeaturedIndex((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length);
    };

    const nextCityPage = () => setCityPage((prev) => Math.min(prev + 1, totalCityPages - 1));
    const prevCityPage = () => setCityPage((prev) => Math.max(prev - 1, 0));

    if (!activeFeatured) {
        return null;
    }

    return (
        <section className="px-4 lg:px-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                            Events & Announcements
                        </p>
                        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                            Highlighted BCCC public events on the left, city events stacked on the right.
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-[#5a5650] dark:text-[#c8c8ce]">
                            The highlighted convention-center events now move left and right, while the city public
                            events on the right display two per view and stay hidden until the user scrolls through
                            them.
                        </p>
                    </div>

                    <Link
                        href="/events"
                        className="inline-flex items-center gap-2 rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-[#2d47ff]"
                    >
                        View all events
                    </Link>
                </div>

                <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
                    <article className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-[#16171b]">
                        <div className="relative h-[22rem] overflow-hidden bg-gradient-to-br from-[#2f5f52] to-[#21344d]">
                            <img
                                src={activeFeatured.lightImage}
                                alt={activeFeatured.title}
                                className="h-full w-full object-cover dark:hidden"
                            />
                            <img
                                src={activeFeatured.darkImage}
                                alt={activeFeatured.title}
                                className="hidden h-full w-full object-cover dark:block"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                            <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3">
                                <span className="rounded-full bg-[#174f40] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white dark:bg-[#2d47ff]">
                                    Featured BCCC Event
                                </span>

                                {featuredEvents.length > 1 && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={prevFeatured}
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#1f1f1c] backdrop-blur"
                                            aria-label="Previous highlighted event"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={nextFeatured}
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#1f1f1c] backdrop-blur"
                                            aria-label="Next highlighted event"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-5">
                                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-white/85">
                                    <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">{activeFeatured.category}</span>
                                    <span className="flex items-center gap-1">
                                        <CalendarDays className="h-4 w-4" />
                                        {activeFeatured.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {activeFeatured.venue}
                                    </span>
                                </div>

                                <h3 className="mt-3 text-3xl font-black text-white">{activeFeatured.title}</h3>
                            </div>
                        </div>

                        <div className="space-y-4 p-5">
                            <p className="text-sm leading-7 text-[#585550] dark:text-[#c8c8ce]">{activeFeatured.summary}</p>

                            <div className="rounded-[1.4rem] bg-[#f7f2e8] p-4 dark:bg-[#1d1e23]">
                                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#174f40] dark:text-[#9dc0ff]">
                                    Frontend Highlight Logic
                                </p>
                                <p className="mt-2 text-sm leading-7 text-[#55514c] dark:text-[#ccccd2]">
                                    Only public BCCC events that are marked as highlighted belong in this left-side
                                    slider.
                                </p>
                            </div>
                        </div>
                    </article>

                    <aside className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-[#16171b]">
                        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4 dark:border-white/10">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#174f40] dark:text-[#9dc0ff]">
                                    Baguio City Public Events
                                </p>
                                <p className="mt-1 text-sm text-[#5d5a55] dark:text-[#c7c7cd]">
                                    Showing {cityPage * CITY_PAGE_SIZE + 1}–
                                    {Math.min(cityPage * CITY_PAGE_SIZE + CITY_PAGE_SIZE, cityEvents.length)} of {cityEvents.length}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={prevCityPage}
                                    disabled={cityPage === 0}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 disabled:opacity-40 dark:border-white/10"
                                    aria-label="Previous city events"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={nextCityPage}
                                    disabled={cityPage >= totalCityPages - 1}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 disabled:opacity-40 dark:border-white/10"
                                    aria-label="Next city events"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 p-5">
                            {visibleCityEvents.map((event) => (
                                <article
                                    key={`${event.title}-${event.date}`}
                                    className="overflow-hidden rounded-[1.6rem] border border-black/10 bg-[#fbf8f2] dark:border-white/10 dark:bg-[#1d1e23]"
                                >
                                    <div className="grid gap-0 md:grid-cols-[0.92fr_1.08fr]">
                                        <div className="relative h-44 md:h-full">
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

                                        <div className="space-y-3 p-4">
                                            <span className="inline-flex rounded-full bg-[#d8e6ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1d4fbf] dark:bg-[#1d2b49] dark:text-[#a8c0ff]">
                                                {event.category}
                                            </span>

                                            <h4 className="text-xl font-black tracking-tight">{event.title}</h4>

                                            <div className="space-y-1 text-sm text-[#5a5752] dark:text-[#c7c7cd]">
                                                <p className="flex items-center gap-2">
                                                    <CalendarDays className="h-4 w-4" />
                                                    {event.date}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    {event.venue}
                                                </p>
                                            </div>

                                            <p className="text-sm leading-7 text-[#59554f] dark:text-[#c8c8ce]">
                                                {event.summary}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}
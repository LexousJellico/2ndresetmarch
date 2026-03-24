import { Link } from '@inertiajs/react';
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';
import { events as fallbackEvents, type EventItem } from '@/data/events';

const CITY_PAGE_SIZE = 2;

export default function EventsHighlights({ items }: { items?: EventItem[] }) {
  const sourceEvents = items && items.length > 0 ? items : fallbackEvents;
  const [currentPage, setCurrentPage] = useState(0);

  const featuredEvents = useMemo(
    () =>
      sourceEvents.filter(
        (item) => item.scope === 'bccc' && item.highlighted && item.isPublic,
      ),
    [sourceEvents],
  );

  const cityEvents = useMemo(
    () => sourceEvents.filter((item) => item.scope === 'city' && item.isPublic),
    [sourceEvents],
  );

  const totalPages = Math.max(1, Math.ceil(cityEvents.length / CITY_PAGE_SIZE));

  const visibleCityEvents = useMemo(() => {
    const start = currentPage * CITY_PAGE_SIZE;
    return cityEvents.slice(start, start + CITY_PAGE_SIZE);
  }, [cityEvents, currentPage]);

  const handlePrevious = () => {
    setCurrentPage((page) => (page - 1 + totalPages) % totalPages);
  };

  const handleNext = () => {
    setCurrentPage((page) => (page + 1) % totalPages);
  };

  return (
    <section
      id="events"
      className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-neutral-950 dark:shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8 px-6 py-10 sm:px-10">
            <div className="space-y-3">
              <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                Events at BCCC
              </span>
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  Public highlights happening at the Convention Center
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                  Stay informed about major Convention Center programs, cultural
                  showcases, exhibitions, and city-supported gatherings scheduled
                  at BCCC.
                </p>
              </div>
            </div>

            {featuredEvents.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {featuredEvents.slice(0, 2).map((event) => (
                  <article
                    key={`${event.scope}-${event.title}`}
                    className="group overflow-hidden rounded-2xl border border-black/5 bg-slate-50 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={event.lightImage}
                        alt={event.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105 dark:hidden"
                      />
                      <img
                        src={event.darkImage}
                        alt={event.title}
                        className="hidden h-full w-full object-cover transition duration-500 group-hover:scale-105 dark:block"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 text-white">
                        <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] backdrop-blur">
                          {event.category}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-white/90">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {event.date}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 px-5 py-5">
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                          {event.title}
                        </h3>
                        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                          {event.summary}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-300">
                        <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                        {event.venue}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                No highlighted BCCC public events are available yet.
              </div>
            )}
          </div>

          <aside className="border-t border-black/5 bg-slate-900 px-6 py-10 text-white dark:border-white/10 lg:border-l lg:border-t-0">
            <div className="flex h-full flex-col gap-6">
              <div className="space-y-3">
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-white/85">
                  Baguio City Events
                </span>
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold tracking-tight sm:text-[2.15rem]">
                    City-wide public events calendar snapshot
                  </h2>
                  <p className="text-sm leading-7 text-white/75 sm:text-base">
                    View selected public city activities and community events
                    related to Baguio’s tourism, culture, and civic programs.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
                  aria-label="Previous city events"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="text-sm font-medium text-white/70">
                  {Math.min(currentPage + 1, totalPages)} / {totalPages}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
                  aria-label="Next city events"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-4">
                {visibleCityEvents.length > 0 ? (
                  visibleCityEvents.map((event) => (
                    <article
                      key={`${event.scope}-${event.title}`}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                    >
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.26em] text-emerald-200">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {event.date}
                        </div>
                        <h3 className="text-xl font-semibold text-white">
                          {event.title}
                        </h3>
                        <p className="text-sm leading-7 text-white/75">
                          {event.summary}
                        </p>
                      </div>
                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white/80">
                        <MapPin className="h-4 w-4 text-emerald-300" />
                        {event.venue}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-5 py-10 text-center text-sm text-white/70">
                    No city public events are available yet.
                  </div>
                )}
              </div>

              <Link
                href="/events"
                className="inline-flex w-fit items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-50"
              >
                Explore all events
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

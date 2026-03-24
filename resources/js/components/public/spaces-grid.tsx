import { Link } from '@inertiajs/react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { facilities as fallbackFacilities, type Facility } from '@/data/facilities';

export default function SpacesGrid({ items }: { items?: Facility[] }) {
  const facilities = items && items.length > 0 ? items : fallbackFacilities;
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollByAmount = (amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <section
      id="facilities"
      className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              Featured Spaces
            </span>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Designed for conferences, exhibits, and city events
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                Browse the Convention Center’s main venues and support spaces
                prepared for meetings, exhibitions, ceremonies, and public
                programs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollByAmount(-420)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-white"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount(420)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-white"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {facilities.map((facility) => (
            <article
              key={facility.slug}
              className="group relative min-w-[320px] flex-1 snap-start overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-neutral-950 dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:min-w-[360px] lg:min-w-[380px]"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={facility.lightImage}
                  alt={facility.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105 dark:hidden"
                />
                <img
                  src={facility.darkImage}
                  alt={facility.title}
                  className="hidden h-full w-full object-cover transition duration-500 group-hover:scale-105 dark:block"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 text-white">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] backdrop-blur">
                    {facility.category}
                  </span>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                    {facility.capacity}
                  </span>
                </div>
              </div>

              <div className="space-y-4 px-5 py-5">
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    {facility.title}
                  </h3>
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {facility.shortDescription}
                  </p>
                </div>

                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {facility.details.slice(0, 3).map((detail) => (
                    <li key={`${facility.slug}-${detail}`} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2">
                  <Link
                    href={`/facilities#${facility.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-white/10 dark:text-white dark:hover:border-emerald-400/40 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-200"
                  >
                    {facility.ctaLabel ?? 'View space'}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

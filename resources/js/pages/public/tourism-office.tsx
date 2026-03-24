import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Clock3, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import type { EventItem } from '@/data/events';
import type { Facility } from '@/data/facilities';
import PublicLayout, { type SiteSettings } from '@/layouts/public-layout';

type TourismOfficePageProps = {
  officeSpace?: Facility | null;
  events?: EventItem[];
};

const fallbackServices = [
  'Visitor information and basic tourism guidance',
  'Public assistance and venue-related inquiries',
  'Coordination support for tourism-linked activities',
  'Reference point for local destination orientation',
];

const fallbackSupportNotes = [
  'Tourism-linked public coordination',
  'Visitor support and destination guidance',
  'Venue-related information assistance',
];

export default function TourismOfficePage({
  officeSpace,
  events = [],
}: TourismOfficePageProps) {
  const page = usePage<{ siteSettings?: SiteSettings }>();
  const siteSettings = page.props.siteSettings;

  const services =
    officeSpace?.details && officeSpace.details.length > 0
      ? officeSpace.details
      : fallbackServices;

  const address =
    siteSettings?.address ?? 'CH3X+RRW, Baguio, Benguet, Philippines';
  const phone = siteSettings?.phone ?? '(074) 446 2009';
  const email = siteSettings?.email ?? 'info@bccc-ease.com';

  return (
    <PublicLayout>
      <Head title="Tourism Office" />

      <section className="mx-auto w-full max-w-7xl space-y-10 px-4 pb-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-neutral-950 dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
          <div className="grid gap-0 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="space-y-5 px-6 py-8 sm:px-8 sm:py-10">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                Tourism Office
              </span>

              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                  Visitor assistance and tourism-related support within the venue setting
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                  This page serves as the public-facing tourism assistance area for
                  the Baguio Convention and Cultural Center environment.
                </p>
              </div>

              <div className="rounded-[2rem] border border-black/5 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
                  About the Office
                </div>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Tourism coordination point
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {officeSpace?.summary ??
                    'The Tourism Office section complements the center’s identity as both a civic venue and a public destination.'}
                </p>

                <div className="mt-5 grid gap-3">
                  {services.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-[#121318] dark:text-slate-300"
                    >
                      • {item}
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/contact"
                    className="inline-flex items-center rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-[#2d47ff]"
                  >
                    Contact the Office
                  </Link>

                  <Link
                    href="/events"
                    className="inline-flex items-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    View Public Events
                  </Link>
                </div>
              </div>
            </div>

            <div className="border-t border-black/5 bg-[#f7f5ef] px-6 py-8 dark:border-white/10 dark:bg-white/5 lg:border-l lg:border-t-0">
              <div className="space-y-6">
                <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#121318]">
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
                    Public Information
                  </div>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    Office details
                  </h2>

                  <div className="mt-5 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span>{email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock3 className="h-4 w-4 shrink-0" />
                      <span>Monday to Friday, 8:00 AM to 5:00 PM</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#121318]">
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
                    Support Scope
                  </div>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    What this page can hold
                  </h2>

                  <div className="mt-5 grid gap-3">
                    {fallbackSupportNotes.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-black/5 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                      >
                        • {item}
                      </div>
                    ))}
                  </div>
                </div>

                {events.length > 0 && (
                  <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#121318]">
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
                      Related Public Events
                    </div>
                    <div className="mt-5 grid gap-4">
                      {events.map((event) => (
                        <div
                          key={`${event.scope}-${event.title}`}
                          className="rounded-2xl border border-black/5 bg-slate-50 px-4 py-4 dark:border-white/10 dark:bg-white/5"
                        >
                          <div className="space-y-2">
                            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-300">
                              {event.category}
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                              {event.title}
                            </h3>
                            <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                              {event.summary}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Link
                      href="/events"
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#174f40] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-[#2d47ff]"
                    >
                      Explore all events
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

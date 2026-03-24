import { Link } from '@inertiajs/react';
import { CalendarDays, MapPin, Sparkles, Trees } from 'lucide-react';
import AvailabilityStrip from '@/components/public/availability-strip';

type VenueOption = {
    label: string;
    value: string;
    category?: string | null;
    capacity?: string | null;
};

interface HeroBannerProps {
    venueOptions: VenueOption[];
}

export default function HeroBanner({ venueOptions }: HeroBannerProps) {
    return (
        <section className="px-4 pt-4 lg:px-6">
            <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#16171b]">
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(39,99,73,0.18),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(29,91,216,0.16),_transparent_35%),linear-gradient(135deg,_#f7f2e8_0%,_#ffffff_48%,_#eef4ff_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(101,160,131,0.16),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(96,132,255,0.22),_transparent_35%),linear-gradient(135deg,_#121318_0%,_#171923_48%,_#111827_100%)]" />
                    <div className="relative grid gap-8 px-6 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-12">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#174f40] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-[#9dc0ff]">
                                <Trees className="h-4 w-4" />
                                Breathe Baguio
                            </div>

                            <div className="space-y-4">
                                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-[#1f1b16] sm:text-5xl lg:text-6xl dark:text-white">
                                    Baguio Convention &amp; Cultural Center
                                </h1>

                                <p className="text-lg font-semibold text-[#1d5bd8] dark:text-[#a9c4ff]">
                                    Events Access &amp; Scheduling Engine
                                </p>

                                <p className="max-w-2xl text-sm leading-7 text-[#5b564f] sm:text-base dark:text-[#c8c8ce]">
                                    A cleaner public experience where guests can instantly check venue availability,
                                    explore public schedules, and move to the formal booking workflow using the same
                                    backend availability logic.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/bookings/create"
                                    className="inline-flex items-center gap-2 rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md dark:bg-[#2d47ff]"
                                >
                                    <CalendarDays className="h-4 w-4" />
                                    Book Now
                                </Link>

                                <Link
                                    href="/facilities"
                                    className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-5 py-3 text-sm font-semibold text-[#1f1b16] transition hover:-translate-y-0.5 hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                                >
                                    <MapPin className="h-4 w-4" />
                                    Explore Spaces
                                </Link>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-black/10 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
                                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#174f40] dark:text-[#9dc0ff]">
                                        <Sparkles className="h-4 w-4" />
                                        Real-time check
                                    </p>
                                    <p className="mt-2 text-sm text-[#5b564f] dark:text-[#c8c8ce]">
                                        Same availability source used by booking and public display.
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-black/10 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
                                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#174f40] dark:text-[#9dc0ff]">
                                        Public visibility
                                    </p>
                                    <p className="mt-2 text-sm text-[#5b564f] dark:text-[#c8c8ce]">
                                        Public events stay visible while private bookings remain protected.
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-black/10 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
                                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#174f40] dark:text-[#9dc0ff]">
                                        Venue-based
                                    </p>
                                    <p className="mt-2 text-sm text-[#5b564f] dark:text-[#c8c8ce]">
                                        The venue picker now uses real spaces instead of an empty selector.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:pl-2">
                            <AvailabilityStrip venueOptions={venueOptions} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

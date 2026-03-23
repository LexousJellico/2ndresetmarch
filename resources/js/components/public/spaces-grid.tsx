import { Link } from '@inertiajs/react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

import { facilities } from '@/data/facilities';

export default function SpacesGrid() {
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const scrollByAmount = (direction: 'left' | 'right') => {
        const node = scrollRef.current;
        if (!node) return;

        const amount = node.clientWidth * 0.82;
        node.scrollBy({
            left: direction === 'right' ? amount : -amount,
            behavior: 'smooth',
        });
    };

    return (
        <section className="px-4 lg:px-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                            Our Spaces
                        </p>
                        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                            Scroll through the venue areas instead of stacking all spaces at once.
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-[#5a5650] dark:text-[#c8c8ce]">
                            This layout keeps the homepage cleaner by showing only a limited number of spaces per view,
                            while the rest remain hidden until the user drags or scrolls horizontally.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => scrollByAmount('left')}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-[#18191d]"
                            aria-label="Scroll spaces left"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollByAmount('right')}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-[#18191d]"
                            aria-label="Scroll spaces right"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>

                        <Link
                            href="/facilities"
                            className="inline-flex items-center gap-2 rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-[#2d47ff]"
                        >
                            View all spaces
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="grid auto-cols-[88%] grid-flow-col gap-4 overflow-x-auto pb-2 pr-1 [scrollbar-width:none] sm:auto-cols-[48%] xl:auto-cols-[24%]"
                >
                    {facilities.map((facility) => (
                        <article
                            key={facility.slug}
                            className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-[#16171b]"
                        >
                            <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[#315f52] to-[#1c2d41]">
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
                                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

                                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#174f40] dark:bg-[#0f1627]/85 dark:text-[#9dc0ff]">
                                    {facility.category}
                                </div>

                                <div className="absolute bottom-4 left-4 right-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/85">
                                        {facility.capacity}
                                    </p>
                                    <h3 className="mt-2 text-2xl font-black text-white">{facility.title}</h3>
                                </div>
                            </div>

                            <div className="space-y-4 p-5">
                                <p className="text-sm leading-7 text-[#595550] dark:text-[#c8c8ce]">{facility.shortDescription}</p>

                                <div className="rounded-[1.4rem] bg-[#f7f2e8] p-4 dark:bg-[#1d1e23]">
                                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#174f40] dark:text-[#9dc0ff]">
                                        Included / Best Used For
                                    </p>
                                    <ul className="mt-3 space-y-2 text-sm text-[#4b4843] dark:text-[#d0d0d5]">
                                        {facility.details.map((detail) => (
                                            <li key={detail} className="flex items-start gap-2">
                                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#174f40] dark:bg-[#8fb1ff]" />
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Link
                                    href={`/facilities/${facility.slug}`}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#174f40] transition hover:gap-3 dark:text-[#9dc0ff]"
                                >
                                    {facility.ctaLabel}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
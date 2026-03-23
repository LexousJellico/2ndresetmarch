import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { offers } from '@/data/offers';

const PAGE_SIZE = 2;

export default function SpecialOffers() {
    const [page, setPage] = useState(0);
    const totalPages = Math.max(1, Math.ceil(offers.length / PAGE_SIZE));
    const visibleOffers = offers.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

    return (
        <section className="px-4 lg:px-6">
            <div className="mx-auto max-w-7xl">
                <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-[#16171b]">
                    <div className="flex flex-col gap-4 border-b border-black/10 px-5 py-5 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                                Special Offers
                            </p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight">
                                Vertical package browsing with only two visible at a time.
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-[#5a5650] dark:text-[#c8c8ce]">
                                Extra package cards remain hidden until the user scrolls or clicks through the next set.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                                disabled={page === 0}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 disabled:opacity-40 dark:border-white/10"
                                aria-label="Previous offers"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                                disabled={page >= totalPages - 1}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 disabled:opacity-40 dark:border-white/10"
                                aria-label="Next offers"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-5 p-5 lg:grid-cols-2">
                        {visibleOffers.map((offer) => (
                            <article
                                key={offer.title}
                                className="overflow-hidden rounded-[1.8rem] border border-black/10 bg-[#fbf8f2] dark:border-white/10 dark:bg-[#1d1e23]"
                            >
                                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[#355b51] to-[#25354c]">
                                    <img
                                        src={offer.lightImage}
                                        alt={offer.title}
                                        className="h-full w-full object-cover dark:hidden"
                                    />
                                    <img
                                        src={offer.darkImage}
                                        alt={offer.title}
                                        className="hidden h-full w-full object-cover dark:block"
                                    />
                                </div>

                                <div className="space-y-4 p-5">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#174f40] dark:text-[#9dc0ff]">
                                            Package Feature
                                        </p>
                                        <h3 className="mt-2 text-2xl font-black tracking-tight">{offer.title}</h3>
                                    </div>

                                    <p className="text-sm font-semibold text-[#4a4742] dark:text-[#dadade]">
                                        {offer.subtitle}
                                    </p>

                                    <p className="text-sm leading-7 text-[#5a5650] dark:text-[#c8c8ce]">
                                        {offer.description}
                                    </p>

                                    <Link
                                        href={offer.href}
                                        className="inline-flex rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-[#2d47ff]"
                                    >
                                        {offer.buttonLabel}
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
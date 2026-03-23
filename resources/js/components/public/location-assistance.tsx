import { CalendarDays, Mail, MapPin, Phone } from 'lucide-react';

export default function LocationAssistance() {
    return (
        <section className="px-4 lg:px-6">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                    <article className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-[#16171b]">
                        <div className="border-b border-black/10 px-5 py-4 dark:border-white/10">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                                Location & Assistance
                            </p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight">View the convention center on the map.</h2>
                        </div>

                        <div className="relative h-[26rem] w-full">
                            <iframe
                                title="Baguio Convention and Cultural Center Map"
                                src="https://www.google.com/maps?q=CH3X%2BRRW%2C%20Baguio%2C%20Benguet%2C%20Philippines&z=16&output=embed"
                                className="h-full w-full border-0"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </article>

                    <aside className="space-y-5">
                        <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-[#16171b]">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#174f40] dark:text-[#9dc0ff]">
                                Contact & Location
                            </p>

                            <div className="mt-4 space-y-3 text-sm">
                                <a
                                    href="https://www.google.com/maps/search/?api=1&query=CH3X%2BRRW%2C%20Baguio%2C%20Benguet%2C%20Philippines"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-start gap-3 rounded-2xl bg-[#f7f2e8] px-4 py-3 transition hover:bg-[#f0eadf] dark:bg-[#1d1e23] dark:hover:bg-[#24262c]"
                                >
                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>CH3X+RRW, Baguio, Benguet, Philippines</span>
                                </a>

                                <a
                                    href="tel:+63744462009"
                                    className="flex items-center gap-3 rounded-2xl bg-[#f7f2e8] px-4 py-3 transition hover:bg-[#f0eadf] dark:bg-[#1d1e23] dark:hover:bg-[#24262c]"
                                >
                                    <Phone className="h-4 w-4 shrink-0" />
                                    <span>(074) 446 2009</span>
                                </a>

                                <a
                                    href="mailto:info@bccc-ease.com"
                                    className="flex items-center gap-3 rounded-2xl bg-[#f7f2e8] px-4 py-3 transition hover:bg-[#f0eadf] dark:bg-[#1d1e23] dark:hover:bg-[#24262c]"
                                >
                                    <Mail className="h-4 w-4 shrink-0" />
                                    <span>info@bccc-ease.com</span>
                                </a>
                            </div>

                            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                <a
                                    href="https://www.google.com/maps/search/?api=1&query=CH3X%2BRRW%2C%20Baguio%2C%20Benguet%2C%20Philippines"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-[#2d47ff]"
                                >
                                    Open Map
                                </a>

                                <a
                                    href="/contact"
                                    className="inline-flex items-center justify-center rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
                                >
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    Ask for Assistance
                                </a>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-[#16171b]">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#174f40] dark:text-[#9dc0ff]">
                                Public Guidance
                            </p>
                            <p className="mt-3 text-sm leading-7 text-[#585550] dark:text-[#c8c8ce]">
                                The map now points directly to the convention center area. On click, users can open the
                                full location in a new tab for route guidance and reference.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}
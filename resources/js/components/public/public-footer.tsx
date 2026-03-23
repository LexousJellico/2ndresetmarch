import { Link } from '@inertiajs/react';
import { ArrowUp, CalendarDays, Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'Facilities', href: '/facilities' },
    { label: 'Events', href: '/events' },
    { label: 'Calendar', href: '/calendar' },
    { label: 'Tourism Office', href: '/tourism-office' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Guidelines', href: '/guidelines' },
];

export default function PublicFooter() {
    const footerRef = useRef<HTMLElement | null>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const node = footerRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setShowScrollTop(entry.isIntersecting);
            },
            { threshold: 0.18 },
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    return (
        <>
            <footer
                ref={footerRef}
                className="relative mt-14 border-t border-black/10 bg-[#e8e1d3] dark:border-white/10 dark:bg-[#141519]"
            >
                <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
                    <div className="grid gap-8 lg:grid-cols-[1.25fr_0.9fr_1fr_0.95fr]">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#174f40] text-sm font-black text-white dark:bg-[#2d47ff]">
                                    BE
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                                        BCCC EASE
                                    </p>
                                    <p className="text-xs text-[#5e5b55] dark:text-[#b9b9c0]">
                                        Baguio Convention & Cultural Center
                                    </p>
                                </div>
                            </div>

                            <p className="max-w-md text-sm leading-7 text-[#4f4c46] dark:text-[#c8c8ce]">
                                A public-facing venue platform for space discovery, event highlights, schedule visibility,
                                and booking guidance for the Baguio Convention and Cultural Center.
                            </p>

                            <div className="flex items-center gap-3">
                                <a
                                    href="#"
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[#174f40] transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-[#1a1b20] dark:text-[#9dc0ff]"
                                    aria-label="Facebook"
                                >
                                    <Facebook className="h-4 w-4" />
                                </a>
                                <a
                                    href="#"
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[#174f40] transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-[#1a1b20] dark:text-[#9dc0ff]"
                                    aria-label="Instagram"
                                >
                                    <Instagram className="h-4 w-4" />
                                </a>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#174f40] dark:text-[#9dc0ff]">
                                Quick Links
                            </p>
                            <div className="mt-4 grid gap-2">
                                {quickLinks.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="rounded-xl px-3 py-2 text-sm text-[#3a3936] transition hover:bg-white/70 dark:text-[#d6d6dc] dark:hover:bg-white/5"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#174f40] dark:text-[#9dc0ff]">
                                Contact Details
                            </p>

                            <div className="space-y-3 text-sm text-[#3f3d39] dark:text-[#d4d4db]">
                                <a
                                    href="https://www.google.com/maps/search/?api=1&query=CH3X%2BRRW%2C%20Baguio%2C%20Benguet%2C%20Philippines"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-start gap-3 rounded-2xl bg-white/75 px-4 py-3 transition hover:bg-white dark:bg-white/5 dark:hover:bg-white/8"
                                >
                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>CH3X+RRW, Baguio, Benguet, Philippines</span>
                                </a>

                                <a
                                    href="tel:+63744462009"
                                    className="flex items-center gap-3 rounded-2xl bg-white/75 px-4 py-3 transition hover:bg-white dark:bg-white/5 dark:hover:bg-white/8"
                                >
                                    <Phone className="h-4 w-4 shrink-0" />
                                    <span>(074) 446 2009</span>
                                </a>

                                <a
                                    href="mailto:info@bccc-ease.com"
                                    className="flex items-center gap-3 rounded-2xl bg-white/75 px-4 py-3 transition hover:bg-white dark:bg-white/5 dark:hover:bg-white/8"
                                >
                                    <Mail className="h-4 w-4 shrink-0" />
                                    <span>info@bccc-ease.com</span>
                                </a>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-black/10 bg-white/85 p-5 dark:border-white/10 dark:bg-white/5">
                            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#174f40] dark:text-[#9dc0ff]">
                                Need Venue Assistance?
                            </p>
                            <p className="mt-3 text-sm leading-7 text-[#4d4a45] dark:text-[#cbcbcf]">
                                Start your inquiry, review event highlights, or proceed to the public schedule pages for
                                guidance.
                            </p>

                            <Link
                                href="/contact"
                                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 dark:bg-[#2d47ff]"
                            >
                                <CalendarDays className="h-4 w-4" />
                                Start Inquiry
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-black/10 pt-5 text-sm text-[#5a5650] dark:border-white/10 dark:text-[#b8b8bf]">
                        © 2026 BCCC EASE • City Government of Baguio • All Rights Reserved
                    </div>
                </div>
            </footer>

            {showScrollTop && (
                <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-6 right-6 z-[70] inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#174f40] text-white shadow-lg transition hover:-translate-y-1 dark:bg-[#2d47ff]"
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="h-5 w-5" />
                </button>
            )}
        </>
    );
}
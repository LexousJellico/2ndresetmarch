import { Link, usePage } from '@inertiajs/react';
import { CalendarDays, Menu, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import ThemeToggle from '@/components/public/theme-toggle';

type AuthUser = {
    name?: string | null;
    email?: string | null;
};

type SharedProps = {
    auth?: {
        user?: AuthUser | null;
    };
};

const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Facilities', href: '/facilities' },
    { label: 'Events', href: '/events' },
    { label: 'Calendar', href: '/calendar' },
    { label: 'Tourism Office', href: '/tourism-office' },
    { label: 'Contact Us', href: '/contact' },
];

export default function PublicHeader() {
    const page = usePage<SharedProps>();
    const user = page.props.auth?.user;
    const currentUrl = useMemo(() => page.url.split('?')[0], [page.url]);

    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 10);
        onScroll();
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const previous = document.body.style.overflow;
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.body.style.overflow = previous;
        };
    }, [mobileOpen]);

    const isActive = (href: string) => {
        if (href === '/') {
            return currentUrl === '/';
        }
        return currentUrl === href || currentUrl.startsWith(`${href}/`);
    };

    const ctaHref = user ? '/dashboard' : '/contact';
    const ctaLabel = user ? 'Dashboard' : 'Book / Inquire';

    return (
        <>
            <header className="sticky top-0 z-50">
                <div
                    className={`transition-all duration-300 ${
                        isScrolled
                            ? 'border-b border-black/10 bg-[#f6f2ea]/92 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#101114]/92'
                            : 'bg-transparent'
                    }`}
                >
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
                        <div className="flex min-w-0 items-center gap-3">
                            <Link href="/" className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#174f40] text-sm font-bold text-white shadow-sm dark:bg-[#2d47ff]">
                                    BE
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                                        BCCC EASE
                                    </p>
                                    <p className="truncate text-xs text-[#5b5b57] dark:text-[#bcbcc4]">
                                        Baguio Convention & Cultural Center
                                    </p>
                                </div>
                            </Link>
                        </div>

                        <nav className="hidden items-center gap-1 xl:flex">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                        isActive(item.href)
                                            ? 'bg-[#174f40] text-white dark:bg-[#2d47ff]'
                                            : 'text-[#2b2b29] hover:bg-black/5 dark:text-[#ececf1] dark:hover:bg-white/10'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="hidden items-center gap-3 xl:flex">
                            <ThemeToggle />

                            <Link
                                href={ctaHref}
                                className="inline-flex items-center gap-2 rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 dark:bg-[#2d47ff]"
                            >
                                <CalendarDays className="h-4 w-4" />
                                {ctaLabel}
                            </Link>
                        </div>

                        <div className="flex items-center gap-2 xl:hidden">
                            <ThemeToggle />

                            <button
                                type="button"
                                onClick={() => setMobileOpen((prev) => !prev)}
                                aria-label="Toggle menu"
                                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/80 text-[#1f1f1c] shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-[#1b1c20] dark:text-white dark:hover:bg-[#25262b]"
                            >
                                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {mobileOpen && (
                <div className="fixed inset-0 z-[60] xl:hidden">
                    <div className="absolute inset-0 bg-black/45" onClick={() => setMobileOpen(false)} />

                    <div className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-[#f6f2ea] p-5 dark:bg-[#111216]">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                                    BCCC EASE
                                </p>
                                <p className="text-xs text-[#60605d] dark:text-[#b9b9c0]">Public Navigation</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setMobileOpen(false)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[#1f1f1c] dark:border-white/10 dark:bg-[#1f2024] dark:text-white"
                                aria-label="Close menu"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                                        isActive(item.href)
                                            ? 'bg-[#174f40] text-white dark:bg-[#2d47ff]'
                                            : 'bg-white text-[#1f1f1c] hover:bg-[#ece8de] dark:bg-[#1d1e22] dark:text-white dark:hover:bg-[#26272d]'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        <div className="mt-6 rounded-3xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-[#17181c]">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#174f40] dark:text-[#9dc0ff]">
                                Quick Action
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[#5f5f5b] dark:text-[#c1c1c8]">
                                Start your venue inquiry, review spaces, or continue to the official booking flow.
                            </p>

                            <Link
                                href={ctaHref}
                                onClick={() => setMobileOpen(false)}
                                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white dark:bg-[#2d47ff]"
                            >
                                {ctaLabel}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
import { Link, usePage } from '@inertiajs/react';
import { CalendarDays, Menu, MessageSquareMore, X } from 'lucide-react';
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
                                        Baguio Convention &amp; Cultural Center
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
                                            : 'text-[#1f1f1c] hover:bg-black/5 dark:text-white dark:hover:bg-white/10'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="hidden items-center gap-3 xl:flex">
                            <div className="inline-flex overflow-hidden rounded-full border border-black/10 bg-white/80 shadow-sm dark:border-white/10 dark:bg-[#1b1c20]">
                                <Link
                                    href="/bookings/create"
                                    className="inline-flex items-center gap-2 border-r border-black/10 px-4 py-2.5 text-sm font-semibold text-[#174f40] transition hover:bg-[#eef4f1] dark:border-white/10 dark:text-[#9dc0ff] dark:hover:bg-[#1d2330]"
                                >
                                    <CalendarDays className="h-4 w-4" />
                                    Book
                                </Link>

                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#1f1f1c] transition hover:bg-[#f4ede1] dark:text-white dark:hover:bg-[#26272d]"
                                >
                                    <MessageSquareMore className="h-4 w-4" />
                                    Inquire
                                </Link>
                            </div>

                            <ThemeToggle />
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
                    <div
                        className="absolute inset-0 bg-black/55"
                        onClick={() => setMobileOpen(false)}
                    />

                    <div className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-[#f6f2ea] p-5 dark:bg-[#101114]">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                                    BCCC EASE
                                </p>
                                <p className="text-xs text-[#5b5b57] dark:text-[#bcbcc4]">
                                    Public Navigation
                                </p>
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

                        <div className="mt-6 rounded-[1.8rem] border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-[#17181c]">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#174f40] dark:text-[#9dc0ff]">
                                Quick Action
                            </p>

                            <p className="mt-2 text-sm leading-7 text-[#5b5b57] dark:text-[#c8c8ce]">
                                Start the formal booking flow or go directly to the inquiry page.
                            </p>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <Link
                                    href="/bookings/create"
                                    onClick={() => setMobileOpen(false)}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white dark:bg-[#2d47ff]"
                                >
                                    <CalendarDays className="h-4 w-4" />
                                    Book
                                </Link>

                                <Link
                                    href="/contact"
                                    onClick={() => setMobileOpen(false)}
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold dark:border-white/10"
                                >
                                    <MessageSquareMore className="h-4 w-4" />
                                    Inquire
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

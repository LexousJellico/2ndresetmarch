import { ChevronDown, CalendarDays, LayoutGrid, Megaphone, Package2, PanelsTopLeft, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const configItems = [
    {
        label: 'Events Manager',
        href: '#events-config',
        icon: Megaphone,
        description: 'BCCC Events and Baguio City Events',
    },
    {
        label: 'Packages Manager',
        href: '#packages-config',
        icon: Package2,
        description: 'Feature packages and offers',
    },
    {
        label: 'Calendar Rules',
        href: '#calendar-config',
        icon: CalendarDays,
        description: 'Schedule colors and blocked dates',
    },
    {
        label: 'Spaces Content',
        href: '#spaces-config',
        icon: LayoutGrid,
        description: 'Our Spaces cards and facility details',
    },
    {
        label: 'Homepage Sections',
        href: '#homepage-config',
        icon: PanelsTopLeft,
        description: 'Stats, map, footer, and homepage blocks',
    },
    {
        label: 'System Notes',
        href: '#system-config',
        icon: ShieldCheck,
        description: 'Connected admin/backend notes',
    },
];

export default function ConfigDropdown() {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    open
                        ? 'bg-[#174f40] text-white dark:bg-[#2d47ff]'
                        : 'text-[#24241f] hover:bg-black/5 dark:text-white dark:hover:bg-white/10'
                }`}
            >
                Config
                <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[22rem] overflow-hidden rounded-[1.6rem] border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.14)] dark:border-white/10 dark:bg-[#16171b]">
                    <div className="border-b border-black/10 px-4 py-4 dark:border-white/10">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#174f40] dark:text-[#9dc0ff]">
                            Config Menu
                        </p>
                        <p className="mt-1 text-sm text-[#5a5650] dark:text-[#c8c8ce]">
                            Jump directly to the admin sections that control frontend content.
                        </p>
                    </div>

                    <div className="p-3">
                        {configItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className="flex items-start gap-3 rounded-2xl px-3 py-3 transition hover:bg-[#f5efe4] dark:hover:bg-[#1e2026]"
                                >
                                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef4f1] text-[#174f40] dark:bg-[#1d2330] dark:text-[#9dc0ff]">
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-[#1f1f1c] dark:text-white">
                                            {item.label}
                                        </p>
                                        <p className="mt-1 text-xs leading-6 text-[#64615b] dark:text-[#c3c3ca]">
                                            {item.description}
                                        </p>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
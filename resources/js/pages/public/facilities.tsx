import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Building2, LayoutGrid, Users } from 'lucide-react';
import { useMemo } from 'react';

import { facilities } from '@/data/facilities';
import PublicLayout from '@/layouts/public-layout';

type RawFacility = {
    slug: string;
    title: string;
    shortDescription?: string;
    summary?: string;
    details?: string[];
    image?: string;
    lightImage?: string;
    darkImage?: string;
    capacity?: string;
    category?: string;
    ctaLabel?: string;
    featured?: boolean;
};

type NormalizedFacility = {
    slug: string;
    title: string;
    shortDescription: string;
    summary: string;
    details: string[];
    image: string;
    lightImage: string;
    darkImage: string;
    capacity: string;
    category: string;
    ctaLabel: string;
    featured: boolean;
};

function normalizeFacilities(items: RawFacility[]): NormalizedFacility[] {
    return items.map((item) => {
        const image = item.image ?? '/marketing/images/facilities/foyer-lobby.jpg';

        return {
            slug: item.slug,
            title: item.title,
            shortDescription:
                item.shortDescription ?? 'A public-facing venue space in the BCCC facility ecosystem.',
            summary:
                item.summary ??
                item.shortDescription ??
                'This space may be used depending on final setup, operational approval, and venue planning.',
            details:
                item.details ??
                [
                    'Flexible venue setup depending on approved event use',
                    'Suitable for public, institutional, and cultural activities',
                    'Final arrangement depends on booking validation',
                ],
            image,
            lightImage: item.lightImage ?? image,
            darkImage: item.darkImage ?? image,
            capacity: item.capacity ?? 'Flexible venue capacity',
            category: item.category ?? 'Venue Space',
            ctaLabel: item.ctaLabel ?? 'View Space',
            featured: item.featured ?? false,
        };
    });
}

function groupFacilities(items: NormalizedFacility[]) {
    const mainTitles = [
        'Foyer & Lobby',
        'Ground & Parking Area',
        'Grounds & Parking Area',
        'Basement',
        'VIP Lounge & Boardroom',
        'VIP Lounge',
        'Gallery2600',
        'Gallery 2600',
        'Main Hall',
        'Tech Booth',
        'Tourism Office',
    ];

    const isMain = (title: string) =>
        mainTitles.some((item) => item.toLowerCase() === title.toLowerCase());

    const mainSpaces = items.filter((item) => isMain(item.title));
    const supportSpaces = items.filter((item) => !isMain(item.title));

    return { mainSpaces, supportSpaces };
}

export default function FacilitiesPage() {
    const normalizedFacilities = useMemo(
        () => normalizeFacilities(facilities as RawFacility[]),
        [],
    );

    const { mainSpaces, supportSpaces } = useMemo(
        () => groupFacilities(normalizedFacilities),
        [normalizedFacilities],
    );

    return (
        <PublicLayout>
            <Head title="Facilities" />

            <section className="px-4 py-8 lg:px-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#16171b]">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                            Venue Spaces
                        </p>
                        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                            Explore the spaces that shape the Baguio Convention and Cultural Center.
                        </h1>
                        <p className="mt-3 max-w-4xl text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                            This page expands the public facility presentation beyond the homepage slider so each area can
                            have its own dedicated information page.
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link
                                href="/calendar"
                                className="inline-flex items-center rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white dark:bg-[#2d47ff]"
                            >
                                Check Calendar
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
                            >
                                Ask for Venue Assistance
                            </Link>
                        </div>
                    </div>

                    <section className="space-y-4">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                                Main Public Spaces
                            </p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight">
                                Core venue areas
                            </h2>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {mainSpaces.map((facility) => (
                                <article
                                    key={facility.slug}
                                    className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 dark:border-white/10 dark:bg-[#16171b]"
                                >
                                    <div className="relative h-56 overflow-hidden">
                                        <img
                                            src={facility.lightImage}
                                            alt={facility.title}
                                            className="h-full w-full object-cover dark:hidden"
                                        />
                                        <img
                                            src={facility.darkImage}
                                            alt={facility.title}
                                            className="hidden h-full w-full object-cover dark:block"
                                        />
                                    </div>

                                    <div className="space-y-4 p-5">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="inline-flex rounded-full bg-[#e8f2ee] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#174f40] dark:bg-[#18231f] dark:text-[#9dc0ff]">
                                                {facility.category}
                                            </span>
                                            <span className="inline-flex rounded-full bg-[#f7f2e8] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#635f58] dark:bg-[#1d1e23] dark:text-[#c8c8ce]">
                                                {facility.capacity}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-black tracking-tight">{facility.title}</h3>

                                        <p className="text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                                            {facility.shortDescription}
                                        </p>

                                        <div className="rounded-[1.4rem] bg-[#f7f2e8] p-4 dark:bg-[#1d1e23]">
                                            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#174f40] dark:text-[#9dc0ff]">
                                                Suitable For
                                            </p>
                                            <ul className="mt-3 space-y-2 text-sm text-[#595651] dark:text-[#c8c8ce]">
                                                {facility.details.slice(0, 3).map((detail) => (
                                                    <li key={detail} className="flex items-start gap-2">
                                                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#174f40] dark:bg-[#9dc0ff]" />
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
                    </section>

                    {supportSpaces.length > 0 && (
                        <section className="space-y-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                                    Supporting Areas
                                </p>
                                <h2 className="mt-2 text-2xl font-black tracking-tight">
                                    Operational and assistance spaces
                                </h2>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {supportSpaces.map((facility) => (
                                    <article
                                        key={facility.slug}
                                        className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#16171b]"
                                    >
                                        <div className="space-y-4 p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f2ee] text-[#174f40] dark:bg-[#18231f] dark:text-[#9dc0ff]">
                                                    <Building2 className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#174f40] dark:text-[#9dc0ff]">
                                                        {facility.category}
                                                    </p>
                                                    <h3 className="mt-1 text-xl font-black tracking-tight">
                                                        {facility.title}
                                                    </h3>
                                                </div>
                                            </div>

                                            <p className="text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                                                {facility.shortDescription}
                                            </p>

                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="rounded-[1.2rem] bg-[#f7f2e8] p-4 dark:bg-[#1d1e23]">
                                                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#174f40] dark:text-[#9dc0ff]">
                                                        <Users className="h-4 w-4" />
                                                        Capacity / Type
                                                    </p>
                                                    <p className="mt-2 text-sm text-[#595651] dark:text-[#c8c8ce]">
                                                        {facility.capacity}
                                                    </p>
                                                </div>

                                                <div className="rounded-[1.2rem] bg-[#f7f2e8] p-4 dark:bg-[#1d1e23]">
                                                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#174f40] dark:text-[#9dc0ff]">
                                                        <LayoutGrid className="h-4 w-4" />
                                                        Public Role
                                                    </p>
                                                    <p className="mt-2 text-sm text-[#595651] dark:text-[#c8c8ce]">
                                                        Venue-linked assistance and operational support.
                                                    </p>
                                                </div>
                                            </div>

                                            <Link
                                                href={`/facilities/${facility.slug}`}
                                                className="inline-flex items-center gap-2 text-sm font-semibold text-[#174f40] transition hover:gap-3 dark:text-[#9dc0ff]"
                                            >
                                                View Details
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
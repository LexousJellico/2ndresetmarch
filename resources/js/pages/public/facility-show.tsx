import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    LayoutGrid,
    MapPin,
    Users,
} from 'lucide-react';
import { useMemo } from 'react';

import { facilities } from '@/data/facilities';
import PublicLayout from '@/layouts/public-layout';

type FacilityShowPageProps = {
    slug: string;
};

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

function getExtendedPoints(facility: NormalizedFacility) {
    const base = [...facility.details];

    if (facility.title.toLowerCase() === 'main hall') {
        return [
            ...base,
            'Includes stage access as part of the Main Hall experience',
            'Includes backstage support areas under the Main Hall presentation',
            'Includes dressing room support under the Main Hall presentation',
        ];
    }

    return base;
}

export default function FacilityShowPage({ slug }: FacilityShowPageProps) {
    const normalizedFacilities = useMemo(
        () => normalizeFacilities(facilities as RawFacility[]),
        [],
    );

    const facility = normalizedFacilities.find((item) => item.slug === slug);
    const relatedFacilities = normalizedFacilities
        .filter((item) => item.slug !== slug)
        .slice(0, 3);

    if (!facility) {
        return (
            <PublicLayout>
                <Head title="Facility Not Found" />

                <section className="px-4 py-12 lg:px-6">
                    <div className="mx-auto max-w-4xl rounded-[2rem] border border-black/10 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-[#16171b]">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                            Facility Not Found
                        </p>
                        <h1 className="mt-3 text-3xl font-black tracking-tight">
                            The requested facility page is not available.
                        </h1>
                        <p className="mt-3 text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                            The link may be incomplete, or the selected facility has not yet been configured for the public pages.
                        </p>

                        <div className="mt-5 flex flex-wrap justify-center gap-3">
                            <Link
                                href="/facilities"
                                className="inline-flex rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white dark:bg-[#2d47ff]"
                            >
                                Back to Facilities
                            </Link>
                            <Link
                                href="/"
                                className="inline-flex rounded-full border border-black/10 px-5 py-3 text-sm font-semibold dark:border-white/10"
                            >
                                Go Home
                            </Link>
                        </div>
                    </div>
                </section>
            </PublicLayout>
        );
    }

    const points = getExtendedPoints(facility);

    return (
        <PublicLayout>
            <Head title={facility.title} />

            <section className="px-4 py-8 lg:px-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <article className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#16171b]">
                        <div className="grid gap-0 xl:grid-cols-[1.05fr_0.95fr]">
                            <div className="relative min-h-[22rem] overflow-hidden">
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
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                <div className="absolute bottom-5 left-5 right-5 text-white">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] backdrop-blur">
                                            {facility.category}
                                        </span>
                                        <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] backdrop-blur">
                                            {facility.capacity}
                                        </span>
                                    </div>

                                    <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                                        {facility.title}
                                    </h1>
                                </div>
                            </div>

                            <div className="space-y-5 p-6">
                                <p className="text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                                    {facility.shortDescription}
                                </p>

                                <div className="rounded-[1.4rem] bg-[#f7f2e8] p-4 dark:bg-[#1d1e23]">
                                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#174f40] dark:text-[#9dc0ff]">
                                        Space Overview
                                    </p>
                                    <p className="mt-2 text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                                        {facility.summary}
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-[1.2rem] border border-black/10 p-4 dark:border-white/10">
                                        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#174f40] dark:text-[#9dc0ff]">
                                            <LayoutGrid className="h-4 w-4" />
                                            Category
                                        </p>
                                        <p className="mt-2 text-sm text-[#595651] dark:text-[#c8c8ce]">
                                            {facility.category}
                                        </p>
                                    </div>

                                    <div className="rounded-[1.2rem] border border-black/10 p-4 dark:border-white/10">
                                        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#174f40] dark:text-[#9dc0ff]">
                                            <Users className="h-4 w-4" />
                                            Capacity / Type
                                        </p>
                                        <p className="mt-2 text-sm text-[#595651] dark:text-[#c8c8ce]">
                                            {facility.capacity}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white dark:bg-[#2d47ff]"
                                    >
                                        Contact for Inquiry
                                    </Link>
                                    <Link
                                        href="/calendar"
                                        className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold dark:border-white/10"
                                    >
                                        <CalendarDays className="h-4 w-4" />
                                        Check Calendar
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </article>

                    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                        <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#16171b]">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                                Recommended Use
                            </p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight">
                                Key points for this venue space
                            </h2>

                            <div className="mt-5 space-y-3">
                                {points.map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-start gap-3 rounded-[1.2rem] bg-[#f7f2e8] p-4 dark:bg-[#1d1e23]"
                                    >
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#174f40] dark:text-[#9dc0ff]" />
                                        <p className="text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                                            {item}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#16171b]">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                                Venue Notes
                            </p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight">
                                Public information page
                            </h2>

                            <div className="mt-5 space-y-4 text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                                <p>
                                    This page is intended to help users understand the space before they proceed to inquiry,
                                    availability checking, or formal booking coordination.
                                </p>

                                <div className="rounded-[1.4rem] bg-[#f7f2e8] p-4 dark:bg-[#1d1e23]">
                                    <p className="flex items-start gap-2">
                                        <MapPin className="mt-1 h-4 w-4 shrink-0" />
                                        Final layouts, operating conditions, and exact configuration remain subject to venue
                                        approval, event type, and scheduling validation.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#16171b]">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                                    Related Spaces
                                </p>
                                <h2 className="mt-2 text-2xl font-black tracking-tight">
                                    Continue exploring other venue areas
                                </h2>
                            </div>

                            <Link
                                href="/facilities"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-[#174f40] dark:text-[#9dc0ff]"
                            >
                                Back to all facilities
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {relatedFacilities.map((item) => (
                                <Link
                                    key={item.slug}
                                    href={`/facilities/${item.slug}`}
                                    className="overflow-hidden rounded-[1.8rem] border border-black/10 bg-[#fbf8f2] transition hover:-translate-y-1 hover:shadow-sm dark:border-white/10 dark:bg-[#1d1e23]"
                                >
                                    <div className="h-44 overflow-hidden">
                                        <img
                                            src={item.lightImage}
                                            alt={item.title}
                                            className="h-full w-full object-cover dark:hidden"
                                        />
                                        <img
                                            src={item.darkImage}
                                            alt={item.title}
                                            className="hidden h-full w-full object-cover dark:block"
                                        />
                                    </div>

                                    <div className="space-y-3 p-4">
                                        <span className="inline-flex rounded-full bg-[#e8f2ee] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#174f40] dark:bg-[#18231f] dark:text-[#9dc0ff]">
                                            {item.category}
                                        </span>
                                        <h3 className="text-xl font-black tracking-tight">{item.title}</h3>
                                        <p className="text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                                            {item.shortDescription}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </section>
        </PublicLayout>
    );
}
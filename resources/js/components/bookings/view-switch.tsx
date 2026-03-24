import { Link } from '@inertiajs/react';

type BookingViewSwitchProps = {
    showBackend?: boolean;
    backendHref?: string;
};

export default function BookingViewSwitch({
    showBackend = true,
    backendHref = '/dashboard',
}: BookingViewSwitchProps) {
    return (
        <div className="mb-4 flex flex-wrap items-center gap-2">
            <Link
                href="/"
                className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-[#174f40] transition hover:bg-[#eef4f1] dark:border-white/10 dark:bg-[#17181c] dark:text-[#9dc0ff] dark:hover:bg-[#1d2330]"
            >
                Frontend Design
            </Link>

            {showBackend ? (
                <Link
                    href={backendHref}
                    className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-[#1f1f1c] transition hover:bg-[#f4ede1] dark:border-white/10 dark:bg-[#17181c] dark:text-white dark:hover:bg-[#26272d]"
                >
                    Backend Design
                </Link>
            ) : null}
        </div>
    );
}

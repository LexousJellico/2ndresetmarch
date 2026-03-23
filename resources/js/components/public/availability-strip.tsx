import { type FormEvent, useState } from 'react';
import { CalendarRange, CircleAlert, LayoutGrid, Tag, Users, X } from 'lucide-react';

type VenueOption = {
    label: string;
    value: string;
};

type AvailabilityStatus = 'available' | 'public_booked' | 'private_booked' | 'blocked';

type AvailabilityResult = {
    status: AvailabilityStatus;
    title: string;
    description: string;
    note: string;
};

function getCsrfToken() {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content')
            ?.trim() ?? ''
    );
}

async function parseResponse(response: Response) {
    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
        return response.json();
    }

    const text = await response.text();

    try {
        return JSON.parse(text);
    } catch {
        return { message: text || 'Unexpected response.' };
    }
}

function statusCardClasses(status: AvailabilityStatus) {
    switch (status) {
        case 'private_booked':
            return {
                badge: 'bg-[#b48a1f] text-white',
                label: 'Gold • Private / Fully Booked',
            };
        case 'public_booked':
            return {
                badge: 'bg-[#1d5bd8] text-white',
                label: 'Blue • Government / Public Event',
            };
        case 'blocked':
            return {
                badge: 'bg-[#c53434] text-white',
                label: 'Red • Blocked / Unavailable',
            };
        default:
            return {
                badge: 'bg-[#174f40] text-white dark:bg-[#2d47ff]',
                label: 'Neutral • Available',
            };
    }
}

const eventTypeOptions = [
    'Conference',
    'Convention',
    'Seminar',
    'Exhibit',
    'Wedding',
    'Cultural Program',
    'Community Event',
    'Government Event',
    'Private Event',
];

export default function AvailabilityStrip({ venueOptions }: { venueOptions: VenueOption[] }) {
    const [date, setDate] = useState('');
    const [venue, setVenue] = useState('');
    const [eventType, setEventType] = useState('');
    const [guests, setGuests] = useState('');
    const [result, setResult] = useState<AvailabilityResult | null>(null);
    const [open, setOpen] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!date || !venue || !eventType || !guests) {
            setValidationMessage('Please complete date, venue, event type, and guest count first.');
            return;
        }

        setValidationMessage('');
        setLoading(true);

        try {
            const response = await fetch('/public/availability-check', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    date,
                    venue,
                    event_type: eventType,
                    guests: Number(guests),
                }),
            });

            const payload = await parseResponse(response);

            if (!response.ok) {
                setValidationMessage(payload?.message ?? 'Unable to check availability right now.');
                return;
            }

            setResult(payload as AvailabilityResult);
            setOpen(true);
        } catch {
            setValidationMessage('Unable to check availability right now.');
        } finally {
            setLoading(false);
        }
    };

    const statusUi = result ? statusCardClasses(result.status) : null;

    return (
        <section className="px-4 lg:px-6">
            <div className="mx-auto max-w-7xl">
                <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/90 shadow-[0_16px_60px_rgba(0,0,0,0.08)] backdrop-blur dark:border-white/10 dark:bg-[#16171b]/90">
                    <div className="border-b border-black/10 px-6 py-5 dark:border-white/10">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                            Check Availability
                        </p>
                        <p className="mt-2 max-w-3xl text-sm leading-7 text-[#5a5853] dark:text-[#c9c9cf]">
                            Select your target date, venue, event type, and estimated guest count. The result will be shown in a backend-driven popup summary.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid gap-4 px-6 py-6 lg:grid-cols-[1.2fr_1fr_1fr_0.8fr_auto]">
                        <label className="rounded-2xl border border-black/10 bg-[#f7f2e8] px-4 py-3 dark:border-white/10 dark:bg-[#1c1d22]">
                            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6a665f] dark:text-[#a8a8b0]">
                                <CalendarRange className="h-4 w-4" />
                                Event Date
                            </span>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="mt-2 w-full bg-transparent text-sm font-semibold outline-none"
                            />
                        </label>

                        <label className="rounded-2xl border border-black/10 bg-[#f7f2e8] px-4 py-3 dark:border-white/10 dark:bg-[#1c1d22]">
                            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6a665f] dark:text-[#a8a8b0]">
                                <LayoutGrid className="h-4 w-4" />
                                Venue
                            </span>
                            <select
                                value={venue}
                                onChange={(e) => setVenue(e.target.value)}
                                className="mt-2 w-full bg-transparent text-sm font-semibold outline-none"
                            >
                                <option value="">Select venue</option>
                                {venueOptions.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="rounded-2xl border border-black/10 bg-[#f7f2e8] px-4 py-3 dark:border-white/10 dark:bg-[#1c1d22]">
                            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6a665f] dark:text-[#a8a8b0]">
                                <Tag className="h-4 w-4" />
                                Event Type
                            </span>
                            <select
                                value={eventType}
                                onChange={(e) => setEventType(e.target.value)}
                                className="mt-2 w-full bg-transparent text-sm font-semibold outline-none"
                            >
                                <option value="">Select type</option>
                                {eventTypeOptions.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="rounded-2xl border border-black/10 bg-[#f7f2e8] px-4 py-3 dark:border-white/10 dark:bg-[#1c1d22]">
                            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6a665f] dark:text-[#a8a8b0]">
                                <Users className="h-4 w-4" />
                                Guests
                            </span>
                            <input
                                type="number"
                                min="1"
                                value={guests}
                                onChange={(e) => setGuests(e.target.value)}
                                placeholder="Estimated count"
                                className="mt-2 w-full bg-transparent text-sm font-semibold outline-none"
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center rounded-[1.4rem] bg-[#174f40] px-6 py-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 disabled:opacity-60 dark:bg-[#2d47ff]"
                        >
                            {loading ? 'Checking...' : 'Check Availability'}
                        </button>
                    </form>

                    {validationMessage && (
                        <div className="px-6 pb-6">
                            <div className="flex items-start gap-3 rounded-2xl border border-[#d79b2f]/40 bg-[#fff5de] px-4 py-3 text-sm text-[#7b5a1f] dark:border-[#d79b2f]/30 dark:bg-[#2b2418] dark:text-[#f1d18c]">
                                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{validationMessage}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {open && result && statusUi && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 px-4">
                    <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl dark:bg-[#15161a]">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusUi.badge}`}>
                                    {statusUi.label}
                                </span>
                                <h3 className="mt-3 text-2xl font-black tracking-tight">{result.title}</h3>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 dark:border-white/10"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="mt-5 text-sm leading-7 text-[#55514b] dark:text-[#c7c7cd]">{result.description}</p>

                        <div className="mt-4 rounded-[1.25rem] border border-black/10 bg-[#faf8f3] px-4 py-3 text-sm text-[#5d5a55] dark:border-white/10 dark:bg-[#1b1c20] dark:text-[#c7c7cd]">
                            {result.note}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white dark:bg-[#2d47ff]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
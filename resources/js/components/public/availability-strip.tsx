import { type FormEvent, useMemo, useState } from 'react';
import { CalendarRange, CircleAlert, Clock3, LayoutGrid, Users } from 'lucide-react';

type VenueOption = {
    label: string;
    value: string;
    category?: string | null;
    capacity?: string | null;
};

type AvailabilityStatus =
    | 'available'
    | 'limited'
    | 'public_booked'
    | 'private_booked'
    | 'blocked';

type AvailabilityBlock = {
    key?: string;
    label?: string;
    from?: string;
    to?: string;
    is_available?: boolean;
};

type AvailabilityResult = {
    date: string;
    venue: string;
    status: AvailabilityStatus;
    title: string;
    description: string;
    note: string;
    blocks?: Record<string, AvailabilityBlock>;
    event_titles?: string[];
};

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

function statusUi(status: AvailabilityStatus) {
    switch (status) {
        case 'limited':
            return {
                badge: 'bg-[#c58b16] text-white',
                card: 'border-[#f1d49a] bg-[#fff9ef] dark:border-[#7a5b1d] dark:bg-[#241d12]',
                label: 'Limited Availability',
            };
        case 'public_booked':
            return {
                badge: 'bg-[#1d5bd8] text-white',
                card: 'border-[#cfe0ff] bg-[#f4f8ff] dark:border-[#294984] dark:bg-[#131d32]',
                label: 'Public Event',
            };
        case 'private_booked':
            return {
                badge: 'bg-[#b48a1f] text-white',
                card: 'border-[#ecdba5] bg-[#fffaf0] dark:border-[#6e5721] dark:bg-[#241f12]',
                label: 'Private / Fully Booked',
            };
        case 'blocked':
            return {
                badge: 'bg-[#c53434] text-white',
                card: 'border-[#f2c8c8] bg-[#fff6f6] dark:border-[#6e2a2a] dark:bg-[#241414]',
                label: 'Blocked / Unavailable',
            };
        default:
            return {
                badge: 'bg-[#174f40] text-white dark:bg-[#2d47ff]',
                card: 'border-[#cfe4dc] bg-[#f6fbf9] dark:border-[#314857] dark:bg-[#141920]',
                label: 'Available',
            };
    }
}

export default function AvailabilityStrip({ venueOptions }: { venueOptions: VenueOption[] }) {
    const [date, setDate] = useState('');
    const [venue, setVenue] = useState('');
    const [eventType, setEventType] = useState('');
    const [guests, setGuests] = useState('');
    const [result, setResult] = useState<AvailabilityResult | null>(null);
    const [validationMessage, setValidationMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const hasVenueOptions = venueOptions.length > 0;

    const selectedVenueMeta = useMemo(
        () => venueOptions.find((item) => item.value === venue) ?? null,
        [venue, venueOptions],
    );
        
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!date || !venue || !eventType || !guests) {
            setValidationMessage('Please complete the date, venue, event type, and guest count first.');
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
        } catch {
            setValidationMessage('Unable to check availability right now.');
        } finally {
            setLoading(false);
        }
    };

    const currentStatusUi = result ? statusUi(result.status) : null;

    return (
        <div className="rounded-[2rem] border border-black/10 bg-white/85 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#101217]/90">
            <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                    Check Availability
                </p>
                <h2 className="text-2xl font-black tracking-tight text-[#1f1b16] dark:text-white">
                    Find an open venue date instantly
                </h2>
                <p className="text-sm leading-7 text-[#5b564f] dark:text-[#c8c8ce]">
                    This checker now reads the same availability layer used by the booking side and public calendar.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="rounded-2xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
                        <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#174f40] dark:text-[#9dc0ff]">
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

                    <label className="rounded-2xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
                        <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#174f40] dark:text-[#9dc0ff]">
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

                    <label className="rounded-2xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
                        <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#174f40] dark:text-[#9dc0ff]">
                            <Clock3 className="h-4 w-4" />
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

                    <label className="rounded-2xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
                        <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#174f40] dark:text-[#9dc0ff]">
                            <Users className="h-4 w-4" />
                            Guests
                        </span>
                        <input
                            type="number"
                            min={1}
                            value={guests}
                            onChange={(e) => setGuests(e.target.value)}
                            placeholder="Estimated guest count"
                            className="mt-2 w-full bg-transparent text-sm font-semibold outline-none"
                        />
                    </label>
                </div>

                {selectedVenueMeta ? (
                    <div className="rounded-2xl border border-dashed border-black/10 bg-[#faf8f3] px-4 py-3 text-xs text-[#5b564f] dark:border-white/10 dark:bg-white/5 dark:text-[#c8c8ce]">
                        <span className="font-bold text-[#174f40] dark:text-[#9dc0ff]">
                            {selectedVenueMeta.label}
                        </span>
                        {selectedVenueMeta.category ? ` • ${selectedVenueMeta.category}` : ''}
                        {selectedVenueMeta.capacity ? ` • Capacity: ${selectedVenueMeta.capacity}` : ''}
                    </div>
                ) : null}

                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#2d47ff]"
                >
                    {loading ? 'Checking...' : 'Check Availability'}
                </button>

                {validationMessage ? (
                    <div className="rounded-2xl border border-[#f1c3c3] bg-[#fff5f5] px-4 py-3 text-sm text-[#9a2f2f] dark:border-[#6e2a2a] dark:bg-[#241414] dark:text-[#ffbcbc]">
                        <div className="flex items-start gap-2">
                            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{validationMessage}</span>
                        </div>
                    </div>
                ) : null}
            </form>

            {result && currentStatusUi ? (
                <div className={`mt-5 rounded-[1.6rem] border p-5 ${currentStatusUi.card}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${currentStatusUi.badge}`}>
                                {currentStatusUi.label}
                            </span>
                            <h3 className="mt-3 text-xl font-black text-[#1f1b16] dark:text-white">
                                {result.title}
                            </h3>
                            <p className="mt-2 text-sm leading-7 text-[#5b564f] dark:text-[#c8c8ce]">
                                {result.description}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-xs font-semibold dark:border-white/10 dark:bg-white/5">
                            <p>{result.date}</p>
                            <p className="mt-1">{result.venue}</p>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {Object.entries(result.blocks ?? {}).map(([key, block]) => (
                            <div
                                key={key}
                                className={`rounded-2xl border px-4 py-3 text-sm ${
                                    block.is_available
                                        ? 'border-[#cfe4dc] bg-white/85 dark:border-[#314857] dark:bg-white/5'
                                        : 'border-[#f0d8a2] bg-[#fff8e8] dark:border-[#6e5721] dark:bg-[#241f12]'
                                }`}
                            >
                                <p className="font-black uppercase tracking-[0.12em] text-[#174f40] dark:text-[#9dc0ff]">
                                    {block.label ?? key}
                                </p>
                                <p className="mt-1 text-xs text-[#5b564f] dark:text-[#c8c8ce]">
                                    {(block.from ?? '--:--')} - {(block.to ?? '--:--')}
                                </p>
                                <p className="mt-2 font-semibold">
                                    {block.is_available ? 'Available' : 'Unavailable'}
                                </p>
                            </div>
                        ))}
                    </div>

                    {result.event_titles && result.event_titles.length > 0 ? (
                        <div className="mt-4 rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5">
                            <p className="font-black uppercase tracking-[0.12em] text-[#174f40] dark:text-[#9dc0ff]">
                                Public Event Titles
                            </p>
                            <ul className="mt-2 space-y-1 text-[#5b564f] dark:text-[#c8c8ce]">
                                {result.event_titles.map((title) => (
                                    <li key={title}>• {title}</li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    <p className="mt-4 text-sm leading-7 text-[#5b564f] dark:text-[#c8c8ce]">
                        {result.note}
                    </p>
                </div>
            ) : null}
        </div>
    );
}

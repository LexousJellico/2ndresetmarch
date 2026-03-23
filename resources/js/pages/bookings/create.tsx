// resources/js/Pages/bookings/create.tsx
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Service } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Trash2, Search, X, Info } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import bookingsRoutes from '@/routes/bookings';
import { cn } from '@/lib/utils';
import qrFallback from '@/components/logo/qr.png';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Bookings', href: bookingsRoutes.index.url() },
  { title: 'Create', href: bookingsRoutes.create.url() },
];

interface ServiceTypeWithServices {
  id: number;
  name: string;
  services: Service[];
}

type CartItem = { service_id: number; name: string; area: string; price: number; quantity: number };

type TimeSlot = { from: string; to: string };
type BlockKey = 'AM' | 'PM' | 'EVE';

type AvailabilityBlock = {
  key?: string;
  name?: string;
  label?: string;
  from?: string;
  to?: string;
  is_available?: boolean;
  available?: boolean;
};

type DailyAvailability = {
  date: string;
  busy: TimeSlot[];
  free: TimeSlot[];
  blocks?: Record<string, AvailabilityBlock> | AvailabilityBlock[];
  is_fully_booked?: boolean;
};

interface CreateBookingProps {
  serviceTypes: ServiceTypeWithServices[];
  unavailableDates: string[];
  initialSchedule?: {
    date?: string | null;
    start_time?: string | null;
    end_time?: string | null;
  };
}

const BLOCK_ORDER: BlockKey[] = ['AM', 'PM', 'EVE'];

const BLOCK_META: Record<BlockKey, { label: string; time: string }> = {
  AM: { label: 'AM', time: '6:00 AM – 12:00 PM' },
  PM: { label: 'PM', time: '12:00 PM – 6:00 PM' },
  EVE: { label: 'EVE', time: '6:00 PM – 11:59 PM' },
};

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function getLocalTodayStr(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateOnlyLocal(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

// ✅ For popup deadline display
function formatDateTimeLocal(d: Date): string {
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function normalizeTimeToHHMM(time?: string | null): string | null {
  if (!time) return null;
  const m = String(time).match(/^(\d{2}):(\d{2})/);
  if (!m) return null;
  return `${m[1]}:${m[2]}`;
}

function sortBlocks(blocks: BlockKey[]): BlockKey[] {
  return BLOCK_ORDER.filter((b) => blocks.includes(b));
}

/**
 * Only allow these valid combos:
 * [AM], [PM], [EVE], [AM+PM], [PM+EVE], [AM+PM+EVE]
 * If user tries AM + EVE, we auto-complete to AM+PM+EVE when adding,
 * and auto-collapse to AM when removing.
 */
function toggleBlockSelection(prev: BlockKey[], key: BlockKey): BlockKey[] {
  const had = prev.includes(key);
  let next = had ? prev.filter((b) => b !== key) : [...prev, key];
  next = sortBlocks(Array.from(new Set(next)));

  const hasAM = next.includes('AM');
  const hasPM = next.includes('PM');
  const hasEVE = next.includes('EVE');

  if (hasAM && hasEVE && !hasPM) {
    if (!had) {
      next = ['AM', 'PM', 'EVE'];
    } else {
      next = next.filter((b) => b !== 'EVE');
    }
  }

  return sortBlocks(next);
}

function formatTimeLabel(hm: string) {
  const [hStr, mStr] = hm.split(':');
  const h = Number(hStr);
  if (Number.isNaN(h)) return hm;
  const ampm = h >= 12 ? 'PM' : 'AM';
  let displayHour = h % 12;
  if (displayHour === 0) displayHour = 12;
  return `${displayHour}:${mStr} ${ampm}`;
}

function computeRangeFromDateAndBlocks(date: string, blocks: BlockKey[]) {
  if (!date || blocks.length === 0) return null;

  const hasAM = blocks.includes('AM');
  const hasPM = blocks.includes('PM');
  const hasEVE = blocks.includes('EVE');

  const startTime = hasAM ? '06:00' : hasPM ? '12:00' : '18:00';

  // Any range that includes EVE should end at 23:59 on the SAME day.
  let endTime = '12:00';
  let endDate = date;

  if (hasEVE) {
    endTime = '23:59';
    endDate = date;
  } else if (hasPM) {
    endTime = '18:00';
    endDate = date;
  } else {
    endTime = '12:00';
    endDate = date;
  }

  const fromIso = `${date}T${startTime}`;
  const toIso = `${endDate}T${endTime}`;

  let label = blocks.join(' + ');
  if (hasAM && hasPM && !hasEVE) label = 'Whole Day';
  if (!hasAM && hasPM && hasEVE) label = 'Whole Day (PM + EVE)';
  if (hasAM && hasPM && hasEVE) label = 'Whole Day (Until 11:59 PM)';

  const display = `${new Date(`${date}T00:00:00`).toLocaleDateString()} • ${formatTimeLabel(startTime)} – ${formatTimeLabel(endTime)}`;

  return { fromIso, toIso, label, display };
}

function formatIsoRangeDisplay(fromIso: string, toIso: string): string {
  const s = new Date(fromIso);
  const e = new Date(toIso);

  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
    return `${fromIso} → ${toIso}`;
  }

  const sameDay = formatDateOnlyLocal(s) === formatDateOnlyLocal(e);

  const dateLabel = s.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const startTime = s.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const endTime = e.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  if (sameDay) return `${dateLabel} • ${startTime} – ${endTime}`;

  const endDateLabel = e.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  return `${dateLabel} ${startTime} → ${endDateLabel} ${endTime}`;
}

function isBlockAvailable(av: DailyAvailability | null | undefined, key: BlockKey): boolean {
  if (!av || !av.blocks) return true;

  const blocks = av.blocks as any;

  if (Array.isArray(blocks)) {
    const found = blocks.find((b: any) => (b?.key || b?.name || b?.label) === key);
    if (!found) return true;
    const val = found.is_available ?? found.available;
    return typeof val === 'boolean' ? val : true;
  }

  if (typeof blocks === 'object') {
    const found = blocks[key] ?? blocks[key.toLowerCase()];
    if (!found) return true;
    const val = found.is_available ?? found.available;
    return typeof val === 'boolean' ? val : true;
  }

  return true;
}

function BlockButton({
  block,
  selected,
  disabled,
  onClick,
}: {
  block: BlockKey;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={selected ? 'default' : 'outline'}
      disabled={disabled}
      onClick={onClick}
      className={cn('justify-start w-full', disabled && 'opacity-60 cursor-not-allowed')}
      title={disabled ? 'This block is already booked' : 'Select this block'}
    >
      <span className="font-semibold">{BLOCK_META[block].label}</span>
      <span className="ml-2 text-xs text-muted-foreground">{BLOCK_META[block].time}</span>
    </Button>
  );
}

type ExtraRow = {
  date: string;
  blocks: BlockKey[];
};

type ConfirmData = {
  payload: any;
  mainDisplay: string;
  extrasCount: number;
  extraDisplays: string[];
  itemsCount: number;
  itemsTotal: number;
};

// ✅ Popup state
type PencilBookedPopupState = {
  requestedAtIso: string;
  dueAtIso: string;
};

/**
 * ✅ Policies shown in confirmation:
 * Baguio City Ordinance Numbered 41, Series of 2022 — Sections 13–17
 */
const POLICY_SOURCE_LABEL =
  'Ordinance No. 41, Series of 2022 • Sec. 13–17 (Events Booking, Bond, Cancellation, Contract, Outsourced Services)';

const POLICY_KEY_POINTS: string[] = [
  '50% down payment is required to consider the date/venue completely reserved (first-paid, first-reserved).',
  'Balance must be paid before the event; additional charges must be paid within 3 days after billing.',
  '₱10,000.00 bond is required prior to the start of the event for all activities except official City Government activities.',
  'Cancellation fees: 0% (≥2 weeks), 20% (<2 weeks), 30% (<1 week), 75% (within 48 hours or on reserved date).',
  'Outsourced special services must engage BCCC-accredited providers; providers must submit an ingress list at least a day prior (items not listed may be denied entry).',
];

const FULL_POLICY_SECTIONS: Array<{ title: string; bullets: string[] }> = [
  {
    title: 'Event booking (Sec. 13)',
    bullets: [
      'Booking intents from private and government entities must seek approval (online or offline) and comply with the reservation contract.',
      'Temporary reservations are “pencil-booked” pending payment of the down payment.',
      'Fifty percent (50%) down payment must be made to consider date and venue completely reserved, on a first-paid, first-reserved basis.',
      'Balance of full payment must be made prior to the conduct of the event, and additional charges as assessed must be paid within three (3) days after issuing a bill of additional charges.',
      'If an event involves ticket-selling or paid registration, the organizer must comply with City requirements for business/special permits and/or appropriate taxes, as assessed by the City Treasury Office.',
      'Organizer/proponent must provide and declare truthfully all data and information required for post-activity statistics and reporting.',
    ],
  },
  {
    title: 'Bond / deposit (Sec. 14)',
    bullets: [
      'A bond deposit of Ten Thousand Pesos (₱10,000.00) is required prior to the start of the event for all activities except official City Government activities.',
      'The bond deposit is returned upon the final billing of additional charges; it may be used to pay additional charges incurred after the event.',
    ],
  },
  {
    title: 'Cancellation of reservations (Sec. 15)',
    bullets: [
      'Cancellation made at least two (2) weeks prior to the reserved date: no charges.',
      'Cancellation made later than two (2) weeks prior: 20% of total rental fees.',
      'Cancellation made after one (1) week prior: 30% of total rental fees.',
      'Cancellation made within forty-eight (48) hours before the reserved date or on the reserved date itself: 75% of total rental fees.',
    ],
  },
  {
    title: 'Contract (Sec. 16)',
    bullets: ['All activities involving the rentable areas shall be covered by a written contract.'],
  },
  {
    title: 'Outsourced services for facility usage (Sec. 17)',
    bullets: [
      'Organizers who need to outsource special services must engage and avail of services of BCCC accredited providers only (e.g., catering, technical riders/services, stage & hall set-up & styling/decoration, event management, multimedia documentation).',
      'Service providers must comply with government requirements and conform to standards set by BCCC (accreditation process approved by the City Mayor).',
      'Service providers must submit a list of materials, equipment and personnel for ingress at least a day prior to the event; items not on the list may not be allowed to enter or be brought in the premises.',
      'Staff personnel of the provider must adhere to house rules at all times and be dressed appropriately (proper uniform and with IDs).',
    ],
  },
];

// Normalizes a url coming from backend:
// - keeps absolute URLs, data/blob, and leading-slash URLs
// - adds a leading "/" for relative paths like "storage/..." so they resolve correctly
function normalizeAssetUrl(url: string): string {
  const u = String(url || '').trim();
  if (!u) return u;
  if (/^(https?:\/\/|data:|blob:|\/)/i.test(u)) return u;
  return `/${u}`;
}

/**
 * ✅ FIX: Service type + service placement/order in "Select Services"
 * Order of TYPES:
 * 1) FULL HALL
 * 2) MAIN HALL
 * 3) LED WALL
 * 4) LOUNGE
 * 5) BOARDROOM
 * 6) ADDITIONALS (always last)
 *
 * Order of SERVICES inside each type:
 * 1) Whole Day
 * 2) Half Day
 * 3) Additional Hours
 */
function normalizeKey(str: string): string {
  return String(str || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
}

function getServiceTypeRank(typeName: string): number {
  const n = normalizeKey(typeName);

  // Always keep "ADDITIONALS" last (even if other unknown types exist)
  if (n.includes('ADDITIONAL') || n.includes('ADD-ON') || n.includes('ADD ON') || n.includes('ADDONS') || n.includes('ADD ONS')) return 1000;

  if (n.includes('FULL HALL')) return 0;
  if (n.includes('MAIN HALL')) return 1;
  if (n.includes('LED WALL') || n.includes('LEDWALL')) return 2;
  if (n.includes('LOUNGE')) return 3;
  if (n.includes('BOARDROOM') || n.includes('BOARD ROOM')) return 4;

  // Unknown types go after known halls, but before ADDITIONALS
  return 900;
}

function getServiceRank(serviceName: string): number {
  const n = normalizeKey(serviceName);

  // Whole day first, then half day, then additional hours
  if (n.includes('WHOLE DAY') || n.includes('FULL DAY')) return 0;
  if (n.includes('HALF DAY')) return 1;
  if (n.includes('ADDITIONAL HOUR')) return 2;

  // Anything else goes after the main three options
  return 50;
}

export default function CreateBooking({ serviceTypes, initialSchedule }: CreateBookingProps) {
  const { auth, survey } = usePage().props as any;

  // Supports both shapes:
  // - auth.roles (array of role objects/strings)
  // - auth.user.roles (array of role objects/strings)
  const rawRoles = (auth?.roles ?? auth?.user?.roles ?? []) as any[];
  const roleNames: string[] = Array.isArray(rawRoles)
    ? rawRoles.map((r: any) => (typeof r === 'string' ? r : r?.name)).filter(Boolean)
    : [];

  const isClient = roleNames.includes('user');
  const isAdmin = roleNames.includes('admin');

  // ✅ Auto-fill ONLY the "Client Email" field for clients (NOT the survey email)
  const authUserEmail = String(auth?.user?.email ?? auth?.email ?? '').trim();

  const todayStr = getLocalTodayStr();

  const { data, setData, post, processing, errors, transform } = useForm<any>({
    service_id: '',
    company_name: '',
    client_name: '',
    client_contact_number: '',
    client_email: isClient && authUserEmail ? authUserEmail : '',
    // ✅ Survey email stays manual
    survey_email: isClient && authUserEmail ? authUserEmail : '',
    survey_proof_image: null,
    client_address: '',
    head_of_organization: '',
    type_of_event: '',
    booking_date_from: '',
    booking_date_to: '',
    number_of_guests: '',
    booking_status: 'pending',
  });

  // ✅ Keep client_email synced to account email for clients (survey_email untouched)
  useEffect(() => {
    if (!isClient) return;
    if (!authUserEmail) return;
    if (data.client_email !== authUserEmail) setData('client_email', authUserEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, authUserEmail, data.client_email]);

  // Survey proof preview
  const surveyProofFile = (data?.survey_proof_image ?? null) as File | null;
  const [surveyProofPreviewUrl, setSurveyProofPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!surveyProofFile) {
      setSurveyProofPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(surveyProofFile);
    setSurveyProofPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [surveyProofFile]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<ConfirmData | null>(null);

  // Terms/Policies + nested policy modal inside confirmation
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [policiesOpen, setPoliciesOpen] = useState(false);

  // ✅ Notice block should be OPEN by default (but still closable)
  const [noticeOpen, setNoticeOpen] = useState(true);

  // ✅ SUCCESS POPUP (Pencil-booked notice) - auto closes after 5 seconds unless X is clicked
  const [pencilBookedPopup, setPencilBookedPopup] = useState<PencilBookedPopupState | null>(null);
  const pencilBookedTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  const closePencilBookedPopup = () => {
    if (pencilBookedTimerRef.current) {
      window.clearTimeout(pencilBookedTimerRef.current);
      pencilBookedTimerRef.current = null;
    }
    setPencilBookedPopup(null);
  };

  const openPencilBookedPopup = (requestedAt: Date) => {
    const dueAt = new Date(requestedAt.getTime() + 24 * 60 * 60 * 1000); // +24 hours

    setPencilBookedPopup({
      requestedAtIso: requestedAt.toISOString(),
      dueAtIso: dueAt.toISOString(),
    });

    if (pencilBookedTimerRef.current) {
      window.clearTimeout(pencilBookedTimerRef.current);
      pencilBookedTimerRef.current = null;
    }

    pencilBookedTimerRef.current = window.setTimeout(() => {
      setPencilBookedPopup(null);
      pencilBookedTimerRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (pencilBookedTimerRef.current) {
        window.clearTimeout(pencilBookedTimerRef.current);
        pencilBookedTimerRef.current = null;
      }
    };
  }, []);

  const cartTotals = useMemo(() => {
    const itemsTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const itemsCount = cart.reduce((sum, i) => sum + i.quantity, 0);
    return { itemsTotal, itemsCount };
  }, [cart]);

  // Schedule state
  const [bookingDate, setBookingDate] = useState<string>(initialSchedule?.date ?? '');
  const [selectedBlocks, setSelectedBlocks] = useState<BlockKey[]>(() => {
    const s = normalizeTimeToHHMM(initialSchedule?.start_time ?? null);
    const eRaw = normalizeTimeToHHMM(initialSchedule?.end_time ?? null);
    const e = eRaw === '00:00' ? '23:59' : eRaw;

    if (!initialSchedule?.date || !s || !e) return [];

    if (s === '06:00' && e === '12:00') return ['AM'];
    if (s === '12:00' && e === '18:00') return ['PM'];
    if (s === '18:00' && e === '23:59') return ['EVE'];
    if (s === '06:00' && e === '18:00') return ['AM', 'PM'];
    if (s === '12:00' && e === '23:59') return ['PM', 'EVE'];
    if (s === '06:00' && e === '23:59') return ['AM', 'PM', 'EVE'];
    return [];
  });

  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Availability cache per date
  const [availabilityCache, setAvailabilityCache] = useState<Record<string, DailyAvailability>>({});
  const [loadingDates, setLoadingDates] = useState<Record<string, boolean>>({});
  const [availabilityErrors, setAvailabilityErrors] = useState<Record<string, string | null>>({});

  const fetchAvailabilityFor = async (dateStr: string): Promise<DailyAvailability | null> => {
    if (!dateStr) return null;

    if (availabilityCache[dateStr]) return availabilityCache[dateStr];

    setLoadingDates((p) => ({ ...p, [dateStr]: true }));
    setAvailabilityErrors((p) => ({ ...p, [dateStr]: null }));

    try {
      const res = await fetch(`/bookings/availability?date=${encodeURIComponent(dateStr)}`);
      if (!res.ok) throw new Error('Failed to load availability');
      const json = (await res.json()) as DailyAvailability;
      setAvailabilityCache((p) => ({ ...p, [dateStr]: json }));
      return json;
    } catch {
      setAvailabilityErrors((p) => ({ ...p, [dateStr]: 'Unable to load availability for this date.' }));
      return null;
    } finally {
      setLoadingDates((p) => ({ ...p, [dateStr]: false }));
    }
  };

  const mainAvailability = bookingDate ? availabilityCache[bookingDate] : null;

  useEffect(() => {
    if (!bookingDate) return;
    fetchAvailabilityFor(bookingDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingDate]);

  useEffect(() => {
    setScheduleError(null);

    if (!bookingDate || selectedBlocks.length === 0) {
      setData('booking_date_from', '');
      setData('booking_date_to', '');
      return;
    }

    const range = computeRangeFromDateAndBlocks(bookingDate, selectedBlocks);
    if (!range) return;

    if (mainAvailability) {
      const bad = selectedBlocks.filter((b) => !isBlockAvailable(mainAvailability, b));
      if (bad.length > 0) {
        setScheduleError(`Some selected blocks are not available (${bad.join(', ')}). Please choose another block or another date.`);
        return;
      }
    }

    setData('booking_date_from', range.fromIso);
    setData('booking_date_to', range.toIso);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingDate, selectedBlocks, mainAvailability]);

  // Additional schedules
  const [extraSchedules, setExtraSchedules] = useState<ExtraRow[]>([]);

  const addScheduleRow = () => setExtraSchedules((prev) => [...prev, { date: '', blocks: [] }]);
  const removeScheduleRow = (idx: number) => setExtraSchedules((prev) => prev.filter((_, i) => i !== idx));

  const updateExtraDate = async (idx: number, dateStr: string) => {
    setExtraSchedules((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], date: dateStr };
      return copy;
    });

    if (dateStr) await fetchAvailabilityFor(dateStr);
  };

  const toggleExtraBlock = (idx: number, block: BlockKey) => {
    setExtraSchedules((prev) => {
      const copy = [...prev];
      const row = copy[idx];
      if (!row) return prev;
      copy[idx] = { ...row, blocks: toggleBlockSelection(row.blocks, block) };
      return copy;
    });
  };

  /**
   * ✅ FIXED ORDERING HERE:
   * - Sort service TYPES: FULL HALL → MAIN HALL → LED WALL → LOUNGE → BOARDROOM → ADDITIONALS
   * - Sort SERVICES inside each type: Whole Day → Half Day → Additional Hours
   * - Preserve original DB order for ties / other services
   */
  const filteredServiceTypes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const selectedIds = new Set(cart.map((c) => c.service_id));

    return (
      serviceTypes
        // keep original index for stable ordering on ties
        .map((type, typeIndex) => {
          const services = (type.services ?? [])
            .map((s, idx) => ({ s, idx }))
            .filter(({ s }) => {
              if (selectedIds.has(s.id)) return false;
              if (!query) return true;

              const name = String(s.name ?? '').toLowerCase();
              const desc = String(s.description ?? '').toLowerCase();
              return name.includes(query) || desc.includes(query);
            })
            .sort((a, b) => {
              const ra = getServiceRank(a.s.name);
              const rb = getServiceRank(b.s.name);
              if (ra !== rb) return ra - rb;
              return a.idx - b.idx; // preserve original order on ties
            })
            .map(({ s }) => s);

          return { type, typeIndex, services };
        })
        .filter((x) => x.services.length > 0)
        .sort((a, b) => {
          const ra = getServiceTypeRank(a.type.name);
          const rb = getServiceTypeRank(b.type.name);
          if (ra !== rb) return ra - rb;
          return a.typeIndex - b.typeIndex; // preserve original order on ties
        })
        .map(({ type, services }) => ({ ...type, services }))
    );
  }, [serviceTypes, searchQuery, cart]);

  const buildSubmission = (): { ok: true; built: ConfirmData } | { ok: false; error: string } => {
    if (!bookingDate) return { ok: false, error: 'Please select a booking date.' };
    if (selectedBlocks.length === 0) return { ok: false, error: 'Please select AM, PM, or EVE (you can select multiple).' };
    if (cart.length === 0) return { ok: false, error: 'Please add at least one service before creating a booking.' };

    // Survey required
    if (!data.survey_email || String(data.survey_email).trim().length === 0) {
      return { ok: false, error: 'Please enter the email you used for the Google Survey.' };
    }
    if (!data.survey_proof_image) {
      return { ok: false, error: 'Please upload an image proof that you have completed the Google Survey.' };
    }

    const mainRange = computeRangeFromDateAndBlocks(bookingDate, selectedBlocks);
    if (!mainRange) return { ok: false, error: 'Invalid schedule selection. Please try again.' };

    if (mainAvailability) {
      const bad = selectedBlocks.filter((b) => !isBlockAvailable(mainAvailability, b));
      if (bad.length > 0) {
        return {
          ok: false,
          error: `Some selected blocks are not available (${bad.join(', ')}). Please choose another block or another date.`,
        };
      }
    }

    const extrasPayload = extraSchedules
      .map((row, idx) => {
        if (!row.date && row.blocks.length === 0) return null;
        if (!row.date) return { error: `Extra schedule row ${idx + 1}: please select a date.` };
        if (row.blocks.length === 0) return { error: `Extra schedule row ${idx + 1}: please select AM/PM/EVE.` };

        const range = computeRangeFromDateAndBlocks(row.date, row.blocks);
        if (!range) return { error: `Extra schedule row ${idx + 1}: invalid selection.` };

        const av = availabilityCache[row.date];
        if (av) {
          const bad = row.blocks.filter((b) => !isBlockAvailable(av, b));
          if (bad.length > 0) return { error: `Extra schedule row ${idx + 1}: block(s) not available (${bad.join(', ')}).` };
        }

        return { from: range.fromIso, to: range.toIso };
      })
      .filter(Boolean) as Array<any>;

    const firstError = extrasPayload.find((x) => x?.error)?.error;
    if (firstError) return { ok: false, error: firstError };

    const payload = {
      ...data,
      service_id: null,
      booking_date_from: mainRange.fromIso,
      booking_date_to: mainRange.toIso,
      number_of_guests: data.number_of_guests === '' ? '' : Number(data.number_of_guests),
      items: cart.map((ci) => ({ service_id: ci.service_id, quantity: ci.quantity })),
      extra_schedules: extrasPayload.filter((x) => x?.from && x?.to).map((x) => ({ from: x.from, to: x.to })),
    };

    const extraDisplays = (payload.extra_schedules as Array<{ from: string; to: string }>).map((x) =>
      formatIsoRangeDisplay(x.from, x.to),
    );

    return {
      ok: true,
      built: {
        payload,
        mainDisplay: mainRange.display,
        extrasCount: payload.extra_schedules.length,
        extraDisplays,
        itemsCount: cartTotals.itemsCount,
        itemsTotal: cartTotals.itemsTotal,
      },
    };
  };

  const onAttemptSubmit = (e: FormEvent) => {
    e.preventDefault();
    setScheduleError(null);

    const res = buildSubmission();
    if (!res.ok) {
      setScheduleError(res.error);
      return;
    }

    // Reset confirmation controls every time we open it
    setTermsAccepted(false);
    setTermsError(null);
    setPoliciesOpen(false);

    setConfirmData(res.built);
    setConfirmOpen(true);
  };

  const onConfirmSubmit = () => {
    if (!confirmData) return;

    if (!termsAccepted) {
      setTermsError('Please read and accept the policies/terms before submitting.');
      return;
    }

    setConfirmOpen(false);

    // ✅ booking request time (used for +24 hours deadline)
    const requestedAt = new Date();

    // Pencil-booked is your "pending" status
    const isPencilBooked = String(confirmData?.payload?.booking_status ?? 'pending').toLowerCase() === 'pending';

    transform(() => confirmData.payload);

    post('/bookings', {
      forceFormData: true,
      onSuccess: () => {
        // ✅ show the notice for 5 seconds (only if pending/pencil-booked)
        if (isPencilBooked) openPencilBookedPopup(requestedAt);
      },
    });
  };

  // Auto-fit grids (responsive inside the card width)
  const gridAuto2 = 'grid gap-4 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]';
  const gridAuto3 = 'grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]';

  const surveyProofName =
    data.survey_proof_image && typeof data.survey_proof_image === 'object' && 'name' in (data.survey_proof_image as any)
      ? String((data.survey_proof_image as File).name)
      : data.survey_proof_image
        ? 'Attached'
        : '—';

  // ✅ QR handling (robust):
  // - Try backend qr_image_url first
  // - If it fails to load, fall back to imported local qrFallback
  // - If fallback fails (very rare), show "QR unavailable"
  const surveyQrUrl = survey?.qr_image_url ? normalizeAssetUrl(String(survey.qr_image_url)) : null;

  type QrStage = 'remote' | 'fallback' | 'none';
  const [qrStage, setQrStage] = useState<QrStage>(() => (surveyQrUrl ? 'remote' : 'fallback'));

  useEffect(() => {
    setQrStage(surveyQrUrl ? 'remote' : 'fallback');
  }, [surveyQrUrl]);

  const qrSrc = qrStage === 'remote' ? surveyQrUrl : qrStage === 'fallback' ? qrFallback : null;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Booking" />

      {/* ✅ POPUP NOTICE (auto-close 5s unless X clicked) */}
      {pencilBookedPopup && (
        <div className="fixed inset-x-0 top-4 z-[80] flex justify-center px-4" role="status" aria-live="polite">
          <div className="w-full max-w-xl rounded-lg border bg-background shadow-lg">
            <div className="flex items-start gap-3 p-4">
              <div className="mt-0.5 rounded-full bg-emerald-600/10 p-2">
                <Info className="h-5 w-5 text-emerald-600" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-base font-extrabold leading-tight">SUCCESS!</div>
                <div className="text-sm font-semibold leading-tight">YOUR BOOKING IS PENCIL BOOKED FOR 24 HRS...</div>

                <div className="mt-3 text-sm leading-snug">
                  <div className="flex items-start gap-2">
                    <Info className="mt-[2px] h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">
                        KINDLY SETLE YOUR PAYMENT ON OR BEFORE{' '}
                        <span className="underline underline-offset-2">
                          {formatDateTimeLocal(new Date(pencilBookedPopup.dueAtIso))}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Automatic declined status on the booking if not been accomplished.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closePencilBookedPopup}
                aria-label="Close notice"
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Confirm modal + nested "View full policies" modal */}
      {confirmOpen && confirmData && (
        <>
          {/* Confirm Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => {
                if (!processing) {
                  setConfirmOpen(false);
                  setConfirmData(null);
                  setPoliciesOpen(false);
                  setTermsAccepted(false);
                  setTermsError(null);
                }
              }}
            />
            <div className="relative w-full max-w-4xl rounded-lg border bg-background shadow-lg">
              {/* scrollable body */}
              <div className="max-h-[80vh] overflow-auto p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold">Review &amp; Confirm Booking</h2>
                    <p className="text-sm text-muted-foreground">
                      Please review all details. You can still go back and edit if something is wrong.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={processing}
                    onClick={() => {
                      setConfirmOpen(false);
                      setConfirmData(null);
                      setPoliciesOpen(false);
                      setTermsAccepted(false);
                      setTermsError(null);
                    }}
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Main summary blocks */}
                <div className="grid gap-3 md:grid-cols-2">
                  {/* Client / event */}
                  <div className="rounded-md border p-4 space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Client / Organizer</div>

                    <div className="grid gap-1">
                      <div className="text-sm font-semibold">{data.client_name || '—'}</div>
                      <div className="text-xs text-muted-foreground">
                        {data.company_name ? `Company: ${data.company_name}` : 'Company: —'}
                      </div>
                      <div className="text-xs text-muted-foreground">{data.client_email || '—'}</div>
                      <div className="text-xs text-muted-foreground">{data.client_contact_number || '—'}</div>
                    </div>

                    <div className="h-px bg-border" />

                    <div className="grid gap-1">
                      <div className="text-xs text-muted-foreground">Event type</div>
                      <div className="text-sm font-medium">{data.type_of_event || '—'}</div>
                    </div>

                    <div className="grid gap-1">
                      <div className="text-xs text-muted-foreground">Guests</div>
                      <div className="text-sm font-medium">{data.number_of_guests || '—'}</div>
                    </div>

                    <div className="grid gap-1">
                      <div className="text-xs text-muted-foreground">Address</div>
                      <div className="text-sm">{data.client_address || '—'}</div>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="rounded-md border p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Schedule</div>
                        <div className="text-sm font-semibold">{confirmData.mainDisplay}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Main: <code className="rounded bg-muted px-1 py-0.5">{data.booking_date_from}</code> →{' '}
                          <code className="rounded bg-muted px-1 py-0.5">{data.booking_date_to}</code>
                        </div>
                      </div>

                      {confirmData.extrasCount > 0 && (
                        <div className="text-xs text-muted-foreground">+{confirmData.extrasCount} extra</div>
                      )}
                    </div>

                    {confirmData.extraDisplays.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Additional schedules
                        </div>
                        <ul className="list-disc pl-5 text-sm">
                          {confirmData.extraDisplays.map((dsp, i) => (
                            <li key={`extra-dsp-${i}`}>{dsp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="h-px bg-border" />

                    <div className="text-xs text-muted-foreground">
                      Tip: You can review the full facility policies before submitting (see “View full policies” below).
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="rounded-md border p-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Services</div>
                      <div className="text-sm font-medium">
                        Items: {cart.length} • Qty: {confirmData.itemsCount} • Total:{' '}
                        {confirmData.itemsTotal.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-muted-foreground">
                          <th className="py-2 pr-2">Service</th>
                          <th className="py-2 pr-2">Area</th>
                          <th className="py-2 pr-2 text-right">Qty</th>
                          <th className="py-2 pr-2 text-right">Price</th>
                          <th className="py-2 pr-2 text-right">Line total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((it) => (
                          <tr key={`confirm-item-${it.service_id}`} className="border-t">
                            <td className="py-2 pr-2">{it.name}</td>
                            <td className="py-2 pr-2">{it.area ?? '—'}</td>
                            <td className="py-2 pr-2 text-right tabular-nums">{it.quantity}</td>
                            <td className="py-2 pr-2 text-right tabular-nums">
                              {Number(it.price).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="py-2 pr-2 text-right tabular-nums">
                              {(it.price * it.quantity).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}

                        {cart.length === 0 && (
                          <tr>
                            <td className="py-4 text-muted-foreground" colSpan={5}>
                              No services selected.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Survey summary */}
                <div className="rounded-md border p-4 space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Survey</div>
                  <div className="grid gap-1">
                    <div className="text-xs text-muted-foreground">Survey Email</div>
                    <div className="text-sm font-medium">{data.survey_email || '—'}</div>
                  </div>
                  <div className="grid gap-1">
                    <div className="text-xs text-muted-foreground">Proof</div>
                    <div className="text-sm font-medium">
                      {data.survey_proof_image &&
                      typeof data.survey_proof_image === 'object' &&
                      'name' in (data.survey_proof_image as any)
                        ? String((data.survey_proof_image as File).name)
                        : data.survey_proof_image
                          ? 'Attached'
                          : '—'}
                    </div>
                  </div>
                  {surveyProofPreviewUrl && (
                    <div className="mt-2">
                      <img
                        src={surveyProofPreviewUrl}
                        alt="Survey proof preview"
                        className="max-h-56 w-full rounded-md border bg-background object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Policies & agreement */}
                <div className="rounded-md border p-4 space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Policies &amp; agreement
                      </div>
                      <div className="text-xs text-muted-foreground">{POLICY_SOURCE_LABEL}</div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPoliciesOpen(true)}
                      disabled={processing}
                      title="Open full policies (does not leave this page)"
                    >
                      View full policies
                    </Button>
                  </div>

                  <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                    {POLICY_KEY_POINTS.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>

                  <div
                    className={cn(
                      'rounded-md border p-3',
                      termsError ? 'border-destructive/40 bg-destructive/5' : 'bg-muted/20',
                    )}
                  >
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4"
                        checked={termsAccepted}
                        onChange={(e) => {
                          setTermsAccepted(e.target.checked);
                          if (e.target.checked) setTermsError(null);
                        }}
                        disabled={processing}
                      />
                      <span className="text-sm">
                        I have read and agree to the facility guidelines, booking policies, bond requirements, cancellation fees, and
                        outsourced services rules.
                      </span>
                    </label>

                    {termsError && <div className="mt-2 text-sm text-destructive">{termsError}</div>}

                    <div className="mt-2 text-xs text-muted-foreground">
                      Need contacts or house rules too? You can open the Guidelines &amp; Contacts page in another tab:{' '}
                      <Link href="/guidelines" className="text-primary underline underline-offset-2" target="_blank">
                        /guidelines
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* footer */}
              <div className="border-t p-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={processing}
                  onClick={() => {
                    setConfirmOpen(false);
                    setConfirmData(null);
                    setPoliciesOpen(false);
                    setTermsAccepted(false);
                    setTermsError(null);
                  }}
                >
                  Back &amp; Edit
                </Button>

                <Button
                  type="button"
                  disabled={processing || !termsAccepted}
                  onClick={onConfirmSubmit}
                  title={!termsAccepted ? 'Please accept the policies before submitting.' : 'Submit booking'}
                >
                  {processing ? 'Submitting…' : 'Submit booking'}
                </Button>
              </div>
            </div>
          </div>

          {/* ✅ Nested policies modal */}
          {policiesOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => {
                  if (!processing) setPoliciesOpen(false);
                }}
              />
              <div className="relative w-full max-w-3xl rounded-lg border bg-background shadow-lg">
                <div className="flex items-start justify-between gap-3 border-b p-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold">Full booking policies &amp; terms</h3>
                    <p className="text-xs text-muted-foreground">
                      {POLICY_SOURCE_LABEL} (shown here so you don’t have to leave the booking form)
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={processing}
                    onClick={() => setPoliciesOpen(false)}
                    aria-label="Close policies"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="max-h-[75vh] overflow-auto p-5 space-y-5 text-sm">
                  {FULL_POLICY_SECTIONS.map((sec) => (
                    <section key={sec.title} className="space-y-2">
                      <div className="font-semibold">{sec.title}</div>
                      <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                        {sec.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </section>
                  ))}

                  <div className="rounded-md border bg-muted/20 p-3 text-xs text-muted-foreground">
                    Reminder: These policies are facility rules and may be enforced during review/approval and in the reservation
                    contract.
                  </div>
                </div>

                <div className="border-t p-4 flex items-center justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setPoliciesOpen(false)} disabled={processing}>
                    Close
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setPoliciesOpen(false);
                      setTermsAccepted(true);
                      setTermsError(null);
                    }}
                    disabled={processing}
                    title="Mark as read and agree"
                  >
                    I understand &amp; agree
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" asChild>
            <Link href="/bookings">← Back to Bookings</Link>
          </Button>
        </div>

        {/* ✅ Same height on XL (tallest card drives the row; others stretch) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:items-stretch">
          {/* LEFT: details */}
          <Card className="xl:col-span-1 h-full flex flex-col">
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>

            <CardContent className="flex-1">
              <form id="create-booking-form" onSubmit={onAttemptSubmit} className="grid gap-5">
                <button type="submit" className="hidden" />

                <div className={gridAuto2}>
                  <div className="grid gap-2 min-w-0">
                    <Label htmlFor="client_name">Client Name</Label>
                    <Input id="client_name" value={data.client_name} onChange={(e) => setData('client_name', e.target.value)} required />
                    {errors.client_name && <p className="text-destructive text-sm">{errors.client_name}</p>}
                  </div>

                  <div className="grid gap-2 min-w-0">
                    <Label htmlFor="company_name">Company</Label>
                    <Input id="company_name" value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} />
                    {errors.company_name && <p className="text-destructive text-sm">{errors.company_name}</p>}
                  </div>
                </div>

                <div className="grid gap-2 min-w-0">
                  <Label htmlFor="head_of_organization">Head of the Organization</Label>
                  <Input
                    id="head_of_organization"
                    value={data.head_of_organization}
                    onChange={(e) => setData('head_of_organization', e.target.value)}
                    placeholder="Optional"
                  />
                  {errors.head_of_organization && <p className="text-destructive text-sm">{errors.head_of_organization}</p>}
                </div>

                <div className={gridAuto2}>
                  <div className="grid gap-2 min-w-0">
                    <Label htmlFor="client_contact_number">Contact Number</Label>
                    <Input
                      id="client_contact_number"
                      value={data.client_contact_number}
                      onChange={(e) => setData('client_contact_number', e.target.value)}
                      required
                    />
                    {errors.client_contact_number && <p className="text-destructive text-sm">{errors.client_contact_number}</p>}
                  </div>

                  <div className="grid gap-2 min-w-0">
                    <Label htmlFor="client_email">Email</Label>
                    <Input
                      id="client_email"
                      type="email"
                      value={data.client_email}
                      onChange={(e) => setData('client_email', e.target.value)}
                      required
                      disabled={isClient && !!authUserEmail}
                      title={isClient && !!authUserEmail ? 'Auto-filled from your account email' : undefined}
                    />
                    {errors.client_email && <p className="text-destructive text-sm">{errors.client_email}</p>}
                    {isClient && !!authUserEmail && (
                      <p className="text-xs text-muted-foreground">This is automatically set to your account email.</p>
                    )}
                  </div>
                </div>

                <div className={gridAuto3}>
                  <div className="grid gap-2 min-w-0">
                    <Label htmlFor="client_address">Address</Label>
                    <Input id="client_address" value={data.client_address} onChange={(e) => setData('client_address', e.target.value)} required />
                    {errors.client_address && <p className="text-destructive text-sm">{errors.client_address}</p>}
                  </div>
                </div>

                <div className="grid gap-2 min-w-0">
                  <Label htmlFor="type_of_event">Type of Event</Label>
                  <Input id="type_of_event" value={data.type_of_event} onChange={(e) => setData('type_of_event', e.target.value)} required />
                  {errors.type_of_event && <p className="text-destructive text-sm">{errors.type_of_event}</p>}
                </div>

                {/* Schedule */}
                <div className="grid gap-2">
                  <Label htmlFor="booking_date">Booking Date</Label>
                  <Input
                    id="booking_date"
                    type="date"
                    min={todayStr}
                    value={bookingDate}
                    onChange={(e) => {
                      setScheduleError(null);
                      setBookingDate(e.target.value);
                    }}
                    required
                  />
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="w-4 h-4 mt-[1px]" />
                    Select a date, then pick AM/PM/EVE. The system automatically sets the exact time range.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label>Choose Time Blocks</Label>

                  <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
                    {BLOCK_ORDER.map((b) => (
                      <BlockButton
                        key={b}
                        block={b}
                        selected={selectedBlocks.includes(b)}
                        disabled={!!mainAvailability && !isBlockAvailable(mainAvailability, b)}
                        onClick={() => {
                          if (!bookingDate) {
                            setScheduleError('Please select a date first.');
                            return;
                          }
                          setSelectedBlocks((prev) => toggleBlockSelection(prev, b));
                        }}
                      />
                    ))}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {isAdmin ? (
                      <p>
                        Note: <strong>12:00 AM – 6:00 AM</strong> is <strong>Admin-only</strong>. If a client requests it, instruct them to
                        contact your official contact number.
                      </p>
                    ) : (
                      <p>
                        Note: <strong>12:00 AM – 6:00 AM</strong> is <strong>Admin-only</strong>. Clients should contact the official contact
                        number for requests.
                      </p>
                    )}
                  </div>

                  {scheduleError && <p className="text-destructive text-sm">{scheduleError}</p>}

                  {bookingDate && selectedBlocks.length > 0 && (
                    <div className="rounded-md border p-3 bg-muted/30 text-sm">
                      {(() => {
                        const range = computeRangeFromDateAndBlocks(bookingDate, selectedBlocks);
                        if (!range) return null;
                        return (
                          <div className="space-y-1">
                            <div className="font-medium">Selected: {range.label}</div>
                            <div className="text-muted-foreground">{range.display}</div>
                            <div className="text-xs text-muted-foreground">
                              (Auto-set) From: <code>{range.fromIso}</code> • To: <code>{range.toIso}</code>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {bookingDate && (
                    <div className="text-xs mt-1 border rounded-md p-3 bg-muted/20 space-y-2">
                      {loadingDates[bookingDate] && <p>Loading availability…</p>}
                      {availabilityErrors[bookingDate] && <p className="text-destructive">{availabilityErrors[bookingDate]}</p>}

                      {mainAvailability && !loadingDates[bookingDate] && !availabilityErrors[bookingDate] && (
                        <>
                          <div className="font-semibold">
                            Availability for {new Date(`${bookingDate}T00:00:00`).toLocaleDateString()}:
                          </div>

                          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
                            {BLOCK_ORDER.map((b) => {
                              const ok = isBlockAvailable(mainAvailability, b);
                              return (
                                <div key={b} className={cn('rounded-md border px-2 py-2', ok ? 'bg-background' : 'bg-muted opacity-70')}>
                                  <div className="font-medium">{b}</div>
                                  <div className="text-muted-foreground">{BLOCK_META[b].time}</div>
                                  <div className={cn('text-[11px] mt-1 font-semibold', ok ? 'text-emerald-600' : 'text-destructive')}>
                                    {ok ? 'Available' : 'Booked'}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Additional schedules */}
                <div className="mt-2 border rounded-md p-3 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Additional Schedules</span>
                    <Button type="button" variant="outline" size="sm" onClick={addScheduleRow}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add schedule row
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Use this for multi-day bookings. Each row uses the same AM/PM/EVE block system.
                  </p>

                  {extraSchedules.length === 0 && <p className="text-xs text-muted-foreground italic">No extra schedules added.</p>}

                  {extraSchedules.map((row, idx) => {
                    const av = row.date ? availabilityCache[row.date] : null;
                    const range = row.date && row.blocks.length > 0 ? computeRangeFromDateAndBlocks(row.date, row.blocks) : null;

                    return (
                      <div key={idx} className="rounded-md border p-3 bg-background space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold">Row {idx + 1}</div>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeScheduleRow(idx)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className={gridAuto2}>
                          <div className="grid gap-2 min-w-0">
                            <Label>Extra Date</Label>
                            <Input type="date" min={todayStr} value={row.date} onChange={(e) => updateExtraDate(idx, e.target.value)} />
                          </div>

                          <div className="grid gap-2 min-w-0">
                            <Label>Blocks</Label>
                            <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
                              {BLOCK_ORDER.map((b) => (
                                <BlockButton
                                  key={b}
                                  block={b}
                                  selected={row.blocks.includes(b)}
                                  disabled={!!av && !isBlockAvailable(av, b)}
                                  onClick={() => {
                                    if (!row.date) {
                                      setScheduleError(`Extra schedule row ${idx + 1}: select a date first.`);
                                      return;
                                    }
                                    toggleExtraBlock(idx, b);
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {row.date && (
                          <div className="text-xs border rounded-md p-2 bg-muted/20">
                            {loadingDates[row.date] && <p>Loading availability…</p>}
                            {availabilityErrors[row.date] && <p className="text-destructive">{availabilityErrors[row.date]}</p>}
                            {av && !loadingDates[row.date] && !availabilityErrors[row.date] && (
                              <p className="text-muted-foreground">
                                {BLOCK_ORDER.map((b) => `${b}: ${isBlockAvailable(av, b) ? 'Available' : 'Booked'}`).join(' • ')}
                              </p>
                            )}
                          </div>
                        )}

                        {range && (
                          <div className="text-sm rounded-md border p-2 bg-muted/30">
                            <div className="font-medium">Selected: {range.label}</div>
                            <div className="text-xs text-muted-foreground">{range.display}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Guests + Status */}
                <div className={gridAuto2}>
                  <div className="grid gap-2 min-w-0">
                    <Label htmlFor="number_of_guests">Guests</Label>
                    <Input
                      id="number_of_guests"
                      type="number"
                      min={0}
                      step={1}
                      value={data.number_of_guests}
                      onChange={(e) => setData('number_of_guests', e.target.value)}
                      required
                    />
                    {errors.number_of_guests && <p className="text-destructive text-sm">{errors.number_of_guests}</p>}
                  </div>

                  <div className="grid gap-2 min-w-0">
                    <Label htmlFor="booking_status">Booking Status</Label>
                    <select
                      id="booking_status"
                      className="w-full border bg-background rounded-md px-3 py-2 text-sm disabled:opacity-60"
                      value={data.booking_status}
                      onChange={(e) => setData('booking_status', e.target.value)}
                      disabled={isClient}
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="declined">Declined</option>
                      <option value="completed">Completed</option>
                    </select>

                    {isClient && (
                      <p className="text-xs text-muted-foreground">
                        As a client, your booking will start as <strong>Pending</strong>.
                      </p>
                    )}

                    {errors.booking_status && <p className="text-destructive text-sm">{errors.booking_status}</p>}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* MIDDLE: services list */}
          <Card className="xl:col-span-1 h-full flex flex-col overflow-hidden">
            <CardHeader>
              <CardTitle>Select Services</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 flex-1 min-h-0">
              <div className="text-sm text-muted-foreground">Add one or more services to this booking.</div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search services..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>

              <div className="flex-1 min-h-0 overflow-auto pr-1 space-y-4">
                {filteredServiceTypes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">No services found matching "{searchQuery}"</div>
                )}

                {filteredServiceTypes.map((type) => (
                  <div key={type.id} className="space-y-2">
                    <h4 className="font-medium">{type.name}</h4>

                    <div className="grid gap-2">
                      {type.services?.map((s) => (
                        <div key={s.id} className="flex items-start gap-3 rounded-md border px-3 py-2">
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium">{s.name}</span>
                            <span className="text-xs text-muted-foreground">{s.description}</span>
                          </div>

                          <div className="ml-auto flex items-center gap-2 shrink-0">
                            <span className="text-sm">
                              {Number(s.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>

                            <Button
                              type="button"
                              size="icon"
                              onClick={() => {
                                setCart((prev) => {
                                  const existing = prev.find((ci) => ci.service_id === s.id);
                                  if (existing) {
                                    return prev.map((ci) => (ci.service_id === s.id ? { ...ci, quantity: ci.quantity + 1 } : ci));
                                  }
                                  return [...prev, { service_id: s.id, name: s.name, area: type.name, price: Number(s.price), quantity: 1 }];
                                });
                              }}
                              title="Add service"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* RIGHT: selected services + Survey block + Submit */}
          <Card className="xl:col-span-1 h-full flex flex-col">
            <CardHeader>
              <CardTitle>Selected Services</CardTitle>
            </CardHeader>

            <CardContent className="flex-1">
              <div className="grid gap-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th className="py-2 pr-2">Service</th>
                        <th className="py-2 pr-2">Area</th>
                        <th className="py-2 pr-2">Price</th>
                        <th className="py-2 pr-2">Qty</th>
                        <th className="py-2 pr-2 text-right">Total</th>
                        <th className="py-2 pr-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((i) => (
                        <tr key={i.service_id} className="border-t">
                          <td className="py-2 pr-2">{i.name}</td>
                          <td className="py-2 pr-2">{i.area ?? '-'}</td>
                          <td className="py-2 pr-2">
                            {Number(i.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 pr-2">
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={() =>
                                  setCart((prev) =>
                                    prev.map((ci) =>
                                      ci.service_id === i.service_id ? { ...ci, quantity: Math.max(1, ci.quantity - 1) } : ci,
                                    ),
                                  )
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                className="w-16"
                                type="number"
                                min={1}
                                value={i.quantity}
                                onChange={(e) =>
                                  setCart((prev) =>
                                    prev.map((ci) =>
                                      ci.service_id === i.service_id ? { ...ci, quantity: Math.max(1, Number(e.target.value)) } : ci,
                                    ),
                                  )
                                }
                              />
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={() =>
                                  setCart((prev) =>
                                    prev.map((ci) => (ci.service_id === i.service_id ? { ...ci, quantity: ci.quantity + 1 } : ci)),
                                  )
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                          <td className="py-2 pr-2 text-right">
                            {(i.price * i.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 pr-2 text-right">
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              onClick={() => setCart((prev) => prev.filter((ci) => ci.service_id !== i.service_id))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}

                      {cart.length === 0 && (
                        <tr>
                          <td className="py-6 text-center text-muted-foreground" colSpan={6}>
                            No services selected yet.
                          </td>
                        </tr>
                      )}
                    </tbody>

                    {cart.length > 0 && (
                      <tfoot>
                        <tr className="border-t">
                          <td className="py-2 pr-2" colSpan={4}>
                            Items Total
                          </td>
                          <td className="py-2 pr-2 text-right">
                            {cartTotals.itemsTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

              {(errors as any).items && <p className="mt-2 text-sm text-destructive">{(errors as any).items}</p>}

              {cart.length === 0 && <p className="mt-2 text-sm text-destructive">Please select at least one service before creating a booking.</p>}

              <div className="rounded-md border p-4 space-y-4 mt-4 bg-muted/10">
                <div className="space-y-1">
                  <div className="text-sm font-semibold">Required Google Survey</div>
                  <p className="text-xs text-muted-foreground">
                    Please complete the survey before submitting your booking. Use the QR code or the link below, then upload a screenshot/photo
                    as proof.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-[160px,1fr]">
                  <div className="flex items-center justify-center">
                    {qrStage !== 'none' && qrSrc ? (
                      survey?.url ? (
                        <a href={survey.url} target="_blank"  title="Open survey">
                          <img
                            key={`${qrStage}-${qrSrc}`}
                            src={qrSrc}
                            alt="Survey QR code"
                            className="h-40 w-40 rounded-md border bg-background object-contain"
                            style={{ imageRendering: 'pixelated' }}
                            onError={() => {
                              setQrStage((prev) => (prev === 'remote' ? 'fallback' : 'none'));
                            }}
                          />
                        </a>
                      ) : (
                        <img
                          key={`${qrStage}-${qrSrc}`}
                          src={qrSrc}
                          alt="Survey QR code"
                          className="h-40 w-40 rounded-md border bg-background object-contain"
                          style={{ imageRendering: 'pixelated' }}
                          onError={() => {
                            setQrStage((prev) => (prev === 'remote' ? 'fallback' : 'none'));
                          }}
                        />
                      )
                    ) : (
                      <div className="h-40 w-40 rounded-md border bg-background flex items-center justify-center text-xs text-muted-foreground text-center px-2">
                        QR unavailable
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm">
                      
                        <a href="https://forms.gle/5BC1qJha6FFCQRwW9" target="_blank" className="text-primary underline underline-offset-2">
                          Open the survey (Google Form)
                        </a>
                     
                    
                    </div>

                    {/* ✅ OPEN by default + stays open/closed based on user toggle (state) */}
                    <details
                      className="rounded-md border bg-background p-3"
                      open={noticeOpen}
                      onToggle={(e) => setNoticeOpen((e.currentTarget as HTMLDetailsElement).open)}
                    >
                      <summary className="cursor-pointer text-sm font-semibold">2025 MICE REPORT • Notice / Reminders / Links</summary>

                      <div className="mt-3 space-y-3 text-xs text-muted-foreground">
                        <div className="space-y-1">
                          <div className="font-semibold text-foreground">2025 MICE REPORT</div>
                          <p>Your response has been recorded.</p>
                          <p>
                            To <strong>ADD</strong> another record, click the <strong>REFRESH ICON</strong> at the URL bar to reload and continue
                            encoding your data.
                          </p>
                          <p>We appreciate it for using the Google Form in submitting your statistical reports.</p>
                        </div>

                        <div className="space-y-2">
                          <div className="font-semibold text-foreground">REMINDER: Please be cautious in entering the following</div>
                          <ol className="list-decimal pl-5 space-y-2">
                            <li>
                              The number of guests per room must not exceed the maximum number of capacities per room per day.
                              <div className="mt-1 italic">Rationale: To attain the Average Number of Guest per Room.</div>
                            </li>
                            <li>
                              The checked-in day and check-out date must be exact.
                              <div className="mt-1 italic">Rationale: To attain the Average Length of Stay.</div>
                            </li>
                          </ol>
                          <p>Encoding every checked-in day is very much highly appreciated.</p>
                          <p>Your favorable cooperation is highly encouraged.</p>
                        </div>

                        <div className="space-y-2">
                          <div className="font-semibold text-foreground">For the DATABASE UPDATE</div>
                          <p>FILL OUT the Form AND/OR UPDATE the material information in the database more particularly to the following areas:</p>
                          <ol className="list-decimal pl-5 space-y-1">
                            <li>Your email addresses if there are changes or additional</li>
                            <li>Disaggregate the Number of Employees as to Female or Male</li>
                          </ol>
                          <p className="mt-2">
                            <strong>NOTE:</strong> If you DO NOT HAVE Function Hall or Event Center, state <strong>NONE</strong>.
                          </p>
                          <p>
                            Please click the link hereunder Google Form:{' '}
                            <a
                              href="https://forms.gle/483zbauZipLddVX7A"
                              target="_blank"
                              
                              className="text-primary underline underline-offset-2 break-all"
                            >
                              https://forms.gle/483zbauZipLddVX7A
                            </a>
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="font-semibold text-foreground">BAGUIO VIS.I.T.A.</div>
                          <p>
                            Register OR Update your Baguio Vis.I.T.A. account. UPLOAD your Current Business Permit and DOT Accreditation.
                          </p>
                          <p>
                            Please click the link below:{' '}
                            <a
                              href="https://visita.baguio.gov.ph/business/login"
                              target="_blank"
                              
                              className="text-primary underline underline-offset-2 break-all"
                            >
                              https://visita.baguio.gov.ph/business/login
                            </a>
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="font-semibold text-foreground">For D.O.T ACCREDITATION</div>
                          <p>
                            Click the DOT Accreditation Portal:{' '}
                            <a
                              href="https://accreditation.tourism.gov.ph/login"
                              target="_blank"
                              
                              className="text-primary underline underline-offset-2 break-all"
                            >
                              https://accreditation.tourism.gov.ph/login
                            </a>
                          </p>
                        </div>
                      </div>
                    </details>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="grid gap-2 min-w-0">
                        <Label htmlFor="survey_email">Survey Email</Label>
                        <Input
                          id="survey_email"
                          type="email"
                          value={data.survey_email}
                          onChange={(e) => setData('survey_email', e.target.value)}
                          required
                        />
                        {errors.survey_email && <p className="text-destructive text-sm">{errors.survey_email}</p>}
                      </div>

                      <div className="grid gap-2 min-w-0">
                        <Label htmlFor="survey_proof_image">Proof of Submission</Label>
                        <Input
                          id="survey_proof_image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setData('survey_proof_image', e.target.files?.[0] ?? null)}
                          required
                        />
                        {errors.survey_proof_image && <p className="text-destructive text-sm">{errors.survey_proof_image}</p>}
                      </div>
                    </div>

                    {surveyProofPreviewUrl && (
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">Preview</div>
                        <img
                          src={surveyProofPreviewUrl}
                          alt="Survey proof preview"
                          className="max-h-56 w-full rounded-md border bg-background object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit button submits the LEFT form */}
                <div className="flex justify-end pt-1">
                  <Button type="submit" form="create-booking-form" disabled={processing} className="w-full sm:w-auto">
                    {processing ? 'Creating…' : 'Create Booking'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

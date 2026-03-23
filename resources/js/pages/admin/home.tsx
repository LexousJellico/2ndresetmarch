import type { ChangeEvent, FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    Edit3,
    Image as ImageIcon,
    LayoutGrid,
    Mail,
    MapPin,
    Megaphone,
    Package2,
    PanelsTopLeft,
    Phone,
    Plus,
    ScrollText,
    ShieldCheck,
    Trash2,
    X,
} from 'lucide-react';

import SortOrderBoard from '@/layouts/sort-order-board';
import AdminLayout from '@/layouts/admin-layout';

type RowId = number | string;

type EventRow = {
    id: RowId;
    title: string;
    venue: string;
    date: string;
    time: string | null;
    description: string;
    note: string;
    highlighted: boolean;
    images: string[];
    scope?: 'bccc' | 'city';
    isPublic?: boolean;
};

type PackageRow = {
    id: RowId;
    title: string;
    description: string;
    images: string[];
};

type CalendarBlockRow = {
    id: RowId;
    title: string;
    area: string;
    block: 'AM' | 'PM' | 'EVE' | 'DAY';
    dateFrom: string;
    dateTo: string;
    note: string;
    statusColor: 'red' | 'gold' | 'blue';
};

type SpaceRow = {
    id: RowId;
    title: string;
    category: string;
    capacity: string;
    shortDescription: string;
    summary: string;
    details: string[];
    lightImage: string;
    darkImage: string;
    homepageVisible: boolean;
};

type StatRow = {
    id: RowId;
    label: string;
    value: string;
    suffix: string;
};

type SiteConfigState = {
    mapEmbedUrl: string;
    openMapUrl: string;
    address: string;
    phone: string;
    email: string;
    footerDescription: string;
    footerCopyright: string;
};

type EventFormState = {
    title: string;
    venue: string;
    date: string;
    time: string;
    description: string;
    note: string;
    highlighted: boolean;
    files: File[];
    previews: string[];
};

type PackageFormState = {
    title: string;
    description: string;
    files: File[];
    previews: string[];
};

type CalendarBlockFormState = {
    title: string;
    area: string;
    block: 'AM' | 'PM' | 'EVE' | 'DAY';
    dateFrom: string;
    dateTo: string;
    note: string;
    statusColor: 'red' | 'gold' | 'blue';
};

type SpaceFormState = {
    title: string;
    category: string;
    capacity: string;
    shortDescription: string;
    summary: string;
    details: string;
    homepageVisible: boolean;
    lightFile: File | null;
    darkFile: File | null;
    lightPreview: string;
    darkPreview: string;
};

type StatFormState = {
    label: string;
    value: string;
    suffix: string;
};

type AdminHomePageProps = {
    initialBcccEvents?: EventRow[];
    initialCityEvents?: EventRow[];
    initialPackages?: PackageRow[];
    initialCalendarBlocks?: CalendarBlockRow[];
    initialSpaces?: SpaceRow[];
    initialStats?: StatRow[];
    initialSiteConfig?: SiteConfigState;
};

type NoticeState = {
    type: 'success' | 'error';
    text: string;
} | null;

const initialEventForm: EventFormState = {
    title: '',
    venue: '',
    date: '',
    time: '',
    description: '',
    note: '',
    highlighted: false,
    files: [],
    previews: [],
};

const initialPackageForm: PackageFormState = {
    title: '',
    description: '',
    files: [],
    previews: [],
};

const initialCalendarBlockForm: CalendarBlockFormState = {
    title: '',
    area: '',
    block: 'DAY',
    dateFrom: '',
    dateTo: '',
    note: '',
    statusColor: 'red',
};

const initialSpaceForm: SpaceFormState = {
    title: '',
    category: '',
    capacity: '',
    shortDescription: '',
    summary: '',
    details: '',
    homepageVisible: true,
    lightFile: null,
    darkFile: null,
    lightPreview: '',
    darkPreview: '',
};

const initialStatForm: StatFormState = {
    label: '',
    value: '',
    suffix: '',
};

const fallbackSiteConfig: SiteConfigState = {
    mapEmbedUrl:
        'https://www.google.com/maps?q=CH3X%2BRRW%2C%20Baguio%2C%20Benguet%2C%20Philippines&z=16&output=embed',
    openMapUrl:
        'https://www.google.com/maps/search/?api=1&query=CH3X%2BRRW%2C%20Baguio%2C%20Benguet%2C%20Philippines',
    address: 'CH3X+RRW, Baguio, Benguet, Philippines',
    phone: '(074) 446 2009',
    email: 'info@bccc-ease.com',
    footerDescription:
        'A public-facing venue platform for space discovery, event highlights, schedule visibility, and booking guidance for the Baguio Convention and Cultural Center.',
    footerCopyright: '© 2026 BCCC EASE • City Government of Baguio • All Rights Reserved',
};

function reorderByIds<T extends { id: RowId }>(items: T[], orderedIds: RowId[]) {
    const map = new Map(items.map((item) => [item.id, item] as const));

    return orderedIds
        .map((id) => map.get(id))
        .filter((item): item is T => Boolean(item));
}

function getCsrfToken() {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content')
            ?.trim() ?? ''
    );
}

async function parseApiResponse(response: Response) {
    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
        return response.json();
    }

    const text = await response.text();

    try {
        return JSON.parse(text);
    } catch {
        return { message: text || 'Unexpected server response.' };
    }
}

function normalizeErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
        return error;
    }

    if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
    ) {
        return (error as { message: string }).message;
    }

    return 'Something went wrong while processing the request.';
}

async function apiJson<T>(url: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown): Promise<T> {
    const csrf = getCsrfToken();

    const response = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const payload = await parseApiResponse(response);

    if (!response.ok) {
        throw payload;
    }

    return payload as T;
}

async function apiFormSubmit<T>(
    url: string,
    formData: FormData,
    method: 'POST' | 'PUT' = 'POST',
): Promise<T> {
    const csrf = getCsrfToken();

    if (method !== 'POST') {
        formData.append('_method', method);
    }

    const response = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
        },
        body: formData,
    });

    const payload = await parseApiResponse(response);

    if (!response.ok) {
        throw payload;
    }

    return payload as T;
}

function fileListToFiles(files: FileList | null, max = 3) {
    if (!files) return [];
    return Array.from(files).slice(0, max);
}

function filesToPreviewUrls(files: File[]) {
    return files.map((file) => URL.createObjectURL(file));
}

function replaceById<T extends { id: RowId }>(items: T[], nextItem: T) {
    return items.map((item) => (item.id === nextItem.id ? nextItem : item));
}

function SummaryCard({
    icon: Icon,
    title,
    value,
    note,
    tone = 'green',
}: {
    icon: any;
    title: string;
    value: string;
    note: string;
    tone?: 'green' | 'blue' | 'gold';
}) {
    const toneClass =
        tone === 'blue'
            ? 'bg-[#e4eeff] text-[#1645ac] dark:bg-[#1d2943] dark:text-[#a6c0ff]'
            : tone === 'gold'
              ? 'bg-[#fff0c7] text-[#8a6500] dark:bg-[#322911] dark:text-[#f3d17a]'
              : 'bg-[#e8f2ee] text-[#174f40] dark:bg-[#18231f] dark:text-[#9dc0ff]';

    return (
        <article className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-[#16171b]">
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${toneClass}`}>
                <Icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-black uppercase tracking-[0.12em]">{title}</p>
            <h3 className="mt-2 text-3xl font-black tracking-tight">{value}</h3>
            <p className="mt-2 text-sm leading-7 text-[#5c5953] dark:text-[#c8c8ce]">{note}</p>
        </article>
    );
}

function NoticeBanner({ notice }: { notice: NoticeState }) {
    if (!notice) return null;

    return (
        <div
            className={`rounded-[1.6rem] border px-5 py-4 text-sm font-medium ${
                notice.type === 'success'
                    ? 'border-[#bde0d0] bg-[#edf8f2] text-[#174f40] dark:border-[#294c41] dark:bg-[#16231f] dark:text-[#a8d7c4]'
                    : 'border-[#f0c1c1] bg-[#fff1f1] text-[#9d2e2e] dark:border-[#5a2a2a] dark:bg-[#241616] dark:text-[#f3b3b3]'
            }`}
        >
            {notice.text}
        </div>
    );
}

function ImagePreviewStrip({
    images,
    emptyLabel,
}: {
    images: string[];
    emptyLabel: string;
}) {
    if (images.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-black/10 px-4 py-5 text-sm text-[#6a665f] dark:border-white/10 dark:text-[#bdbdc4]">
                {emptyLabel}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-3">
            {images.map((image, index) => (
                <div
                    key={`${image}-${index}`}
                    className="overflow-hidden rounded-2xl border border-black/10 dark:border-white/10"
                >
                    <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="h-24 w-full object-cover"
                    />
                </div>
            ))}
        </div>
    );
}

function ActionButtons({
    onEdit,
    onCancelEdit,
    isEditing,
    onDelete,
    deleting,
}: {
    onEdit: () => void;
    onCancelEdit: () => void;
    isEditing: boolean;
    onDelete: () => Promise<void>;
    deleting: boolean;
}) {
    return (
        <div className="flex items-center gap-2">
            {!isEditing ? (
                <button
                    type="button"
                    onClick={onEdit}
                    className="inline-flex items-center gap-2 rounded-full bg-[#1d5bd8] px-3 py-2 text-xs font-semibold text-white"
                >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onCancelEdit}
                    className="inline-flex items-center gap-2 rounded-full bg-[#5f5b55] px-3 py-2 text-xs font-semibold text-white"
                >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                </button>
            )}

            <button
                type="button"
                disabled={deleting}
                onClick={onDelete}
                className="inline-flex items-center gap-2 rounded-full bg-[#c53434] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
                <Trash2 className="h-3.5 w-3.5" />
                {deleting ? 'Deleting...' : 'Delete'}
            </button>
        </div>
    );
}

function EventManagerCard({
    title,
    scopeLabel,
    rows,
    onCreate,
    onUpdate,
    onDelete,
}: {
    title: string;
    scopeLabel: 'bccc' | 'city';
    rows: EventRow[];
    onCreate: (payload: EventFormState) => Promise<void>;
    onUpdate: (id: RowId, payload: EventFormState) => Promise<void>;
    onDelete: (id: RowId) => Promise<void>;
}) {
    const [form, setForm] = useState<EventFormState>(initialEventForm);
    const [editingId, setEditingId] = useState<RowId | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<RowId | null>(null);

    const resetForm = () => {
        setForm(initialEventForm);
        setEditingId(null);
    };

    const handleImages = (e: ChangeEvent<HTMLInputElement>) => {
        const files = fileListToFiles(e.target.files, 3);
        const previews = files.length > 0 ? filesToPreviewUrls(files) : form.previews;

        setForm((prev) => ({
            ...prev,
            files,
            previews,
        }));
    };

    const startEdit = (row: EventRow) => {
        setEditingId(row.id);
        setForm({
            title: row.title,
            venue: row.venue,
            date: row.date,
            time: row.time ?? '',
            description: row.description,
            note: row.note,
            highlighted: row.highlighted,
            files: [],
            previews: row.images ?? [],
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingId !== null) {
                await onUpdate(editingId, form);
            } else {
                await onCreate(form);
            }

            resetForm();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <article className="rounded-[2rem] border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#16171b]">
            <div className="border-b border-black/10 px-5 py-5 dark:border-white/10">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex rounded-full bg-[#e8f2ee] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#174f40] dark:bg-[#18231f] dark:text-[#9dc0ff]">
                        {scopeLabel === 'bccc' ? 'BCCC' : 'City'}
                    </span>
                    <span className="inline-flex rounded-full bg-[#f7f2e8] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f5b55] dark:bg-[#1d1e23] dark:text-[#c9c9cf]">
                        Create + Update
                    </span>
                </div>

                <h2 className="mt-3 text-2xl font-black tracking-tight">{title}</h2>
                <p className="mt-2 text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                    Create new entries or edit existing ones. Selecting new images during edit will replace the saved images.
                </p>
            </div>

            <div className="grid gap-6 p-5 xl:grid-cols-[0.95fr_1.05fr]">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {editingId !== null && (
                        <div className="rounded-[1.2rem] bg-[#eaf1ff] px-4 py-3 text-sm font-semibold text-[#1645ac] dark:bg-[#1d2943] dark:text-[#a6c0ff]">
                            Editing existing {scopeLabel === 'bccc' ? 'BCCC' : 'City'} event
                        </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold">Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                                className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">Venue</label>
                            <input
                                type="text"
                                value={form.venue}
                                onChange={(e) => setForm((prev) => ({ ...prev, venue: e.target.value }))}
                                className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold">Date</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                                className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">Time (optional)</label>
                            <input
                                type="time"
                                value={form.time}
                                onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                                className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                            rows={4}
                            className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">Note</label>
                        <textarea
                            value={form.note}
                            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                            rows={3}
                            className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">
                            Images {editingId !== null ? '(optional replacement)' : '(max 3)'}
                        </label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImages}
                            className="block w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm dark:border-white/10 dark:bg-[#1d1e23]"
                        />
                        <div className="mt-3">
                            <ImagePreviewStrip images={form.previews} emptyLabel="No preview images selected yet." />
                        </div>
                    </div>

                    <label className="flex items-center gap-3 rounded-[1.2rem] bg-[#f7f2e8] px-4 py-3 text-sm dark:bg-[#1d1e23]">
                        <input
                            type="checkbox"
                            checked={form.highlighted}
                            onChange={(e) => setForm((prev) => ({ ...prev, highlighted: e.target.checked }))}
                            className="h-4 w-4 rounded border-black/20"
                        />
                        <span>Mark as Highlighted Event</span>
                    </label>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 dark:bg-[#2d47ff]"
                        >
                            {editingId !== null ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {submitting
                                ? editingId !== null
                                    ? 'Updating...'
                                    : 'Saving...'
                                : editingId !== null
                                  ? 'Update Event'
                                  : `Add ${scopeLabel === 'bccc' ? 'BCCC' : 'City'} Event`}
                        </button>

                        {editingId !== null && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold dark:border-white/10"
                            >
                                <X className="h-4 w-4" />
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>

                <div className="overflow-hidden rounded-[1.6rem] border border-black/10 dark:border-white/10">
                    <div className="border-b border-black/10 bg-[#f7f2e8] px-4 py-4 dark:border-white/10 dark:bg-[#1d1e23]">
                        <p className="text-sm font-black tracking-tight">
                            Current {scopeLabel === 'bccc' ? 'BCCC' : 'City'} Events Table
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-[#fbf8f2] dark:bg-[#17181c]">
                                <tr className="text-left">
                                    <th className="px-4 py-3 font-bold">Title</th>
                                    <th className="px-4 py-3 font-bold">Venue</th>
                                    <th className="px-4 py-3 font-bold">Date</th>
                                    <th className="px-4 py-3 font-bold">Highlight</th>
                                    <th className="px-4 py-3 font-bold">Images</th>
                                    <th className="px-4 py-3 font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length > 0 ? (
                                    rows.map((row) => (
                                        <tr key={row.id} className="border-t border-black/10 dark:border-white/10">
                                            <td className="px-4 py-3 font-semibold">{row.title}</td>
                                            <td className="px-4 py-3">{row.venue}</td>
                                            <td className="px-4 py-3">{row.date}</td>
                                            <td className="px-4 py-3">
                                                {row.highlighted ? (
                                                    <span className="rounded-full bg-[#fff0c7] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8a6500] dark:bg-[#322911] dark:text-[#f3d17a]">
                                                        Yes
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-[#f2efe8] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#59544d] dark:bg-[#1d1e23] dark:text-[#c9c9cf]">
                                                        No
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">{row.images.length}</td>
                                            <td className="px-4 py-3">
                                                <ActionButtons
                                                    onEdit={() => startEdit(row)}
                                                    onCancelEdit={resetForm}
                                                    isEditing={editingId === row.id}
                                                    deleting={deletingId === row.id}
                                                    onDelete={async () => {
                                                        setDeletingId(row.id);
                                                        try {
                                                            await onDelete(row.id);
                                                            if (editingId === row.id) {
                                                                resetForm();
                                                            }
                                                        } finally {
                                                            setDeletingId(null);
                                                        }
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-6 text-center text-[#67635d] dark:text-[#bdbdc4]">
                                            No saved {scopeLabel} events yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </article>
    );
}

function PackageManagerCard({
    rows,
    onCreate,
    onUpdate,
    onDelete,
}: {
    rows: PackageRow[];
    onCreate: (payload: PackageFormState) => Promise<void>;
    onUpdate: (id: RowId, payload: PackageFormState) => Promise<void>;
    onDelete: (id: RowId) => Promise<void>;
}) {
    const [form, setForm] = useState<PackageFormState>(initialPackageForm);
    const [editingId, setEditingId] = useState<RowId | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<RowId | null>(null);

    const resetForm = () => {
        setForm(initialPackageForm);
        setEditingId(null);
    };

    const handleImages = (e: ChangeEvent<HTMLInputElement>) => {
        const files = fileListToFiles(e.target.files, 3);
        const previews = files.length > 0 ? filesToPreviewUrls(files) : form.previews;

        setForm((prev) => ({
            ...prev,
            files,
            previews,
        }));
    };

    const startEdit = (row: PackageRow) => {
        setEditingId(row.id);
        setForm({
            title: row.title,
            description: row.description,
            files: [],
            previews: row.images ?? [],
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingId !== null) {
                await onUpdate(editingId, form);
            } else {
                await onCreate(form);
            }

            resetForm();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <article id="packages-config" className="rounded-[2rem] border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#16171b]">
            <div className="border-b border-black/10 px-5 py-5 dark:border-white/10">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex rounded-full bg-[#e8f2ee] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#174f40] dark:bg-[#18231f] dark:text-[#9dc0ff]">
                        Feature Packages
                    </span>
                    <span className="inline-flex rounded-full bg-[#f7f2e8] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f5b55] dark:bg-[#1d1e23] dark:text-[#c9c9cf]">
                        Create + Update
                    </span>
                </div>

                <h2 className="mt-3 text-2xl font-black tracking-tight">Packages / Offers Config</h2>
                <p className="mt-2 text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                    Create new packages or edit existing ones. Uploading new images during edit will replace the saved package images.
                </p>
            </div>

            <div className="grid gap-6 p-5 xl:grid-cols-[0.95fr_1.05fr]">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {editingId !== null && (
                        <div className="rounded-[1.2rem] bg-[#eaf1ff] px-4 py-3 text-sm font-semibold text-[#1645ac] dark:bg-[#1d2943] dark:text-[#a6c0ff]">
                            Editing existing package
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-semibold">Package Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                            className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                            rows={5}
                            className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">
                            Images {editingId !== null ? '(optional replacement)' : '(max 3)'}
                        </label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImages}
                            className="block w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm dark:border-white/10 dark:bg-[#1d1e23]"
                        />
                        <div className="mt-3">
                            <ImagePreviewStrip images={form.previews} emptyLabel="No package preview images selected yet." />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 dark:bg-[#2d47ff]"
                        >
                            {editingId !== null ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {submitting
                                ? editingId !== null
                                    ? 'Updating...'
                                    : 'Saving...'
                                : editingId !== null
                                  ? 'Update Package'
                                  : 'Add Package'}
                        </button>

                        {editingId !== null && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold dark:border-white/10"
                            >
                                <X className="h-4 w-4" />
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>

                <div className="overflow-hidden rounded-[1.6rem] border border-black/10 dark:border-white/10">
                    <div className="border-b border-black/10 bg-[#f7f2e8] px-4 py-4 dark:border-white/10 dark:bg-[#1d1e23]">
                        <p className="text-sm font-black tracking-tight">Current Packages Table</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-[#fbf8f2] dark:bg-[#17181c]">
                                <tr className="text-left">
                                    <th className="px-4 py-3 font-bold">Title</th>
                                    <th className="px-4 py-3 font-bold">Description</th>
                                    <th className="px-4 py-3 font-bold">Images</th>
                                    <th className="px-4 py-3 font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length > 0 ? (
                                    rows.map((row) => (
                                        <tr key={row.id} className="border-t border-black/10 dark:border-white/10">
                                            <td className="px-4 py-3 font-semibold">{row.title}</td>
                                            <td className="px-4 py-3">{row.description}</td>
                                            <td className="px-4 py-3">{row.images.length}</td>
                                            <td className="px-4 py-3">
                                                <ActionButtons
                                                    onEdit={() => startEdit(row)}
                                                    onCancelEdit={resetForm}
                                                    isEditing={editingId === row.id}
                                                    deleting={deletingId === row.id}
                                                    onDelete={async () => {
                                                        setDeletingId(row.id);
                                                        try {
                                                            await onDelete(row.id);
                                                            if (editingId === row.id) {
                                                                resetForm();
                                                            }
                                                        } finally {
                                                            setDeletingId(null);
                                                        }
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-6 text-center text-[#67635d] dark:text-[#bdbdc4]">
                                            No saved packages yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </article>
    );
}

function CalendarBlockManagerCard({
    rows,
    onCreate,
    onUpdate,
    onDelete,
}: {
    rows: CalendarBlockRow[];
    onCreate: (payload: CalendarBlockFormState) => Promise<void>;
    onUpdate: (id: RowId, payload: CalendarBlockFormState) => Promise<void>;
    onDelete: (id: RowId) => Promise<void>;
}) {
    const [form, setForm] = useState<CalendarBlockFormState>(initialCalendarBlockForm);
    const [editingId, setEditingId] = useState<RowId | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<RowId | null>(null);

    const badgeClass = (status: CalendarBlockRow['statusColor']) => {
        if (status === 'gold') {
            return 'bg-[#fff0c7] text-[#8a6500] dark:bg-[#322911] dark:text-[#f3d17a]';
        }
        if (status === 'blue') {
            return 'bg-[#e4eeff] text-[#1645ac] dark:bg-[#1d2943] dark:text-[#a6c0ff]';
        }
        return 'bg-[#ffe5e5] text-[#a52a2a] dark:bg-[#321818] dark:text-[#ffb1b1]';
    };

    const resetForm = () => {
        setForm(initialCalendarBlockForm);
        setEditingId(null);
    };

    const startEdit = (row: CalendarBlockRow) => {
        setEditingId(row.id);
        setForm({
            title: row.title,
            area: row.area,
            block: row.block,
            dateFrom: row.dateFrom,
            dateTo: row.dateTo,
            note: row.note,
            statusColor: row.statusColor,
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingId !== null) {
                await onUpdate(editingId, form);
            } else {
                await onCreate(form);
            }

            resetForm();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <article id="calendar-config" className="rounded-[2rem] border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#16171b]">
            <div className="border-b border-black/10 px-5 py-5 dark:border-white/10">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex rounded-full bg-[#e4eeff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1645ac] dark:bg-[#1d2943] dark:text-[#a6c0ff]">
                        Calendar Rules
                    </span>
                    <span className="inline-flex rounded-full bg-[#f7f2e8] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f5b55] dark:bg-[#1d1e23] dark:text-[#c9c9cf]">
                        Create + Update
                    </span>
                </div>

                <h2 className="mt-3 text-2xl font-black tracking-tight">Calendar Block Manager</h2>
                <p className="mt-2 text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                    Calendar rules can now be created, edited, and deleted from the same admin section.
                </p>
            </div>

            <div className="grid gap-6 p-5 xl:grid-cols-[0.92fr_1.08fr]">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {editingId !== null && (
                        <div className="rounded-[1.2rem] bg-[#eaf1ff] px-4 py-3 text-sm font-semibold text-[#1645ac] dark:bg-[#1d2943] dark:text-[#a6c0ff]">
                            Editing existing calendar rule
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-semibold">Block Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                            className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">Area</label>
                        <input
                            type="text"
                            value={form.area}
                            onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))}
                            className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold">Block Type</label>
                            <select
                                value={form.block}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        block: e.target.value as CalendarBlockFormState['block'],
                                    }))
                                }
                                className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                            >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                                <option value="EVE">EVE</option>
                                <option value="DAY">DAY</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">Public Color Meaning</label>
                            <select
                                value={form.statusColor}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        statusColor: e.target.value as CalendarBlockFormState['statusColor'],
                                    }))
                                }
                                className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                            >
                                <option value="red">Red - Admin Blocked</option>
                                <option value="gold">Gold - Private Fully Booked</option>
                                <option value="blue">Blue - Public / Government</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold">Date From</label>
                            <input
                                type="date"
                                value={form.dateFrom}
                                onChange={(e) => setForm((prev) => ({ ...prev, dateFrom: e.target.value }))}
                                className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">Date To</label>
                            <input
                                type="date"
                                value={form.dateTo}
                                onChange={(e) => setForm((prev) => ({ ...prev, dateTo: e.target.value }))}
                                className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">Note</label>
                        <textarea
                            value={form.note}
                            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                            rows={4}
                            className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 dark:bg-[#2d47ff]"
                        >
                            {editingId !== null ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {submitting
                                ? editingId !== null
                                    ? 'Updating...'
                                    : 'Saving...'
                                : editingId !== null
                                  ? 'Update Calendar Rule'
                                  : 'Add Calendar Rule'}
                        </button>

                        {editingId !== null && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold dark:border-white/10"
                            >
                                <X className="h-4 w-4" />
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>

                <div className="overflow-hidden rounded-[1.6rem] border border-black/10 dark:border-white/10">
                    <div className="border-b border-black/10 bg-[#f7f2e8] px-4 py-4 dark:border-white/10 dark:bg-[#1d1e23]">
                        <p className="text-sm font-black tracking-tight">Calendar Rules Table</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-[#fbf8f2] dark:bg-[#17181c]">
                                <tr className="text-left">
                                    <th className="px-4 py-3 font-bold">Title</th>
                                    <th className="px-4 py-3 font-bold">Area</th>
                                    <th className="px-4 py-3 font-bold">Block</th>
                                    <th className="px-4 py-3 font-bold">Dates</th>
                                    <th className="px-4 py-3 font-bold">Public Color</th>
                                    <th className="px-4 py-3 font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length > 0 ? (
                                    rows.map((row) => (
                                        <tr key={row.id} className="border-t border-black/10 dark:border-white/10">
                                            <td className="px-4 py-3 font-semibold">{row.title}</td>
                                            <td className="px-4 py-3">{row.area}</td>
                                            <td className="px-4 py-3">{row.block}</td>
                                            <td className="px-4 py-3">
                                                {row.dateFrom} → {row.dateTo}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${badgeClass(row.statusColor)}`}>
                                                    {row.statusColor}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <ActionButtons
                                                    onEdit={() => startEdit(row)}
                                                    onCancelEdit={resetForm}
                                                    isEditing={editingId === row.id}
                                                    deleting={deletingId === row.id}
                                                    onDelete={async () => {
                                                        setDeletingId(row.id);
                                                        try {
                                                            await onDelete(row.id);
                                                            if (editingId === row.id) {
                                                                resetForm();
                                                            }
                                                        } finally {
                                                            setDeletingId(null);
                                                        }
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-6 text-center text-[#67635d] dark:text-[#bdbdc4]">
                                            No saved calendar rules yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-black/10 p-4 dark:border-white/10">
                        <div className="grid gap-3 text-xs md:grid-cols-3">
                            <div className="rounded-2xl bg-[#ffe5e5] px-3 py-3 font-semibold text-[#a52a2a] dark:bg-[#321818] dark:text-[#ffb1b1]">
                                Red = admin blocked / unavailable
                            </div>
                            <div className="rounded-2xl bg-[#fff0c7] px-3 py-3 font-semibold text-[#8a6500] dark:bg-[#322911] dark:text-[#f3d17a]">
                                Gold = private fully booked
                            </div>
                            <div className="rounded-2xl bg-[#e4eeff] px-3 py-3 font-semibold text-[#1645ac] dark:bg-[#1d2943] dark:text-[#a6c0ff]">
                                Blue = public / government event
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}

function SpacesManagerCard({
    rows,
    onCreate,
    onUpdate,
    onDelete,
}: {
    rows: SpaceRow[];
    onCreate: (payload: SpaceFormState) => Promise<void>;
    onUpdate: (id: RowId, payload: SpaceFormState) => Promise<void>;
    onDelete: (id: RowId) => Promise<void>;
}) {
    const [form, setForm] = useState<SpaceFormState>(initialSpaceForm);
    const [editingId, setEditingId] = useState<RowId | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<RowId | null>(null);

    const resetForm = () => {
        setForm(initialSpaceForm);
        setEditingId(null);
    };

    const handleLightImage = (e: ChangeEvent<HTMLInputElement>) => {
        const file = fileListToFiles(e.target.files, 1)[0] ?? null;

        setForm((prev) => ({
            ...prev,
            lightFile: file,
            lightPreview: file ? URL.createObjectURL(file) : prev.lightPreview,
        }));
    };

    const handleDarkImage = (e: ChangeEvent<HTMLInputElement>) => {
        const file = fileListToFiles(e.target.files, 1)[0] ?? null;

        setForm((prev) => ({
            ...prev,
            darkFile: file,
            darkPreview: file ? URL.createObjectURL(file) : prev.darkPreview,
        }));
    };

    const startEdit = (row: SpaceRow) => {
        setEditingId(row.id);
        setForm({
            title: row.title,
            category: row.category,
            capacity: row.capacity,
            shortDescription: row.shortDescription,
            summary: row.summary,
            details: row.details.join('\n'),
            homepageVisible: row.homepageVisible,
            lightFile: null,
            darkFile: null,
            lightPreview: row.lightImage,
            darkPreview: row.darkImage,
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingId !== null) {
                await onUpdate(editingId, form);
            } else {
                await onCreate(form);
            }

            resetForm();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <article id="spaces-config" className="rounded-[2rem] border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#16171b]">
            <div className="border-b border-black/10 px-5 py-5 dark:border-white/10">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex rounded-full bg-[#e8f2ee] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#174f40] dark:bg-[#18231f] dark:text-[#9dc0ff]">
                        Spaces Content
                    </span>
                    <span className="inline-flex rounded-full bg-[#f7f2e8] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f5b55] dark:bg-[#1d1e23] dark:text-[#c9c9cf]">
                        Create + Update
                    </span>
                </div>

                <h2 className="mt-3 text-2xl font-black tracking-tight">Our Spaces Manager</h2>
                <p className="mt-2 text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                    Edit text content and replace light-mode or dark-mode images independently.
                </p>
            </div>

            <div className="grid gap-6 p-5 xl:grid-cols-[0.95fr_1.05fr]">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {editingId !== null && (
                        <div className="rounded-[1.2rem] bg-[#eaf1ff] px-4 py-3 text-sm font-semibold text-[#1645ac] dark:bg-[#1d2943] dark:text-[#a6c0ff]">
                            Editing existing space
                        </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold">Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                                className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">Category</label>
                            <input
                                type="text"
                                value={form.category}
                                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                                className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">Capacity / Type</label>
                        <input
                            type="text"
                            value={form.capacity}
                            onChange={(e) => setForm((prev) => ({ ...prev, capacity: e.target.value }))}
                            className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">Short Description</label>
                        <textarea
                            value={form.shortDescription}
                            onChange={(e) => setForm((prev) => ({ ...prev, shortDescription: e.target.value }))}
                            rows={3}
                            className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">Summary</label>
                        <textarea
                            value={form.summary}
                            onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
                            rows={3}
                            className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">Detail Bullets (one per line)</label>
                        <textarea
                            value={form.details}
                            onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))}
                            rows={5}
                            className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Light Mode Image {editingId !== null ? '(optional replacement)' : ''}
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLightImage}
                                className="block w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm dark:border-white/10 dark:bg-[#1d1e23]"
                            />
                            <div className="mt-3">
                                <ImagePreviewStrip
                                    images={form.lightPreview ? [form.lightPreview] : []}
                                    emptyLabel="No light-mode image selected yet."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">
                                Dark Mode Image {editingId !== null ? '(optional replacement)' : ''}
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleDarkImage}
                                className="block w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm dark:border-white/10 dark:bg-[#1d1e23]"
                            />
                            <div className="mt-3">
                                <ImagePreviewStrip
                                    images={form.darkPreview ? [form.darkPreview] : []}
                                    emptyLabel="No dark-mode image selected yet."
                                />
                            </div>
                        </div>
                    </div>

                    <label className="flex items-center gap-3 rounded-[1.2rem] bg-[#f7f2e8] px-4 py-3 text-sm dark:bg-[#1d1e23]">
                        <input
                            type="checkbox"
                            checked={form.homepageVisible}
                            onChange={(e) => setForm((prev) => ({ ...prev, homepageVisible: e.target.checked }))}
                            className="h-4 w-4 rounded border-black/20"
                        />
                        <span>Visible in homepage slider</span>
                    </label>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 dark:bg-[#2d47ff]"
                        >
                            {editingId !== null ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {submitting
                                ? editingId !== null
                                    ? 'Updating...'
                                    : 'Saving...'
                                : editingId !== null
                                  ? 'Update Space'
                                  : 'Add Space'}
                        </button>

                        {editingId !== null && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold dark:border-white/10"
                            >
                                <X className="h-4 w-4" />
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>

                <div className="overflow-hidden rounded-[1.6rem] border border-black/10 dark:border-white/10">
                    <div className="border-b border-black/10 bg-[#f7f2e8] px-4 py-4 dark:border-white/10 dark:bg-[#1d1e23]">
                        <p className="text-sm font-black tracking-tight">Spaces Table</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-[#fbf8f2] dark:bg-[#17181c]">
                                <tr className="text-left">
                                    <th className="px-4 py-3 font-bold">Title</th>
                                    <th className="px-4 py-3 font-bold">Category</th>
                                    <th className="px-4 py-3 font-bold">Capacity</th>
                                    <th className="px-4 py-3 font-bold">Homepage</th>
                                    <th className="px-4 py-3 font-bold">Images</th>
                                    <th className="px-4 py-3 font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length > 0 ? (
                                    rows.map((row) => (
                                        <tr key={row.id} className="border-t border-black/10 dark:border-white/10">
                                            <td className="px-4 py-3 font-semibold">{row.title}</td>
                                            <td className="px-4 py-3">{row.category}</td>
                                            <td className="px-4 py-3">{row.capacity}</td>
                                            <td className="px-4 py-3">
                                                {row.homepageVisible ? (
                                                    <span className="rounded-full bg-[#e8f2ee] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#174f40] dark:bg-[#18231f] dark:text-[#9dc0ff]">
                                                        Visible
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-[#f2efe8] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#59544d] dark:bg-[#1d1e23] dark:text-[#c9c9cf]">
                                                        Hidden
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {(row.lightImage ? 1 : 0) + (row.darkImage ? 1 : 0)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <ActionButtons
                                                    onEdit={() => startEdit(row)}
                                                    onCancelEdit={resetForm}
                                                    isEditing={editingId === row.id}
                                                    deleting={deletingId === row.id}
                                                    onDelete={async () => {
                                                        setDeletingId(row.id);
                                                        try {
                                                            await onDelete(row.id);
                                                            if (editingId === row.id) {
                                                                resetForm();
                                                            }
                                                        } finally {
                                                            setDeletingId(null);
                                                        }
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-6 text-center text-[#67635d] dark:text-[#bdbdc4]">
                                            No saved spaces yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </article>
    );
}

function StatsManagerCard({
    rows,
    onCreate,
    onUpdate,
    onDelete,
}: {
    rows: StatRow[];
    onCreate: (payload: StatFormState) => Promise<void>;
    onUpdate: (id: RowId, payload: StatFormState) => Promise<void>;
    onDelete: (id: RowId) => Promise<void>;
}) {
    const [form, setForm] = useState<StatFormState>(initialStatForm);
    const [editingId, setEditingId] = useState<RowId | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<RowId | null>(null);

    const resetForm = () => {
        setForm(initialStatForm);
        setEditingId(null);
    };

    const startEdit = (row: StatRow) => {
        setEditingId(row.id);
        setForm({
            label: row.label,
            value: row.value,
            suffix: row.suffix,
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (editingId !== null) {
                await onUpdate(editingId, form);
            } else {
                await onCreate(form);
            }

            resetForm();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <article className="rounded-[2rem] border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#16171b]">
            <div className="border-b border-black/10 px-5 py-5 dark:border-white/10">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex rounded-full bg-[#e8f2ee] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#174f40] dark:bg-[#18231f] dark:text-[#9dc0ff]">
                        Venue at a Glance
                    </span>
                    <span className="inline-flex rounded-full bg-[#f7f2e8] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f5b55] dark:bg-[#1d1e23] dark:text-[#c9c9cf]">
                        Create + Update
                    </span>
                </div>

                <h2 className="mt-3 text-2xl font-black tracking-tight">Stats Manager</h2>
                <p className="mt-2 text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                    Edit existing stat labels and values, or add new ones for the count-up section.
                </p>
            </div>

            <div className="grid gap-6 p-5 xl:grid-cols-[0.9fr_1.1fr]">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {editingId !== null && (
                        <div className="rounded-[1.2rem] bg-[#eaf1ff] px-4 py-3 text-sm font-semibold text-[#1645ac] dark:bg-[#1d2943] dark:text-[#a6c0ff]">
                            Editing existing stat
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-semibold">Label</label>
                        <input
                            type="text"
                            value={form.label}
                            onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                            className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold">Value</label>
                            <input
                                type="text"
                                value={form.value}
                                onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
                                className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">Suffix</label>
                            <input
                                type="text"
                                value={form.suffix}
                                onChange={(e) => setForm((prev) => ({ ...prev, suffix: e.target.value }))}
                                className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 dark:bg-[#2d47ff]"
                        >
                            {editingId !== null ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {submitting
                                ? editingId !== null
                                    ? 'Updating...'
                                    : 'Saving...'
                                : editingId !== null
                                  ? 'Update Stat'
                                  : 'Add Stat'}
                        </button>

                        {editingId !== null && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold dark:border-white/10"
                            >
                                <X className="h-4 w-4" />
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>

                <div className="overflow-hidden rounded-[1.6rem] border border-black/10 dark:border-white/10">
                    <div className="border-b border-black/10 bg-[#f7f2e8] px-4 py-4 dark:border-white/10 dark:bg-[#1d1e23]">
                        <p className="text-sm font-black tracking-tight">Stats Table</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-[#fbf8f2] dark:bg-[#17181c]">
                                <tr className="text-left">
                                    <th className="px-4 py-3 font-bold">Label</th>
                                    <th className="px-4 py-3 font-bold">Value</th>
                                    <th className="px-4 py-3 font-bold">Suffix</th>
                                    <th className="px-4 py-3 font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length > 0 ? (
                                    rows.map((row) => (
                                        <tr key={row.id} className="border-t border-black/10 dark:border-white/10">
                                            <td className="px-4 py-3 font-semibold">{row.label}</td>
                                            <td className="px-4 py-3">{row.value}</td>
                                            <td className="px-4 py-3">{row.suffix || '—'}</td>
                                            <td className="px-4 py-3">
                                                <ActionButtons
                                                    onEdit={() => startEdit(row)}
                                                    onCancelEdit={resetForm}
                                                    isEditing={editingId === row.id}
                                                    deleting={deletingId === row.id}
                                                    onDelete={async () => {
                                                        setDeletingId(row.id);
                                                        try {
                                                            await onDelete(row.id);
                                                            if (editingId === row.id) {
                                                                resetForm();
                                                            }
                                                        } finally {
                                                            setDeletingId(null);
                                                        }
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-6 text-center text-[#67635d] dark:text-[#bdbdc4]">
                                            No saved stats yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </article>
    );
}

function SiteDetailsCard({
    config,
    setConfig,
    onSave,
}: {
    config: SiteConfigState;
    setConfig: React.Dispatch<React.SetStateAction<SiteConfigState>>;
    onSave: () => Promise<void>;
}) {
    const [saving, setSaving] = useState(false);

    return (
        <article id="footer-config" className="rounded-[2rem] border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#16171b]">
            <div className="border-b border-black/10 px-5 py-5 dark:border-white/10">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex rounded-full bg-[#fff0c7] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8a6500] dark:bg-[#322911] dark:text-[#f3d17a]">
                        Homepage + Footer
                    </span>
                    <span className="inline-flex rounded-full bg-[#f7f2e8] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f5b55] dark:bg-[#1d1e23] dark:text-[#c9c9cf]">
                        Save Settings
                    </span>
                </div>

                <h2 className="mt-3 text-2xl font-black tracking-tight">Location, Assistance, and Footer Config</h2>
                <p className="mt-2 text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                    Edit homepage map links, contact details, and improved footer content.
                </p>
            </div>

            <div className="grid gap-6 p-5 xl:grid-cols-[0.96fr_1.04fr]">
                <div className="space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-semibold">Google Map Embed URL</label>
                        <input
                            type="text"
                            value={config.mapEmbedUrl}
                            onChange={(e) => setConfig((prev) => ({ ...prev, mapEmbedUrl: e.target.value }))}
                            className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">Open Map URL</label>
                        <input
                            type="text"
                            value={config.openMapUrl}
                            onChange={(e) => setConfig((prev) => ({ ...prev, openMapUrl: e.target.value }))}
                            className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">Address</label>
                        <textarea
                            value={config.address}
                            onChange={(e) => setConfig((prev) => ({ ...prev, address: e.target.value }))}
                            rows={3}
                            className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold">Phone</label>
                            <input
                                type="text"
                                value={config.phone}
                                onChange={(e) => setConfig((prev) => ({ ...prev, phone: e.target.value }))}
                                className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">Email</label>
                            <input
                                type="text"
                                value={config.email}
                                onChange={(e) => setConfig((prev) => ({ ...prev, email: e.target.value }))}
                                className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">Footer Description</label>
                        <textarea
                            value={config.footerDescription}
                            onChange={(e) => setConfig((prev) => ({ ...prev, footerDescription: e.target.value }))}
                            rows={4}
                            className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">Footer Copyright</label>
                        <input
                            type="text"
                            value={config.footerCopyright}
                            onChange={(e) => setConfig((prev) => ({ ...prev, footerCopyright: e.target.value }))}
                            className="w-full rounded-[1.2rem] border border-black/10 bg-[#f7f2e8] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#1d1e23]"
                        />
                    </div>

                    <button
                        type="button"
                        disabled={saving}
                        onClick={async () => {
                            setSaving(true);
                            try {
                                await onSave();
                            } finally {
                                setSaving(false);
                            }
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 dark:bg-[#2d47ff]"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Site Settings'}
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="rounded-[1.6rem] bg-[#f7f2e8] p-5 dark:bg-[#1d1e23]">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#174f40] dark:text-[#9dc0ff]">
                            Homepage Map Preview Data
                        </p>

                        <div className="mt-4 space-y-3 text-sm text-[#595651] dark:text-[#c8c8ce]">
                            <div className="flex items-start gap-3 rounded-2xl bg-white/75 px-4 py-3 dark:bg-[#17181c]">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{config.address}</span>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl bg-white/75 px-4 py-3 dark:bg-[#17181c]">
                                <Phone className="h-4 w-4 shrink-0" />
                                <span>{config.phone}</span>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl bg-white/75 px-4 py-3 dark:bg-[#17181c]">
                                <Mail className="h-4 w-4 shrink-0" />
                                <span>{config.email}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[1.6rem] border border-black/10 p-5 dark:border-white/10">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#174f40] dark:text-[#9dc0ff]">
                            Footer Preview Text
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                            {config.footerDescription}
                        </p>
                        <div className="mt-4 rounded-2xl bg-[#f7f2e8] px-4 py-3 text-sm dark:bg-[#1d1e23]">
                            {config.footerCopyright}
                        </div>
                    </div>

                    <div className="rounded-[1.6rem] border border-dashed border-black/10 p-5 text-sm leading-7 text-[#5f5b55] dark:border-white/10 dark:text-[#c8c8ce]">
                        This section stays connected to the site settings table and updates immediately after saving.
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function AdminHomePage({
    initialBcccEvents = [],
    initialCityEvents = [],
    initialPackages = [],
    initialCalendarBlocks = [],
    initialSpaces = [],
    initialStats = [],
    initialSiteConfig = fallbackSiteConfig,
}: AdminHomePageProps) {
    const [bcccEvents, setBcccEvents] = useState<EventRow[]>(initialBcccEvents);
    const [cityEvents, setCityEvents] = useState<EventRow[]>(initialCityEvents);
    const [packages, setPackages] = useState<PackageRow[]>(initialPackages);
    const [calendarBlocks, setCalendarBlocks] = useState<CalendarBlockRow[]>(initialCalendarBlocks);
    const [spaces, setSpaces] = useState<SpaceRow[]>(initialSpaces);
    const [stats, setStats] = useState<StatRow[]>(initialStats);
    const [siteConfig, setSiteConfig] = useState<SiteConfigState>(initialSiteConfig);
    const [notice, setNotice] = useState<NoticeState>(null);

    const totals = useMemo(
        () => ({
            bccc: bcccEvents.length,
            city: cityEvents.length,
            packages: packages.length,
            calendarBlocks: calendarBlocks.length,
            spaces: spaces.length,
            stats: stats.length,
        }),
        [
            bcccEvents.length,
            cityEvents.length,
            packages.length,
            calendarBlocks.length,
            spaces.length,
            stats.length,
        ],
    );

    const announceSuccess = (text: string) => setNotice({ type: 'success', text });
    const announceError = (error: unknown) =>
        setNotice({ type: 'error', text: normalizeErrorMessage(error) });
        const persistSort = async (url: string, body: Record<string, unknown>) => {
        await apiJson(url, 'POST', body);
    };

    const reorderBcccEvents = async (orderedIds: RowId[]) => {
        const previous = bcccEvents;
        const next = reorderByIds(previous, orderedIds);
        setBcccEvents(next);

        try {
            await persistSort('/admin/sort/events', {
                scope: 'bccc',
                ordered_ids: orderedIds,
            });
            announceSuccess('BCCC event order updated.');
        } catch (error) {
            setBcccEvents(previous);
            announceError(error);
            throw error;
        }
    };

    const reorderCityEvents = async (orderedIds: RowId[]) => {
        const previous = cityEvents;
        const next = reorderByIds(previous, orderedIds);
        setCityEvents(next);

        try {
            await persistSort('/admin/sort/events', {
                scope: 'city',
                ordered_ids: orderedIds,
            });
            announceSuccess('City event order updated.');
        } catch (error) {
            setCityEvents(previous);
            announceError(error);
            throw error;
        }
    };

    const reorderPackages = async (orderedIds: RowId[]) => {
        const previous = packages;
        const next = reorderByIds(previous, orderedIds);
        setPackages(next);

        try {
            await persistSort('/admin/sort/packages', {
                ordered_ids: orderedIds,
            });
            announceSuccess('Package order updated.');
        } catch (error) {
            setPackages(previous);
            announceError(error);
            throw error;
        }
    };

    const reorderSpaces = async (orderedIds: RowId[]) => {
        const previous = spaces;
        const next = reorderByIds(previous, orderedIds);
        setSpaces(next);

        try {
            await persistSort('/admin/sort/spaces', {
                ordered_ids: orderedIds,
            });
            announceSuccess('Space order updated.');
        } catch (error) {
            setSpaces(previous);
            announceError(error);
            throw error;
        }
    };

    const reorderStats = async (orderedIds: RowId[]) => {
        const previous = stats;
        const next = reorderByIds(previous, orderedIds);
        setStats(next);

        try {
            await persistSort('/admin/sort/stats', {
                ordered_ids: orderedIds,
            });
            announceSuccess('Homepage stat order updated.');
        } catch (error) {
            setStats(previous);
            announceError(error);
            throw error;
        }
    };
    const createEvent = async (scope: 'bccc' | 'city', payload: EventFormState) => {
        try {
            const formData = new FormData();
            formData.append('scope', scope);
            formData.append('title', payload.title);
            formData.append('venue', payload.venue);
            formData.append('date', payload.date);
            formData.append('time', payload.time);
            formData.append('description', payload.description);
            formData.append('note', payload.note);
            formData.append('highlighted', payload.highlighted ? '1' : '0');
            formData.append('is_public', '1');

            payload.files.slice(0, 3).forEach((file) => {
                formData.append('images[]', file);
            });

            const data = await apiFormSubmit<{ item: EventRow }>('/admin/events', formData);
            const item = data.item;

            if (scope === 'bccc') {
                setBcccEvents((prev) => [item, ...prev]);
            } else {
                setCityEvents((prev) => [item, ...prev]);
            }

            announceSuccess(`${scope === 'bccc' ? 'BCCC' : 'City'} event saved successfully.`);
        } catch (error) {
            announceError(error);
            throw error;
        }
    };

    const updateEvent = async (scope: 'bccc' | 'city', id: RowId, payload: EventFormState) => {
        try {
            const formData = new FormData();
            formData.append('scope', scope);
            formData.append('title', payload.title);
            formData.append('venue', payload.venue);
            formData.append('date', payload.date);
            formData.append('time', payload.time);
            formData.append('description', payload.description);
            formData.append('note', payload.note);
            formData.append('highlighted', payload.highlighted ? '1' : '0');
            formData.append('is_public', '1');

            payload.files.slice(0, 3).forEach((file) => {
                formData.append('images[]', file);
            });

            const data = await apiFormSubmit<{ item: EventRow }>(`/admin/events/${id}`, formData, 'PUT');
            const item = data.item;

            if (scope === 'bccc') {
                setBcccEvents((prev) => replaceById(prev, item));
            } else {
                setCityEvents((prev) => replaceById(prev, item));
            }

            announceSuccess('Event updated successfully.');
        } catch (error) {
            announceError(error);
            throw error;
        }
    };

    const deleteEvent = async (scope: 'bccc' | 'city', id: RowId) => {
        try {
            await apiJson(`/admin/events/${id}`, 'DELETE');

            if (scope === 'bccc') {
                setBcccEvents((prev) => prev.filter((item) => item.id !== id));
            } else {
                setCityEvents((prev) => prev.filter((item) => item.id !== id));
            }

            announceSuccess('Event deleted successfully.');
        } catch (error) {
            announceError(error);
            throw error;
        }
    };

    const createPackage = async (payload: PackageFormState) => {
        try {
            const formData = new FormData();
            formData.append('title', payload.title);
            formData.append('description', payload.description);

            payload.files.slice(0, 3).forEach((file) => {
                formData.append('images[]', file);
            });

            const data = await apiFormSubmit<{ item: PackageRow }>('/admin/packages', formData);
            setPackages((prev) => [data.item, ...prev]);
            announceSuccess('Package saved successfully.');
        } catch (error) {
            announceError(error);
            throw error;
        }
    };

    const updatePackage = async (id: RowId, payload: PackageFormState) => {
        try {
            const formData = new FormData();
            formData.append('title', payload.title);
            formData.append('description', payload.description);

            payload.files.slice(0, 3).forEach((file) => {
                formData.append('images[]', file);
            });

            const data = await apiFormSubmit<{ item: PackageRow }>(`/admin/packages/${id}`, formData, 'PUT');
            setPackages((prev) => replaceById(prev, data.item));
            announceSuccess('Package updated successfully.');
        } catch (error) {
            announceError(error);
            throw error;
        }
    };

    const deletePackage = async (id: RowId) => {
        try {
            await apiJson(`/admin/packages/${id}`, 'DELETE');
            setPackages((prev) => prev.filter((item) => item.id !== id));
            announceSuccess('Package deleted successfully.');
        } catch (error) {
            announceError(error);
            throw error;
        }
    };

    const createCalendarBlock = async (payload: CalendarBlockFormState) => {
        try {
            const data = await apiJson<{
                block: {
                    id: RowId;
                    title: string;
                    area: string;
                    note?: string;
                    block: 'AM' | 'PM' | 'EVE' | 'DAY';
                    public_status: 'red' | 'gold' | 'blue';
                    date_from: string;
                    date_to: string;
                };
            }>('/calendar-blocks', 'POST', {
                title: payload.title,
                area: payload.area,
                notes: payload.note,
                block: payload.block,
                public_status: payload.statusColor,
                date_from: payload.dateFrom,
                date_to: payload.dateTo,
            });

            const item: CalendarBlockRow = {
                id: data.block.id,
                title: data.block.title,
                area: data.block.area,
                note: data.block.note ?? '',
                block: data.block.block,
                statusColor: data.block.public_status,
                dateFrom: data.block.date_from,
                dateTo: data.block.date_to,
            };

            setCalendarBlocks((prev) => [item, ...prev]);
            announceSuccess('Calendar rule saved successfully.');
        } catch (error) {
            announceError(error);
            throw error;
        }
    };
        const updateCalendarBlock = async (id: RowId, payload: CalendarBlockFormState) => {
        try {
            const data = await apiJson<{
                block: {
                    id: RowId;
                    title: string;
                    area: string;
                    note?: string;
                    block: 'AM' | 'PM' | 'EVE' | 'DAY';
                    public_status: 'red' | 'gold' | 'blue';
                    date_from: string;
                    date_to: string;
                };
            }>(`/calendar-blocks/${id}`, 'PUT', {
                title: payload.title,
                area: payload.area,
                notes: payload.note,
                block: payload.block,
                public_status: payload.statusColor,
                date_from: payload.dateFrom,
                date_to: payload.dateTo,
            });

            const item: CalendarBlockRow = {
                id: data.block.id,
                title: data.block.title,
                area: data.block.area,
                note: data.block.note ?? '',
                block: data.block.block,
                statusColor: data.block.public_status,
                dateFrom: data.block.date_from,
                dateTo: data.block.date_to,
            };

            setCalendarBlocks((prev) => replaceById(prev, item));
            announceSuccess('Calendar rule updated successfully.');
        } catch (error) {
            announceError(error);
            throw error;
        }
    };
    const deleteCalendarBlock = async (id: RowId) => {
        try {
            await apiJson(`/calendar-blocks/${id}`, 'DELETE');
            setCalendarBlocks((prev) => prev.filter((item) => item.id !== id));
            announceSuccess('Calendar rule deleted successfully.');
        } catch (error) {
            announceError(error);
            throw error;
        }
    };

    const createSpace = async (payload: SpaceFormState) => {
        try {
            const formData = new FormData();
            formData.append('title', payload.title);
            formData.append('category', payload.category);
            formData.append('capacity', payload.capacity);
            formData.append('short_description', payload.shortDescription);
            formData.append('summary', payload.summary);
            formData.append('homepage_visible', payload.homepageVisible ? '1' : '0');

            payload.details
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean)
                .forEach((detail, index) => {
                    formData.append(`details[${index}]`, detail);
                });

            if (payload.lightFile) {
                formData.append('light_image', payload.lightFile);
            }

            if (payload.darkFile) {
                formData.append('dark_image', payload.darkFile);
            }

            const data = await apiFormSubmit<{ item: SpaceRow }>('/admin/spaces', formData);
            setSpaces((prev) => [data.item, ...prev]);
            announceSuccess('Space saved successfully.');
        } catch (error) {
            announceError(error);
            throw error;
        }
    };

    const updateSpace = async (id: RowId, payload: SpaceFormState) => {
        try {
            const formData = new FormData();
            formData.append('title', payload.title);
            formData.append('category', payload.category);
            formData.append('capacity', payload.capacity);
            formData.append('short_description', payload.shortDescription);
            formData.append('summary', payload.summary);
            formData.append('homepage_visible', payload.homepageVisible ? '1' : '0');

            payload.details
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean)
                .forEach((detail, index) => {
                    formData.append(`details[${index}]`, detail);
                });

            if (payload.lightFile) {
                formData.append('light_image', payload.lightFile);
            }

            if (payload.darkFile) {
                formData.append('dark_image', payload.darkFile);
            }

            const data = await apiFormSubmit<{ item: SpaceRow }>(`/admin/spaces/${id}`, formData, 'PUT');
            setSpaces((prev) => replaceById(prev, data.item));
            announceSuccess('Space updated successfully.');
        } catch (error) {
            announceError(error);
            throw error;
        }
    };

    const deleteSpace = async (id: RowId) => {
        try {
            await apiJson(`/admin/spaces/${id}`, 'DELETE');
            setSpaces((prev) => prev.filter((item) => item.id !== id));
            announceSuccess('Space deleted successfully.');
        } catch (error) {
            announceError(error);
            throw error;
        }
    };

    const createStat = async (payload: StatFormState) => {
        try {
            const data = await apiJson<{ item: StatRow }>('/admin/stats', 'POST', {
                label: payload.label,
                value: payload.value,
                suffix: payload.suffix,
            });

            setStats((prev) => [data.item, ...prev]);
            announceSuccess('Homepage stat saved successfully.');
        } catch (error) {
            announceError(error);
            throw error;
        }
    };

    const updateStat = async (id: RowId, payload: StatFormState) => {
        try {
            const data = await apiJson<{ item: StatRow }>(`/admin/stats/${id}`, 'PUT', {
                label: payload.label,
                value: payload.value,
                suffix: payload.suffix,
            });

            setStats((prev) => replaceById(prev, data.item));
            announceSuccess('Homepage stat updated successfully.');
        } catch (error) {
            announceError(error);
            throw error;
        }
    };

    const deleteStat = async (id: RowId) => {
        try {
            await apiJson(`/admin/stats/${id}`, 'DELETE');
            setStats((prev) => prev.filter((item) => item.id !== id));
            announceSuccess('Homepage stat deleted successfully.');
        } catch (error) {
            announceError(error);
            throw error;
        }
    };

    const saveSiteSettings = async () => {
        try {
            const data = await apiJson<{ item: SiteConfigState }>('/admin/site-settings', 'PUT', {
                map_embed_url: siteConfig.mapEmbedUrl,
                open_map_url: siteConfig.openMapUrl,
                address: siteConfig.address,
                phone: siteConfig.phone,
                email: siteConfig.email,
                footer_description: siteConfig.footerDescription,
                footer_copyright: siteConfig.footerCopyright,
            });

            setSiteConfig(data.item);
            announceSuccess('Site settings saved successfully.');
        } catch (error) {
            announceError(error);
            throw error;
        }
    };

    return (
        <AdminLayout
            title="Frontend Admin Home and Config Console"
            subtitle="This polish version adds update buttons, replacement-image editing, and cleaner admin table workflow while keeping the same connected backend."
        >
            <Head title="Admin Home" />

            <div className="space-y-6">
                <NoticeBanner notice={notice} />

                <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                    <SummaryCard
                        icon={Megaphone}
                        title="BCCC Events"
                        value={String(totals.bccc)}
                        note="Saved convention-center public event rows"
                    />
                    <SummaryCard
                        icon={ScrollText}
                        title="City Events"
                        value={String(totals.city)}
                        note="Saved Baguio City public event rows"
                        tone="blue"
                    />
                    <SummaryCard
                        icon={Package2}
                        title="Packages"
                        value={String(totals.packages)}
                        note="Saved feature package rows"
                    />
                    <SummaryCard
                        icon={CalendarDays}
                        title="Calendar Rules"
                        value={String(totals.calendarBlocks)}
                        note="Saved red, gold, and blue rules"
                        tone="gold"
                    />
                    <SummaryCard
                        icon={LayoutGrid}
                        title="Spaces"
                        value={String(totals.spaces)}
                        note="Saved homepage slider and facility rows"
                    />
                    <SummaryCard
                        icon={PanelsTopLeft}
                        title="Homepage Stats"
                        value={String(totals.stats)}
                        note="Saved animated count rows"
                    />
                </section>

                <section id="events-config" className="space-y-6">
                    <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#16171b]">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                            Config Section
                        </p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight">Events Manager</h2>
                        <p className="mt-3 text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                            This stays separated into BCCC Events and Baguio City Events, now with inline edit/update support.
                        </p>
                    </div>

                    <EventManagerCard
                        title="BCCC Events Form and Table"
                        scopeLabel="bccc"
                        rows={bcccEvents}
                        onCreate={(payload) => createEvent('bccc', payload)}
                        onUpdate={(id, payload) => updateEvent('bccc', id, payload)}
                        onDelete={(id) => deleteEvent('bccc', id)}
                    />

                    <EventManagerCard
                        title="Baguio City Events Form and Table"
                        scopeLabel="city"
                        rows={cityEvents}
                        onCreate={(payload) => createEvent('city', payload)}
                        onUpdate={(id, payload) => updateEvent('city', id, payload)}
                        onDelete={(id) => deleteEvent('city', id)}
                    />
                </section>

                <PackageManagerCard
                    rows={packages}
                    onCreate={createPackage}
                    onUpdate={updatePackage}
                    onDelete={deletePackage}
                />

                <CalendarBlockManagerCard
                    rows={calendarBlocks}
                    onCreate={createCalendarBlock}
                    onUpdate={updateCalendarBlock}
                    onDelete={deleteCalendarBlock}
                />

                <SpacesManagerCard
                    rows={spaces}
                    onCreate={createSpace}
                    onUpdate={updateSpace}
                    onDelete={deleteSpace}
                />

                <section id="homepage-config" className="grid gap-6 xl:grid-cols-2">
                    <StatsManagerCard
                        rows={stats}
                        onCreate={createStat}
                        onUpdate={updateStat}
                        onDelete={deleteStat}
                    />

                    <SiteDetailsCard
                        config={siteConfig}
                        setConfig={setSiteConfig}
                        onSave={saveSiteSettings}
                    />
                </section>
                                <section id="sort-config" className="grid gap-6 xl:grid-cols-2">
                    <SortOrderBoard
                        title="BCCC Events Display Order"
                        description="Drag or move the saved BCCC event cards to control how they appear in the admin-managed ordering."
                        items={bcccEvents.map((item) => ({
                            id: item.id,
                            title: item.title,
                            subtitle: item.date,
                        }))}
                        onReorder={reorderBcccEvents}
                    />

                    <SortOrderBoard
                        title="Baguio City Events Display Order"
                        description="Adjust the ordering of city event cards for the public-facing event flow."
                        items={cityEvents.map((item) => ({
                            id: item.id,
                            title: item.title,
                            subtitle: item.date,
                        }))}
                        onReorder={reorderCityEvents}
                    />

                    <SortOrderBoard
                        title="Package Display Order"
                        description="Set the order for special offers and package cards."
                        items={packages.map((item) => ({
                            id: item.id,
                            title: item.title,
                            subtitle: 'Feature package',
                        }))}
                        onReorder={reorderPackages}
                    />

                    <SortOrderBoard
                        title="Spaces Display Order"
                        description="Set the order for venue spaces shown on the public facilities and homepage space flows."
                        items={spaces.map((item) => ({
                            id: item.id,
                            title: item.title,
                            subtitle: item.category,
                        }))}
                        onReorder={reorderSpaces}
                    />

                    <SortOrderBoard
                        title="Homepage Stats Display Order"
                        description="Set the order for the Venue at a Glance count-up cards."
                        items={stats.map((item) => ({
                            id: item.id,
                            title: item.label,
                            subtitle: `${item.value}${item.suffix ?? ''}`,
                        }))}
                        onReorder={reorderStats}
                    />
                </section>
                <section id="system-config" className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#16171b]">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174f40] dark:text-[#9dc0ff]">
                        Polish Status
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight">What this pass adds</h2>

                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div className="rounded-[1.4rem] bg-[#f7f2e8] p-4 transition hover:-translate-y-0.5 dark:bg-[#1d1e23]">
                            <p className="flex items-center gap-2 text-sm font-bold">
                                <Edit3 className="h-4 w-4 text-[#174f40] dark:text-[#9dc0ff]" />
                                Real update buttons
                            </p>
                            <p className="mt-3 text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                                Events, packages, spaces, and stats can now be edited and updated instead of only created or deleted.
                            </p>
                        </div>

                        <div className="rounded-[1.4rem] bg-[#f7f2e8] p-4 transition hover:-translate-y-0.5 dark:bg-[#1d1e23]">
                            <p className="flex items-center gap-2 text-sm font-bold">
                                <ImageIcon className="h-4 w-4 text-[#174f40] dark:text-[#9dc0ff]" />
                                Replacement image UI
                            </p>
                            <p className="mt-3 text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                                Existing images now appear in the edit form preview, and new uploads can replace them cleanly.
                            </p>
                        </div>

                        <div className="rounded-[1.4rem] bg-[#f7f2e8] p-4 transition hover:-translate-y-0.5 dark:bg-[#1d1e23]">
                            <p className="flex items-center gap-2 text-sm font-bold">
                                <Clock3 className="h-4 w-4 text-[#174f40] dark:text-[#9dc0ff]" />
                                Calendar rules note
                            </p>
                            <p className="mt-3 text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                                Calendar rules remain create/delete only in this pass because no update endpoint was part of the currently visible route set.
                            </p>
                        </div>

                        <div className="rounded-[1.4rem] bg-[#f7f2e8] p-4 transition hover:-translate-y-0.5 dark:bg-[#1d1e23]">
                            <p className="flex items-center gap-2 text-sm font-bold">
                                <ShieldCheck className="h-4 w-4 text-[#174f40] dark:text-[#9dc0ff]" />
                                Cleaner admin workflow
                            </p>
                            <p className="mt-3 text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                                Each section now uses a single create/edit form instead of forcing a separate update page.
                            </p>
                        </div>

                        <div className="rounded-[1.4rem] bg-[#f7f2e8] p-4 transition hover:-translate-y-0.5 dark:bg-[#1d1e23]">
                            <p className="flex items-center gap-2 text-sm font-bold">
                                <PanelsTopLeft className="h-4 w-4 text-[#174f40] dark:text-[#9dc0ff]" />
                                Same backend, smoother UI
                            </p>
                            <p className="mt-3 text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                                This page still uses the same connected backend endpoints from the previous batch, with a more complete admin experience layered on top.
                            </p>
                        </div>

                        <div className="rounded-[1.4rem] bg-[#f7f2e8] p-4 transition hover:-translate-y-0.5 dark:bg-[#1d1e23]">
                            <p className="flex items-center gap-2 text-sm font-bold">
                                <LayoutGrid className="h-4 w-4 text-[#174f40] dark:text-[#9dc0ff]" />
                                Next optional step
                            </p>
                            <p className="mt-3 text-sm leading-7 text-[#595651] dark:text-[#c8c8ce]">
                                The next optional pass would be adding drag-and-drop sort ordering and a dedicated calendar-rule update endpoint.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
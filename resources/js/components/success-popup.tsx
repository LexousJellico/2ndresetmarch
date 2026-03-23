import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Info, X } from 'lucide-react';

export type PencilBookedPopupPayload = {
  requestedAtIso: string;
  dueAtIso: string;
};

const STORAGE_KEY = '__pencil_booked_success_popup__';
const EVENT_NAME = 'pencil-booked-success-popup';

/**
 * Call this after the booking is successfully saved.
 * It will show the popup even if Inertia redirects to another page.
 */
export function triggerPencilBookedSuccessPopup(payload: PencilBookedPopupPayload) {
  // store for "next page" load
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage errors (private mode etc.)
  }

  // also notify immediately if layout is already mounted
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: payload }));
  } catch {
    // ignore
  }
}

function safeReadFromSession(): PencilBookedPopupPayload | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    // remove immediately so it doesn't show again on refresh/back
    sessionStorage.removeItem(STORAGE_KEY);

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const { requestedAtIso, dueAtIso } = parsed as any;
    if (typeof requestedAtIso !== 'string' || typeof dueAtIso !== 'string') return null;

    return { requestedAtIso, dueAtIso };
  } catch {
    return null;
  }
}

function formatDateTimeLocal(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PencilBookedSuccessPopup() {
  const [payload, setPayload] = useState<PencilBookedPopupPayload | null>(null);
  const timerRef = useRef<number | null>(null);

  const close = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPayload(null);
  };

  const show = (p: PencilBookedPopupPayload) => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setPayload(p);

    // auto close after 5 seconds
    timerRef.current = window.setTimeout(() => {
      setPayload(null);
      timerRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    // 1) show if a previous page stored it (redirect case)
    const fromSession = safeReadFromSession();
    if (fromSession) show(fromSession);

    // 2) listen for immediate triggers (no redirect case)
    const handler = (e: Event) => {
      const ce = e as CustomEvent<PencilBookedPopupPayload>;
      if (!ce?.detail) return;

      // if it was stored, remove to avoid repeat
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}

      show(ce.detail);
    };

    window.addEventListener(EVENT_NAME, handler);

    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  if (!payload) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-[9999] flex justify-center px-4" role="status" aria-live="polite">
      <div className="w-full max-w-xl rounded-lg border bg-background shadow-lg">
        <div className="flex items-start gap-3 p-4">
          {/* icon */}
          <div className="mt-0.5 rounded-full bg-emerald-600/10 p-2">
            <Info className="h-5 w-5 text-emerald-600" />
          </div>

          {/* content */}
          <div className="min-w-0 flex-1">
            <div className="text-base font-extrabold leading-tight">SUCCESS!</div>
            <div className="text-sm font-semibold leading-tight">YOUR BOOKING IS PENCIL BOOKED FOR 24 HRS...</div>

            <div className="mt-3 text-sm leading-snug">
              <div className="flex items-start gap-2">
                <Info className="mt-[2px] h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <div className="font-semibold">
                    KINDLY SETLE YOUR PAYMENT ON OR BEFORE{' '}
                    <span className="underline underline-offset-2">{formatDateTimeLocal(payload.dueAtIso)}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Automatic declined status on the booking if not been accomplished.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* close */}
          <Button type="button" variant="ghost" size="icon" onClick={close} aria-label="Close notice" title="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

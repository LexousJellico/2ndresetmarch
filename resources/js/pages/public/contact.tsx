import { FormEvent, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarDays, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import PublicLayout, { type SiteSettings } from '@/layouts/public-layout';

export default function ContactPage() {
  const page = usePage<{ siteSettings?: SiteSettings }>();
  const siteSettings = page.props.siteSettings;

  const address =
    siteSettings?.address ?? 'CH3X+RRW, Baguio, Benguet, Philippines';
  const phone = siteSettings?.phone ?? '(074) 446 2009';
  const email = siteSettings?.email ?? 'info@bccc-ease.com';
  const openMapUrl =
    siteSettings?.openMapUrl ??
    'https://www.google.com/maps/search/?api=1&query=CH3X%2BRRW%2C%20Baguio%2C%20Benguet%2C%20Philippines';

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
  };

  return (
    <PublicLayout>
      <Head title="Contact" />

      <section className="mx-auto w-full max-w-7xl space-y-10 px-4 pb-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-neutral-950 dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
          <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-5 px-6 py-8 sm:px-8 sm:py-10">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                Contact &amp; Assistance
              </span>

              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                  Reach the venue for inquiries and coordination
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                  Use the contact details below for assistance, or send a message
                  through the inquiry form for coordination.
                </p>
              </div>

              <div className="grid gap-4">
                <a
                  href={openMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 rounded-2xl border border-black/5 bg-slate-50 px-4 py-4 transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-emerald-400/30 dark:hover:bg-emerald-500/10"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{address}</span>
                </a>

                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-3 rounded-2xl border border-black/5 bg-slate-50 px-4 py-4 transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-emerald-400/30 dark:hover:bg-emerald-500/10"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{phone}</span>
                </a>

                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 rounded-2xl border border-black/5 bg-slate-50 px-4 py-4 transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-emerald-400/30 dark:hover:bg-emerald-500/10"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>{email}</span>
                </a>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/calendar"
                  className="inline-flex items-center gap-2 rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-[#2d47ff]"
                >
                  <CalendarDays className="h-4 w-4" />
                  Check Calendar
                </Link>

                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  <Sparkles className="h-4 w-4" />
                  View Events
                </Link>
              </div>
            </div>

            <div className="border-t border-black/5 bg-[#f7f5ef] px-6 py-8 dark:border-white/10 dark:bg-white/5 lg:border-l lg:border-t-0">
              <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#121318] sm:p-8">
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
                    Inquiry Form
                  </div>
                  <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    Send a message
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <input
                    type="text"
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                    required
                  />

                  <input
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Subject"
                    value={form.subject}
                    onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                    className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                    required
                  />

                  <textarea
                    placeholder="Write your message here"
                    value={form.message}
                    onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                    rows={6}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
                    required
                  />

                  <button
                    type="submit"
                    className="inline-flex items-center rounded-full bg-[#174f40] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-[#2d47ff]"
                  >
                    Send Inquiry
                  </button>

                  {submitted && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                      Inquiry form UI is working. If you want, the next batch can connect this to backend mail handling or database storage.
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

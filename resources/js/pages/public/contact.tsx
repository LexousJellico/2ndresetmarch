import { FormEvent, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CalendarDays, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import PublicLayout from '@/layouts/public-layout';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
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
      <Head title="Contact Us | BCCC EASE" />

      <section className="relative overflow-hidden px-4 pb-16 pt-32 md:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[#ece7dc] dark:bg-[#3d3d40]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.16),transparent_28%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_24%)]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e7f4ef] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#12906a] dark:bg-[#26334d] dark:text-[#9bb8ff]">
            <Sparkles className="h-4 w-4" />
            Contact & Assistance
          </div>

          <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Reach out for venue inquiries, event assistance, or booking guidance.
          </h1>

          <p className="mt-6 max-w-3xl text-sm leading-8 text-[#5a554d] dark:text-white/75 md:text-base">
            This contact page is designed as a polished public entry point for venue
            questions and event-related communication. The form is currently a front-end
            placeholder and can later be connected to Laravel mail or database handling.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 md:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.55 }}
            className="space-y-6"
          >
            <div className="rounded-[34px] bg-white p-8 shadow-xl dark:bg-[#3a3a3d]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#12906a] dark:text-[#7da7ff]">
                Contact Information
              </p>
              <h2 className="mt-3 text-3xl font-bold">How to reach us</h2>

              <div className="mt-8 space-y-4">
                <div className="rounded-[24px] bg-[#f7f4ee] p-5 dark:bg-[#2f2f33]">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-[#12906a] dark:text-[#9bb8ff]" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7c776f] dark:text-white/55">
                        Address
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[#5a554d] dark:text-white/75">
                        Baguio Convention and Cultural Center, Baguio City, Benguet,
                        Philippines
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] bg-[#f7f4ee] p-5 dark:bg-[#2f2f33]">
                  <div className="flex items-start gap-3">
                    <Phone className="mt-1 h-5 w-5 text-[#12906a] dark:text-[#9bb8ff]" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7c776f] dark:text-white/55">
                        Phone
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[#5a554d] dark:text-white/75">
                        +63 74 000 0000
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] bg-[#f7f4ee] p-5 dark:bg-[#2f2f33]">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-1 h-5 w-5 text-[#12906a] dark:text-[#9bb8ff]" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7c776f] dark:text-white/55">
                        Email
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[#5a554d] dark:text-white/75">
                        info@bccc-ease.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[34px] bg-white shadow-xl dark:bg-[#3a3a3d]">
              <img
                src="/marketing/images/maps/bccc-map.jpg"
                alt="BCCC map"
                className="h-72 w-full object-cover"
              />
              <div className="p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#12906a] dark:text-[#7da7ff]">
                  Quick Actions
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/bookings/create"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#12906a] px-5 py-3 text-sm font-semibold text-white dark:bg-[#2d47ff]"
                  >
                    <CalendarDays className="h-4 w-4" />
                    Start Booking
                  </Link>
                  <Link
                    href="/facilities"
                    className="inline-flex items-center justify-center rounded-full border border-black/10 px-5 py-3 text-sm font-semibold dark:border-white/15"
                  >
                    Explore Facilities
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.65 }}
            className="rounded-[34px] bg-white p-8 shadow-xl dark:bg-[#3a3a3d]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#12906a] dark:text-[#7da7ff]">
              Inquiry Form
            </p>
            <h2 className="mt-3 text-3xl font-bold">Send a message</h2>

            {submitted && (
              <div className="mt-6 rounded-[22px] bg-[#e8f6f1] px-4 py-3 text-sm font-medium text-[#0f6f53] dark:bg-[#20334d] dark:text-[#a9c3ff]">
                Your placeholder inquiry was submitted locally. You can connect this to
                Laravel mail handling later.
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-[20px] border border-black/10 bg-[#f7f4ee] px-4 py-3 text-sm outline-none transition focus:border-[#12906a] dark:border-white/10 dark:bg-[#2f2f33] dark:focus:border-[#7da7ff]"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-[20px] border border-black/10 bg-[#f7f4ee] px-4 py-3 text-sm outline-none transition focus:border-[#12906a] dark:border-white/10 dark:bg-[#2f2f33] dark:focus:border-[#7da7ff]"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  className="w-full rounded-[20px] border border-black/10 bg-[#f7f4ee] px-4 py-3 text-sm outline-none transition focus:border-[#12906a] dark:border-white/10 dark:bg-[#2f2f33] dark:focus:border-[#7da7ff]"
                  placeholder="Enter your subject"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                  className="min-h-[180px] w-full rounded-[24px] border border-black/10 bg-[#f7f4ee] px-4 py-3 text-sm outline-none transition focus:border-[#12906a] dark:border-white/10 dark:bg-[#2f2f33] dark:focus:border-[#7da7ff]"
                  placeholder="Type your inquiry here"
                  required
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-[#12906a] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl dark:bg-[#2d47ff]"
              >
                Submit Inquiry
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
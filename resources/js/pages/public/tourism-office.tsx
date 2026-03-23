import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from 'lucide-react';
import PublicLayout from '@/layouts/public-layout';

const services = [
  'Visitor information and basic tourism guidance',
  'Public assistance and venue-related inquiries',
  'Coordination support for tourism-linked activities',
  'Reference point for local destination orientation',
];

const supportNotes = [
  'Tourism-linked public coordination',
  'Visitor support and destination guidance',
  'Venue-related information assistance',
];

export default function TourismOfficePage() {
  return (
    <PublicLayout>
      <Head title="Tourism Office | BCCC EASE" />

      <section className="relative overflow-hidden px-4 pb-16 pt-32 md:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[#ece7dc] dark:bg-[#3d3d40]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.16),transparent_28%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_24%)]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e7f4ef] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#12906a] dark:bg-[#26334d] dark:text-[#9bb8ff]">
            <Sparkles className="h-4 w-4" />
            Tourism Office
          </div>

          <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Visitor assistance and tourism-related support within the venue setting.
          </h1>

          <p className="mt-6 max-w-3xl text-sm leading-8 text-[#5a554d] dark:text-white/75 md:text-base">
            This page serves as the public-facing tourism assistance area for the Baguio
            Convention and Cultural Center environment. It can support visitor
            information, venue-linked guidance, public coordination, and tourism-related
            assistance content.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 md:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.55 }}
            className="rounded-[34px] bg-white p-8 shadow-xl dark:bg-[#3a3a3d]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#12906a] dark:text-[#7da7ff]">
              About the Office
            </p>
            <h2 className="mt-3 text-3xl font-bold">Tourism coordination point</h2>

            <p className="mt-5 text-sm leading-8 text-[#5a554d] dark:text-white/75 md:text-base">
              The Tourism Office section complements the center’s identity as both a
              civic venue and a public destination. It can be used to present local
              visitor assistance, event-related public guidance, and tourism-connected
              information in a more official and welcoming format.
            </p>

            <p className="mt-4 text-sm leading-8 text-[#5a554d] dark:text-white/75 md:text-base">
              This page may later be expanded with destination highlights, official
              tourism updates, public advisories, city partnerships, or visitor
              services that relate to activities hosted within the venue ecosystem.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {services.map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] bg-[#f7f4ee] p-4 text-sm leading-7 text-[#4c4843] dark:bg-[#2f2f33] dark:text-white/75"
                >
                  • {item}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#12906a] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl dark:bg-[#2d47ff]"
              >
                Contact the Office
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/events"
                className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-sm font-semibold transition hover:bg-white/60 dark:border-white/15 dark:hover:bg-white/5"
              >
                View Public Events
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.65 }}
            className="space-y-6"
          >
            <div className="rounded-[34px] bg-white p-8 shadow-xl dark:bg-[#3a3a3d]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#12906a] dark:text-[#7da7ff]">
                Public Information
              </p>
              <h2 className="mt-3 text-3xl font-bold">Office details</h2>

              <div className="mt-6 space-y-4">
                <div className="rounded-[24px] bg-[#f7f4ee] p-4 dark:bg-[#2f2f33]">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-[#12906a] dark:text-[#9bb8ff]" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7c776f] dark:text-white/55">
                        Address
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[#5a554d] dark:text-white/75">
                        Baguio Convention and Cultural Center, Baguio City
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] bg-[#f7f4ee] p-4 dark:bg-[#2f2f33]">
                  <div className="flex items-start gap-3">
                    <Phone className="mt-1 h-5 w-5 text-[#12906a] dark:text-[#9bb8ff]" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7c776f] dark:text-white/55">
                        Contact Number
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[#5a554d] dark:text-white/75">
                        +63 74 000 0000
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] bg-[#f7f4ee] p-4 dark:bg-[#2f2f33]">
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

                <div className="rounded-[24px] bg-[#f7f4ee] p-4 dark:bg-[#2f2f33]">
                  <div className="flex items-start gap-3">
                    <Clock3 className="mt-1 h-5 w-5 text-[#12906a] dark:text-[#9bb8ff]" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7c776f] dark:text-white/55">
                        Office Hours
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[#5a554d] dark:text-white/75">
                        Monday to Friday, 8:00 AM to 5:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[34px] bg-white p-8 shadow-xl dark:bg-[#3a3a3d]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#12906a] dark:text-[#7da7ff]">
                Support Scope
              </p>
              <h2 className="mt-3 text-2xl font-bold">What this page can hold</h2>

              <div className="mt-6 space-y-3">
                {supportNotes.map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] bg-[#f7f4ee] px-4 py-3 text-sm leading-7 text-[#4c4843] dark:bg-[#2f2f33] dark:text-white/75"
                  >
                    • {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
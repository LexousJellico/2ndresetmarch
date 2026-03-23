import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Landmark, Sparkles, Trees } from 'lucide-react';

export default function WelcomeSection() {
  return (
    <section className="relative px-4 pb-12 pt-24 md:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e7f4ef] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#12906a] dark:bg-[#26334d] dark:text-[#9bb8ff]">
            <Sparkles className="h-4 w-4" />
            Welcome to BCCC
          </div>

          <h2 className="mt-5 max-w-2xl text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
            A destination for conventions, culture, and memorable city events.
          </h2>

          <p className="mt-6 max-w-2xl text-sm leading-8 text-[#5a554d] dark:text-white/75 md:text-base">
            The Baguio Convention and Cultural Center stands as a dynamic venue where
            public programs, conferences, exhibitions, performances, and civic
            gatherings come together in a setting shaped by heritage and hospitality.
          </p>

          <p className="mt-4 max-w-2xl text-sm leading-8 text-[#5a554d] dark:text-white/75 md:text-base">
            Designed to welcome both formal and creative experiences, the center offers
            versatile spaces supported by a strong visual identity, event-readiness,
            and the distinct atmosphere of Baguio City.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[26px] bg-white p-5 shadow-md dark:bg-[#3a3a3d]">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef6f2] text-[#12906a] dark:bg-[#24314f] dark:text-[#9bb8ff]">
                <Landmark className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold">Heritage Venue</h3>
              <p className="mt-2 text-sm leading-6 text-[#6a655d] dark:text-white/65">
                A civic space with cultural and public significance.
              </p>
            </div>

            <div className="rounded-[26px] bg-white p-5 shadow-md dark:bg-[#3a3a3d]">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef6f2] text-[#12906a] dark:bg-[#24314f] dark:text-[#9bb8ff]">
                <Trees className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold">Baguio Atmosphere</h3>
              <p className="mt-2 text-sm leading-6 text-[#6a655d] dark:text-white/65">
                Rooted in the City of Pines’ cool and distinctive character.
              </p>
            </div>

            <div className="rounded-[26px] bg-white p-5 shadow-md dark:bg-[#3a3a3d]">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef6f2] text-[#12906a] dark:bg-[#24314f] dark:text-[#9bb8ff]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold">Event Ready</h3>
              <p className="mt-2 text-sm leading-6 text-[#6a655d] dark:text-white/65">
                Suitable for conventions, exhibits, programs, and gatherings.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/facilities"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#12906a] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl dark:bg-[#2d47ff]"
            >
              Explore Facilities
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-sm font-semibold transition hover:bg-white/60 dark:border-white/10 dark:hover:bg-white/5"
            >
              Contact the Venue
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img
                src="/marketing/images/events/lightmain.jpg"
                alt="BCCC event setup"
                className="h-56 w-full rounded-[30px] object-cover shadow-xl md:h-64"
              />
              <img
                src="/marketing/images/facilities/lightvip.jpg"
                alt="BCCC interior"
                className="h-40 w-full rounded-[30px] object-cover shadow-xl md:h-48"
              />
            </div>

            <div className="pt-10">
              <img
                src="/marketing/images/facilities/darkvip.jpg"
                alt="BCCC hospitality area"
                className="h-[24rem] w-full rounded-[34px] object-cover shadow-2xl md:h-[30rem]"
              />
            </div>
          </div>

          <div className="absolute -bottom-5 left-6 right-6 rounded-[28px] border border-white/30 bg-white/85 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#2f2f33]/90">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7d776e] dark:text-white/55">
              Venue Character
            </p>
            <p className="mt-2 text-sm font-medium leading-6 text-[#3d3935] dark:text-white/80">
              Crafted for civic gatherings, cultural showcases, and memorable event
              experiences in Baguio City.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Sparkles, Trees } from 'lucide-react';

export default function HeroBanner() {
  return (
    <section className="relative min-h-[94vh] overflow-hidden rounded-b-[42px]">
      <div
        className="absolute inset-0 bg-cover bg-center dark:hidden"
        style={{ backgroundImage: "url('/marketing/images/hero/noon.png')" }}
      />
      <div
        className="absolute inset-0 hidden bg-cover bg-center dark:block"
        style={{ backgroundImage: "url('/marketing/images/hero/night.png')" }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/25 to-black/45 dark:from-black/40 dark:via-black/40 dark:to-black/60" />

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f4f1ea] to-transparent dark:from-[#4b4b4e]" />

      <div className="relative z-10 mx-auto flex min-h-[84vh] max-w-7xl flex-col justify-center px-4 pb-12 pt-16 text-white md:px-2">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-1 ">
            <div>
              <img
                src="/marketing/images/branding/breathe-light.png"
                alt="Breathe Baguio"
                className="h-[24rem] w-full rounded-[14px] md:h-[7rem]"
              />
            </div>
          </div>

          <h1 className="text-4xl font-bold leading-tight md:text-4xl lg:text-7xl"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
            Baguio Convention & Cultural Center
          </h1>

          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-white/80">
            Events Access & Scheduling Engine
          </p>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-white/90 md:text-base">
            A premier civic and cultural destination where conferences, public
            gatherings, exhibitions, and celebrations come alive in the heart of the
            City of Pines.
          </p>

          <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Link
              href="/bookings/create"
              className="inline-flex min-w-[180px] items-center justify-center rounded-full bg-[#12906a] px-6 py-3 text-sm font-semibold text-white shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl dark:bg-[#2d47ff]"
            >
              Book Now
            </Link>

            <Link
              href="/facilities"
              className="inline-flex min-w-[180px] items-center justify-center rounded-full border border-white/30 bg-white/12 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              Explore Spaces
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
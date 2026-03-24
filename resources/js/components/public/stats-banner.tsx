import { useEffect, useRef, useState } from 'react';
import { stats as fallbackStats, type StatItem } from '@/data/stats';

function CountUpStat({
  value,
  suffix,
  label,
  start,
}: StatItem & { start: boolean }) {
  const target = Number(value);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!start || Number.isNaN(target)) return;

    let frame = 0;
    const totalFrames = 45;
    const counter = window.setInterval(() => {
      frame += 1;
      const progress = frame / totalFrames;
      const current = Math.round(target * progress);

      setDisplayValue(current);

      if (frame >= totalFrames) {
        window.clearInterval(counter);
        setDisplayValue(target);
      }
    }, 24);

    return () => window.clearInterval(counter);
  }, [start, target]);

  return (
    <div className="rounded-3xl border border-black/5 bg-white/70 px-5 py-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        {displayValue}
        {suffix}
      </div>
      <div className="mt-2 text-sm font-medium uppercase tracking-[0.28em] text-slate-500 dark:text-slate-300">
        {label}
      </div>
    </div>
  );
}

export default function StatsBanner({ items }: { items?: StatItem[] }) {
  const stats = items && items.length > 0 ? items : fallbackStats;
  const sectionRef = useRef<HTMLElement | null>(null);
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStartAnimation(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <div className="rounded-[2rem] border border-black/5 bg-gradient-to-br from-emerald-50 via-white to-slate-100 px-6 py-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-gradient-to-br dark:from-emerald-500/10 dark:via-slate-950 dark:to-slate-900 dark:shadow-[0_25px_80px_rgba(0,0,0,0.35)] sm:px-8 lg:px-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <CountUpStat
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              start={startAnimation}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

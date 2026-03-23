import { useEffect, useRef, useState } from 'react';

import { stats } from '@/data/stats';

function CountUpStat({
    value,
    suffix,
    label,
    startAnimation,
}: {
    value: string;
    suffix?: string;
    label: string;
    startAnimation: boolean;
}) {
    const target = Number(value);
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (!startAnimation) return;

        let animationFrame = 0;
        const duration = 1300;
        const start = performance.now();

        const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.round(target * eased));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(tick);
            }
        };

        animationFrame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(animationFrame);
    }, [startAnimation, target]);

    return (
        <div className="rounded-[1.8rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
            <div className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                {displayValue.toLocaleString()}
                {suffix ?? ''}
            </div>
            <p className="mt-2 text-sm uppercase tracking-[0.14em] text-white/80">{label}</p>
        </div>
    );
}

export default function StatsBanner() {
    const sectionRef = useRef<HTMLElement | null>(null);
    const [startAnimation, setStartAnimation] = useState(false);

    useEffect(() => {
        const node = sectionRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setStartAnimation(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.25 },
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className="relative overflow-hidden border-y border-black/10 dark:border-white/10">
            <img
                src="/marketing/images/facilities/gallery-2600.jpg"
                alt="Venue at a glance"
                className="absolute inset-0 h-full w-full object-cover dark:hidden"
            />
            <img
                src="/marketing/images/facilities/darkmain.jpg"
                alt="Venue at a glance"
                className="absolute inset-0 hidden h-full w-full object-cover dark:block"
            />
            <div className="absolute inset-0 bg-[#10261f]/72 dark:bg-black/72" />

            <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-20">
                <div className="max-w-3xl">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#bfe2d6] dark:text-[#9dc0ff]">
                        Venue At A Glance
                    </p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                        Full-width venue impact section with animated counts.
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-white/80">
                        This section now stretches across the screen, stays responsive, and animates the numbers only
                        when it first enters view.
                    </p>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {stats.map((item) => (
                        <CountUpStat
                            key={item.label}
                            value={item.value}
                            suffix={item.suffix}
                            label={item.label}
                            startAnimation={startAnimation}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
import { MoonStar, SunMedium } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminThemeToggle() {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('bccc-theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const useDark = savedTheme ? savedTheme === 'dark' : systemDark;

        document.documentElement.classList.toggle('dark', useDark);
        setIsDark(useDark);
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.classList.toggle('dark', next);
        localStorage.setItem('bccc-theme', next ? 'dark' : 'light');
    };

    if (!mounted) {
        return <div className="h-11 w-11 rounded-full border border-black/10 bg-white/70 dark:border-white/10 dark:bg-[#18191d]" />;
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/80 text-[#1f1f1c] shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-[#18191d] dark:text-white dark:hover:bg-[#22242a]"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
        >
            {isDark ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
        </button>
    );
}

import { useEffect, useState } from 'react';
import { MoonStar, SunMedium } from 'lucide-react';

export default function ThemeToggle() {
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
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white shadow-md backdrop-blur-md"
      >
        <SunMedium className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white shadow-md backdrop-blur-md transition duration-300 hover:scale-105 hover:bg-white/25"
    >
      {isDark ? (
        <SunMedium className="h-5 w-5 transition group-hover:rotate-12" />
      ) : (
        <MoonStar className="h-5 w-5 transition group-hover:-rotate-12" />
      )}
    </button>
  );
}
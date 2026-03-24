import type { PropsWithChildren } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, LogOut, PanelsTopLeft } from 'lucide-react';

type AuthUser = {
  name?: string;
  email?: string;
};

type PageProps = {
  auth?: {
    user?: AuthUser;
  };
};

const navItems = [
  {
    label: 'Config Console',
    href: '/admin/home',
    icon: PanelsTopLeft,
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
];

export default function AdminLayout({ children }: PropsWithChildren) {
  const page = usePage<PageProps>();
  const user = page.props.auth?.user;
  const currentUrl = page.url;

  return (
    <div className="min-h-screen bg-[#f6f4ee] text-[#22221f] dark:bg-[#0f1014] dark:text-white">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#121318]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.34em] text-[#174f40] dark:text-[#8ea3ff]">
              AD
            </div>
            <div className="mt-1 text-xl font-semibold">BCCC Admin</div>
            <div className="text-sm text-slate-500 dark:text-slate-300">
              Frontend Config Console
            </div>
          </div>

          <nav className="hidden items-center gap-3 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentUrl.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-[#174f40] text-white dark:bg-[#2d47ff]'
                      : 'border border-black/10 bg-white text-[#1f1f1c] hover:bg-slate-50 dark:border-white/10 dark:bg-[#17181c] dark:text-white dark:hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold">{user?.name ?? 'Admin User'}</div>
              <div className="text-xs text-slate-500 dark:text-slate-300">
                {user?.email ?? 'Authenticated Session'}
              </div>
            </div>

            <Link
              href="/logout"
              method="post"
              as="button"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#1f1f1c] transition hover:bg-slate-50 dark:border-white/10 dark:bg-[#17181c] dark:text-white dark:hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

// resources/js/layouts/app-layout.tsx
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import type { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import NotificationBell from '@/components/layout/NotificationBell';
import SuccessPopup from '@/components/success-popup';

interface AppLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
  const { auth } = usePage().props as any;
  const isLoggedIn = !!auth?.user;

  return (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
      {/* Small global guidelines entry – top right, above page content */}
      {isLoggedIn && (
        <div className="flex justify-end px-4 pt-2">
        <NotificationBell />
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <Link href="/guidelines">
              <Info className="mr-1 h-4 w-4" />
              Guidelines &amp; Contacts
            </Link>
          </Button>
        </div>
      )}

      {children}
    </AppLayoutTemplate>
  );
}

import type { ReactNode } from 'react';

import PublicFooter from '@/components/public/public-footer';
import PublicHeader from '@/components/public/public-header';

type PublicLayoutProps = {
    children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <div className="min-h-screen bg-[#f6f2ea] text-[#1f1f1c] antialiased dark:bg-[#101114] dark:text-[#f5f5f5]">
            <div className="relative overflow-x-clip">
                <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-gradient-to-b from-[#dcebdd] via-[#f6f2ea] to-transparent dark:from-[#16231f] dark:via-[#101114] dark:to-transparent" />
                <PublicHeader />
                <main className="relative z-10">{children}</main>
                <PublicFooter />
            </div>
        </div>
    );
}
'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageSquare, Package, User, Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const sidebarItems = [
    {
        title: 'Products',
        icon: Package,
        href: '/dashboard',
    },
    {
        title: 'Chat',
        icon: MessageSquare,
        href: '/dashboard/chat',
    },
    {
        title: 'Profile',
        icon: User,
        href: '/dashboard/profile',
    },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const currentPage = sidebarItems.find(item => item.href === pathname)?.title || 'Dashboard';
    const CurrentIcon = sidebarItems.find(item => item.href === pathname)?.icon;

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Mobile Menu */}
            <div className="lg:hidden border-b p-4">
                <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <span className="flex items-center gap-2">
                        {CurrentIcon && (
                            <CurrentIcon className="h-4 w-4" />
                        )}
                        {currentPage}
                    </span>
                    <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        isMenuOpen && "transform rotate-180"
                    )} />
                </Button>

                {isMenuOpen && (
                    <div className="absolute left-0 right-0 z-50 mt-2 bg-background border shadow-lg">
                        <nav className="flex flex-col p-2">
                            {sidebarItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                            isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'hover:bg-muted'
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.title}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-64 border-r bg-muted/20">
                    <nav className="flex flex-col gap-2 p-4">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
} 
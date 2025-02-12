'use client';

import Link from 'next/link';
import { Leaf, Menu, X } from 'lucide-react';
import { getSession, clearSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function Navbar() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userType, setUserType] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const { isAuthenticated: authStatus, userType: type } = getSession();
        setIsAuthenticated(authStatus);
        setUserType(type || null);
    }, []);

    const handleLogout = () => {
        clearSession();
        setIsAuthenticated(false);
        setUserType(null);
        router.push('/signin');
    };

    return (
        <nav className="w-full h-16 border-b">
            <div className="container mx-auto h-full flex items-center justify-between px-4">
                <div className="flex items-center">
                    <Link href="/"><Leaf className="h-6 w-6" /></Link>
                </div>
                
                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </button>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-4">
                    <Link href="/" className="hover:text-primary">
                        Home
                    </Link>
                    <Link href="/marketplace" className="hover:text-primary">
                        Marketplace
                    </Link>
                    {isAuthenticated && userType === 'Farmer' && (
                        <Link href="/dashboard" className="hover:text-primary">
                            Dashboard
                        </Link>
                    )}
                </div>

                <div className="hidden lg:flex items-center gap-4">
                    {isAuthenticated ? (
                        <Button onClick={handleLogout} variant="outline">
                            Logout
                        </Button>
                    ) : (
                        <>
                            <Link href="/signin">
                                <Button variant="outline">Sign In</Button>
                            </Link>
                            <Link href="/signup">
                                <Button>Sign Up</Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden fixed inset-x-0 top-16 bg-background border-b shadow-lg">
                        <div className="flex flex-col p-4 space-y-4">
                            <Link
                                href="/"
                                className="hover:text-primary"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                href="/marketplace"
                                className="hover:text-primary"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Marketplace
                            </Link>
                            {isAuthenticated && userType === 'Farmer' && (
                                <Link
                                    href="/dashboard"
                                    className="hover:text-primary"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                            )}
                            {isAuthenticated ? (
                                <Button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Logout
                                </Button>
                            ) : (
                                <>
                                    <Link
                                        href="/signin"
                                        className="w-full"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Button variant="outline" className="w-full">
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="w-full"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Button className="w-full">Sign Up</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
} 
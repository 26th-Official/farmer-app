'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { format } from 'date-fns';

interface Purchase {
    id: string;
    product_name: string;
    seller_email: string;
    quantity: number;
    total_price: number;
    purchase_date: string;
}

interface UserProfile {
    email: string;
    type: string;
    purchases: Purchase[];
    totalSpent: number;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = getSession();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`/api/profile?email=${user}`);
            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }
            const data = await response.json();
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container px-4 py-8">
                <div className="text-center text-red-500">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container px-4 py-8 md:py-12">
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold">Profile</h2>
                    <p className="text-muted-foreground">
                        View your profile and purchase history
                    </p>
                </div>

                {profile && (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-lg border p-6 space-y-2">
                                <h3 className="font-semibold">Account Details</h3>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p>Email: {profile.email}</p>
                                    <p>Account Type: {profile.type}</p>
                                </div>
                            </div>

                            <div className="rounded-lg border p-6 space-y-2">
                                <h3 className="font-semibold">Purchases</h3>
                                <p className="text-sm text-muted-foreground">
                                    Total Purchases: {profile.purchases.length}
                                </p>
                            </div>

                            <div className="rounded-lg border p-6 space-y-2">
                                <h3 className="font-semibold">Total Spent</h3>
                                <p className="text-sm text-muted-foreground">
                                    Amount: ₹{profile.totalSpent || profile.purchases.reduce((sum, purchase) => sum + purchase.total_price, 0)}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Purchase History</h3>
                            {profile.purchases.length === 0 ? (
                                <p className="text-muted-foreground">No purchases yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {profile.purchases.map((purchase) => (
                                        <div
                                            key={purchase.id}
                                            className="rounded-lg border p-6 space-y-2"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold">{purchase.product_name}</h4>
                                                    <div className="text-sm text-muted-foreground space-y-1">
                                                        <p>Seller: {purchase.seller_email.split('@')[0]}</p>
                                                        <p>Quantity: {purchase.quantity} kg</p>
                                                        <p>Total Price: ₹{purchase.total_price}</p>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {format(new Date(purchase.purchase_date), 'PPpp')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
} 
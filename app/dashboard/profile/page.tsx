'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface UserProfile {
    email: string;
    productCount: number;
    earning: number;
}

const bankDetailsSchema = z.object({
    accountName: z.string().min(1, 'Account holder name is required'),
    accountNumber: z.string().min(9, 'Account number must be at least 9 digits'),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
});

type BankDetailsFormData = z.infer<typeof bankDetailsSchema>;

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { user } = getSession();

    const form = useForm<BankDetailsFormData>({
        resolver: zodResolver(bankDetailsSchema),
        defaultValues: {
            accountName: '',
            accountNumber: '',
            ifscCode: '',
        },
    });

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

    const handlePayout = async (data: BankDetailsFormData) => {
        setIsProcessing(true);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
            const response = await fetch('/api/payout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: user,
                    ...data,
                }),
            });

            if (!response.ok) {
                throw new Error('Payout failed');
            }

            setIsSuccess(true);
            await fetchProfile(); // Refresh profile data
        } catch (error) {
            console.error('Error processing payout:', error);
            setError('Failed to process payout');
        } finally {
            setIsProcessing(false);
        }
    };

    const closeDialog = () => {
        setIsPayoutDialogOpen(false);
        setIsSuccess(false);
        form.reset();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold">Profile</h2>
                <p className="text-muted-foreground">
                    View and manage your profile details
                </p>
            </div>

            {profile && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border p-6 space-y-2">
                        <h3 className="font-semibold">Account Details</h3>
                        <p className="text-sm text-muted-foreground">
                            Email: {profile.email}
                        </p>
                    </div>

                    <div className="rounded-lg border p-6 space-y-2">
                        <h3 className="font-semibold">Products</h3>
                        <p className="text-sm text-muted-foreground">
                            Total Products: {profile.productCount}
                        </p>
                    </div>

                    <div className="rounded-lg border p-6 space-y-2">
                        <h3 className="font-semibold">Earnings</h3>
                        <p className="text-sm text-muted-foreground">
                            Current Balance: ₹{profile.earning}
                        </p>
                    </div>
                </div>
            )}

            <div className="border rounded-lg p-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Payout</h3>
                    <p className="text-sm text-muted-foreground">
                        Transfer your earnings to your bank account
                    </p>
                    <Button
                        onClick={() => setIsPayoutDialogOpen(true)}
                        disabled={!profile?.earning}
                    >
                        Request Payout
                    </Button>
                </div>
            </div>

            <Dialog open={isPayoutDialogOpen} onOpenChange={closeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isSuccess ? 'Payout Successful' : 'Request Payout'}
                        </DialogTitle>
                    </DialogHeader>

                    {isSuccess ? (
                        <div className="space-y-4">
                            <p className="text-center text-green-600">
                                Your payout has been processed successfully!
                            </p>
                            <DialogFooter>
                                <Button onClick={closeDialog} className="w-full">
                                    OK
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(handlePayout)}
                                className="space-y-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="accountName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Account Holder Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="accountNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Account Number</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="ifscCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>IFSC Code</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Confirm Payout'
                                    )}
                                </Button>
                            </form>
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
} 
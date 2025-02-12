'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        if (!sessionId) {
            router.push('/marketplace');
        }
    }, [sessionId, router]);

    return (
        <div className="container max-w-md mx-auto py-12">
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Payment Successful!</h1>
                    <p className="text-muted-foreground">
                        Thank you for your purchase. Your order has been confirmed.
                    </p>
                </div>
                <Button
                    className="w-full"
                    onClick={() => router.push('/marketplace')}
                >
                    Return to Marketplace
                </Button>
            </div>
        </div>
    );
} 
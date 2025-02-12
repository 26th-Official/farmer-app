'use client';

import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FailurePage() {
    const router = useRouter();

    return (
        <div className="container max-w-md mx-auto py-12">
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <XCircle className="h-16 w-16 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Payment Failed</h1>
                    <p className="text-muted-foreground">
                        Sorry, your payment could not be processed. Please try again.
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
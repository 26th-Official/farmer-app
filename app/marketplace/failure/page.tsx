'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

function FailureContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (sessionId && process.env.NEXT_PUBLIC_TEST_MODE === 'true') {
            // In test mode, we can try to verify the session status
            const verifySession = async () => {
                try {
                    setIsProcessing(true);
                    setError(null);

                    // Call our API to check the session status
                    const response = await fetch(`/api/verify-session?session_id=${sessionId}`);
                    const data = await response.json();

                    if (response.ok && data.success) {
                        // If the session is actually successful, redirect to success page
                        router.push(`/marketplace/success?session_id=${sessionId}`);
                    }
                } catch (err) {
                    console.error('Error verifying session:', err);
                    setError(err instanceof Error ? err.message : 'Failed to verify payment status');
                } finally {
                    setIsProcessing(false);
                }
            };

            verifySession();
        }
    }, [sessionId, router]);

    if (isProcessing) {
        return (
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Verifying Payment Status</h1>
                    <p className="text-muted-foreground">
                        Please wait while we check your payment status...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center space-y-6">
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
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
        );
    }

    return (
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
    );
}

function LoadingState() {
    return (
        <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
}

export default function FailurePage() {
    return (
        <div className="container max-w-md mx-auto py-12">
            <Suspense fallback={<LoadingState />}>
                <FailureContent />
            </Suspense>
        </div>
    );
} 
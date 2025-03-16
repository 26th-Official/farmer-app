'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isProcessed, setIsProcessed] = useState(false);

    useEffect(() => {
        
    }, [sessionId, router]);


    useEffect(() => {
        if (sessionId && process.env.NEXT_PUBLIC_TEST_MODE === 'true') {
            if (!sessionId) {
                router.push('/marketplace');
                return;
            }
    
            const processPayment = async () => {
                try {
                    setIsProcessing(true);
                    setError(null);
    
                    // Call our API to process the payment in TEST_MODE
                    const response = await fetch(`/api/verify-session?session_id=${sessionId}`);
                    const data = await response.json();
    
                    if (!response.ok) {
                        throw new Error(data.error || 'Failed to process payment');
                    }
    
                    setIsProcessed(true);
                } catch (err) {
                    console.error('Error processing payment:', err);
                    setError(err instanceof Error ? err.message : 'Failed to process payment');
                } finally {
                    setIsProcessing(false);
                }
            };
    
            processPayment();
        }
    }, [sessionId, router]);

    if (isProcessing) {
        return (
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Processing Your Order</h1>
                    <p className="text-muted-foreground">
                        Please wait while we confirm your payment...
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
                <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div className="space-y-2">
                <h1 className="text-2xl font-bold">Payment Successful!</h1>
                <p className="text-muted-foreground">
                    Thank you for your purchase. Your order has been confirmed.
                </p>
                {isProcessed && (
                    <p className="text-sm text-green-600 font-medium mt-2">
                        Your order has been processed successfully.
                    </p>
                )}
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

export default function SuccessPage() {
    return (
        <div className="container max-w-md mx-auto py-12">
            <Suspense fallback={<LoadingState />}>
                <SuccessContent />
            </Suspense>
        </div>
    );
} 
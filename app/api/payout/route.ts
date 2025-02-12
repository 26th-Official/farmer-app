import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        
        // Reset user's earnings to 0
        await query(
            'UPDATE users SET earning = 0 WHERE email = $1',
            [email]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing payout:', error);
        return NextResponse.json(
            { error: 'Failed to process payout' },
            { status: 500 }
        );
    }
} 
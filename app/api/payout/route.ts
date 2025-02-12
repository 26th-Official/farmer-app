import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        const db = await getDb();
        
        // Reset user's earnings to 0
        await db.run(
            'UPDATE users SET earning = 0 WHERE email = ?',
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
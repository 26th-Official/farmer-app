import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const db = await getDb();
        
        // Get user details and product count
        const user = await db.get(
            `SELECT u.*, COUNT(p.id) as productCount 
             FROM users u 
             LEFT JOIN products p ON u.email = p.email 
             WHERE u.email = ? 
             GROUP BY u.email`,
            [email]
        );

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            email: user.email,
            productCount: user.productCount || 0,
            earning: user.earning || 0,
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
} 
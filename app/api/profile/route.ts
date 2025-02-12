import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    try {
        const db = await getDb();

        // Get user details
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get purchase history and calculate total spent
        const purchases = await db.all(`
            SELECT 
                p.id,
                p.product_name,
                p.seller_email,
                p.quantity,
                p.total_price,
                p.purchase_date
            FROM purchases p
            WHERE p.buyer_email = ?
            ORDER BY p.purchase_date DESC
        `, [email]);

        // Calculate total spent
        const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.total_price, 0);

        return NextResponse.json({
            email: user.email,
            type: user.type,
            purchases: purchases,
            totalSpent: totalSpent
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
} 
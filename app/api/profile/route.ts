import { NextResponse } from 'next/server';
import { getOne, getMany } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    try {
        // Get user details
        const user = await getOne('SELECT * FROM users WHERE email = $1', [email]);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get purchase history
        const purchases = await getMany(`
            SELECT 
                p.id,
                p.product_name,
                p.seller_email,
                p.quantity,
                p.total_price,
                p.purchase_date
            FROM purchases p
            WHERE p.buyer_email = $1
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
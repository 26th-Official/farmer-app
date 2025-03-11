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

        if (user.type === 'Farmer') {
            // Get products count and total earnings for farmer
            const products = await getMany('SELECT * FROM products WHERE email = $1', [email]);
            const sales = await getMany(`
                SELECT SUM(total_price) as total_earnings
                FROM purchases
                WHERE seller_email = $1
            `, [email]);

            return NextResponse.json({
                email: user.email,
                type: user.type,
                productCount: products.length,
                earning: sales[0]?.total_earnings || 0
            });
        } else {
            // Get purchase history for customer
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
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
} 
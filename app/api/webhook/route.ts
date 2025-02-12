import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
    try {
        const body = await request.text();
        const signature = (await headers()).get('stripe-signature')!;

        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            webhookSecret
        );

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const { productId, quantity, sellerId } = session.metadata!;
            const buyerEmail = session.customer_details?.email;

            const db = await getDb();

            // Get product details
            const product = await db.get(
                'SELECT name FROM products WHERE id = ?',
                [productId]
            );

            // Update product quantity
            await db.run(
                'UPDATE products SET quantity = quantity - ? WHERE id = ?',
                [Number(quantity), productId]
            );

            // Update seller earnings
            const paymentAmount = session.amount_total! / 100; // Convert from paise to rupees
            await db.run(
                'UPDATE users SET earning = earning + ? WHERE email = ?',
                [paymentAmount, sellerId]
            );

            // Create purchase record
            await db.run(
                `INSERT INTO purchases (
                    id,
                    product_id,
                    product_name,
                    buyer_email,
                    seller_email,
                    quantity,
                    total_price,
                    purchase_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [
                    uuidv4(),
                    productId,
                    product.name,
                    buyerEmail,
                    sellerId,
                    Number(quantity),
                    paymentAmount
                ]
            );
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 400 }
        );
    }
} 
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { query, getOne } from '@/lib/db';
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

            // Get product details
            const product = await getOne(
                'SELECT name FROM products WHERE id = $1',
                [productId]
            );

            // Update product quantity
            await query(
                'UPDATE products SET quantity = quantity - $1 WHERE id = $2',
                [Number(quantity), productId]
            );

            // Update seller earnings
            const paymentAmount = session.amount_total! / 100; // Convert from paise to rupees
            await query(
                'UPDATE users SET earning = earning + $1 WHERE email = $2',
                [paymentAmount, sellerId]
            );

            // Create purchase record
            await query(
                `INSERT INTO purchases (
                    id,
                    product_id,
                    product_name,
                    buyer_email,
                    seller_email,
                    quantity,
                    total_price,
                    purchase_date
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
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
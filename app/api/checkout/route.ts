import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getOne } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia',
});

export async function POST(request: Request) {
    try {
        const { productId, quantity, unitPrice } = await request.json();

        // Fetch product details
        const product = await getOne(
            'SELECT * FROM products WHERE id = $1',
            [productId]
        );

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        if (quantity > product.quantity) {
            return NextResponse.json(
                { error: 'Requested quantity exceeds available stock' },
                { status: 400 }
            );
        }

        const origin = request.headers.get('origin') || 'http://localhost:3000';

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: product.name,
                            description: `Sold by: ${product.email}`,
                        },
                        unit_amount: Math.round(unitPrice * 100), // Convert to paise and ensure it's an integer
                    },
                    quantity: quantity,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/marketplace/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/marketplace`,
            metadata: {
                productId,
                quantity: quantity.toString(),
                sellerId: product.email,
            },
        });

        if (!session.url) {
            throw new Error('Failed to create checkout session URL');
        }

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Stripe API error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
} 
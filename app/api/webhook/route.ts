import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { query, getOne } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '@/lib/email';

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
            const buyerName = session.customer_details?.name;
            const buyerAddress = session.customer_details?.address;

            // Get product details
            const product = await getOne(
                'SELECT name, price FROM products WHERE id = $1',
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

            // Send email to buyer
            const buyerEmailHtml = `
                <h1>Thank you for your purchase!</h1>
                <h2>Order Details:</h2>
                <p><strong>Product:</strong> ${product.name}</p>
                <p><strong>Quantity:</strong> ${quantity}</p>
                <p><strong>Total Amount:</strong> ₹${paymentAmount}</p>
                <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
                <br/>
                <h2>Shipping Details:</h2>
                <p><strong>Name:</strong> ${buyerName}</p>
                <p><strong>Address:</strong><br/>
                ${buyerAddress?.line1 || ''}<br/>
                ${buyerAddress?.line2 ? buyerAddress.line2 + '<br/>' : ''}
                ${buyerAddress?.city || ''}, ${buyerAddress?.state || ''}<br/>
                ${buyerAddress?.postal_code || ''}<br/>
                ${buyerAddress?.country || ''}
                </p>
            `;

            await sendEmail({
                to: buyerEmail!,
                subject: 'Order Confirmation - Farmer Marketplace',
                html: buyerEmailHtml,
            });

            // Send email to seller
            const sellerEmailHtml = `
                <h1>New Order Received!</h1>
                <h2>Order Details:</h2>
                <p><strong>Product:</strong> ${product.name}</p>
                <p><strong>Quantity:</strong> ${quantity}</p>
                <p><strong>Total Amount:</strong> ₹${paymentAmount}</p>
                <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
                <br/>
                <h2>Buyer Details:</h2>
                <p><strong>Name:</strong> ${buyerName}</p>
                <p><strong>Email:</strong> ${buyerEmail}</p>
                <p><strong>Shipping Address:</strong><br/>
                ${buyerAddress?.line1 || ''}<br/>
                ${buyerAddress?.line2 ? buyerAddress.line2 + '<br/>' : ''}
                ${buyerAddress?.city || ''}, ${buyerAddress?.state || ''}<br/>
                ${buyerAddress?.postal_code || ''}<br/>
                ${buyerAddress?.country || ''}
                </p>
            `;

            await sendEmail({
                to: sellerId,
                subject: 'New Order Received - Farmer Marketplace',
                html: sellerEmailHtml,
            });
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
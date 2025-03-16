import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { query, getOne } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia',
});

export async function GET(request: Request) {
    // Only process in TEST_MODE
    if (process.env.TEST_MODE !== 'true') {
        return NextResponse.json(
            { error: 'This endpoint is only available in TEST_MODE' },
            { status: 403 }
        );
    }

    try {
        const url = new URL(request.url);
        const sessionId = url.searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Check if the session is completed
        if (session.status !== 'complete') {
            return NextResponse.json(
                { error: 'Payment not completed' },
                { status: 400 }
            );
        }

        // Extract data from the session
        const { productId, quantity, sellerId } = session.metadata!;
        const buyerEmail = session.customer_details?.email;
        const buyerName = session.customer_details?.name;
        const buyerAddress = session.customer_details?.address;

        // Check if buyer exists in users table, if not create a new user
        const existingUser = await getOne('SELECT email FROM users WHERE email = $1', [buyerEmail]);
        if (!existingUser) {
            // Generate a random password for the user (they can reset it later if needed)
            const tempPassword = Math.random().toString(36).slice(-8);
            
            await query(
                `INSERT INTO users (email, password, type, earning) 
                 VALUES ($1, $2, 'buyer', 0)`,
                [buyerEmail, tempPassword]
            );
        }

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

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Session verification error:', error);
        return NextResponse.json(
            { error: 'Failed to process payment session' },
            { status: 500 }
        );
    }
} 
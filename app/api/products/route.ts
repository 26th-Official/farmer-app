import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        const db = await getDb();

        let products;
        if (email) {
            // If email is provided, get products for specific farmer
            products = await db.all(
                'SELECT * FROM products WHERE email = ?',
                [email]
            );
        } else {
            // If no email, get all products for marketplace
            products = await db.all('SELECT * FROM products WHERE quantity > 0');
        }

        return NextResponse.json(products || []);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const product = await request.json();
        const db = await getDb();

        await db.run(
            'INSERT INTO products (id, name, quantity, price, email) VALUES (?, ?, ?, ?, ?)',
            [product.id, product.name, product.quantity, product.price, product.email]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const product = await request.json();
        const db = await getDb();

        await db.run(
            'UPDATE products SET name = ?, quantity = ?, price = ? WHERE id = ? AND email = ?',
            [product.name, product.quantity, product.price, product.id, product.email]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    try {
        const db = await getDb();
        await db.run('DELETE FROM products WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        );
    }
} 
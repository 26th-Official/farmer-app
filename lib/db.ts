import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false // This allows self-signed certificates
    }
});

// Initialize database tables
export async function initDb() {
    const client = await pool.connect();
    try {
        // Create users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                email TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                type TEXT NOT NULL,
                earning INTEGER DEFAULT 0
            )
        `);

        // Create products table
        await client.query(`
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                price INTEGER NOT NULL,
                email TEXT NOT NULL,
                FOREIGN KEY (email) REFERENCES users(email)
            )
        `);

        // Create purchases table
        await client.query(`
            CREATE TABLE IF NOT EXISTS purchases (
                id TEXT PRIMARY KEY,
                product_id TEXT NOT NULL,
                product_name TEXT NOT NULL,
                buyer_email TEXT NOT NULL,
                seller_email TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                total_price INTEGER NOT NULL,
                purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id),
                FOREIGN KEY (buyer_email) REFERENCES users(email),
                FOREIGN KEY (seller_email) REFERENCES users(email)
            )
        `);
    } finally {
        client.release();
    }
}

// Initialize database on first import
initDb().catch(console.error);

// Database query helper functions
export async function query(text: string, params?: any[]) {
    const client = await pool.connect();
    try {
        return await client.query(text, params);
    } finally {
        client.release();
    }
}

export async function getOne(text: string, params?: any[]) {
    const result = await query(text, params);
    return result.rows[0];
}

export async function getMany(text: string, params?: any[]) {
    const result = await query(text, params);
    return result.rows;
} 
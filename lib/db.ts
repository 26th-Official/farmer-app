import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database | null = null;

export async function getDb() {
    if (!db) {
        db = await open({
            filename: './farmer.db',
            driver: sqlite3.Database
        });

        // Create users table if it doesn't exist
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                email TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                type TEXT NOT NULL,
                earning INTEGER DEFAULT 0
            )
        `);

        // Create products table if it doesn't exist
        await db.exec(`
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                price INTEGER NOT NULL,
                email TEXT NOT NULL,
                FOREIGN KEY (email) REFERENCES users(email)
            )
        `);

        // Create purchases table if it doesn't exist
        await db.exec(`
            CREATE TABLE IF NOT EXISTS purchases (
                id TEXT PRIMARY KEY,
                product_name TEXT NOT NULL,
                buyer_email TEXT NOT NULL,
                seller_email TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                total_price INTEGER NOT NULL,
                purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (buyer_email) REFERENCES users(email),
                FOREIGN KEY (seller_email) REFERENCES users(email)
            )
        `);
    }
    return db;
} 
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const userData = await request.json();
        const db = await getDb();
        
        await db.run(
            'INSERT INTO users (email, password, type, earning) VALUES (?, ?, ?, ?)',
            [userData.email, userData.password, userData.type, 0]
        );
        
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            error: 'User already exists' 
        });
    }
} 
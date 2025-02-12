import { NextResponse } from 'next/server';
import { query, getOne } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const userData = await request.json();
        
        // Check if user already exists
        const existingUser = await getOne(
            'SELECT email FROM users WHERE email = $1',
            [userData.email]
        );

        if (existingUser) {
            return NextResponse.json({ 
                success: false, 
                error: 'User already exists' 
            });
        }
        
        // Create new user
        await query(
            'INSERT INTO users (email, password, type, earning) VALUES ($1, $2, $3, $4)',
            [userData.email, userData.password, userData.type, 0]
        );
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to create user'
        }, { status: 500 });
    }
} 
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        console.log('Auth attempt for:', email); // Debug log
        
        const db = await getDb();
        const user = await db.get(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        console.log('Found user:', user); // Debug log
        
        if (!user) {
            return NextResponse.json({ 
                success: false, 
                error: 'User not found' 
            });
        }
        
        if (user.password !== password) {
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }
        
        const response = {
            success: true,
            user: {
                email: user.email,
                type: user.type
            }
        };
        console.log('Auth response:', response); // Debug log
        
        return NextResponse.json(response);
    } catch (error) {
        console.error('Auth error:', error); // Debug log
        return NextResponse.json({ 
            success: false, 
            error: 'Authentication failed' 
        });
    }
} 
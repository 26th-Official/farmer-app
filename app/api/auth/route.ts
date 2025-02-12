import { NextResponse } from 'next/server';
import { getOne } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        console.log('Auth attempt for:', email); // Debug log
        
        const user = await getOne(
            'SELECT * FROM users WHERE email = $1 AND password = $2',
            [email, password]
        );
        
        console.log('Found user:', user); // Debug log
        
        if (!user) {
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
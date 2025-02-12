'use client';

import { z } from 'zod';
import Cookies from 'js-cookie';

export const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    type: z.enum(['Farmer', 'Customer'])
});

export type UserType = z.infer<typeof userSchema>;

export async function createUser(userData: UserType) {
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        
        return await response.json();
    } catch (error) {
        return { success: false, error: 'Failed to create user' };
    }
}

export async function signIn(email: string, password: string) {
    try {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        
        const result = await response.json();
        if (result.success) {
            setSession(result.user.email, result.user.type);
        }
        return result;
    } catch (error) {
        return { success: false, error: 'Authentication failed' };
    }
}

export function setSession(email: string, type: string) {
    // Set cookies with a 7-day expiry
    Cookies.set('session', 'true', { expires: 7 });
    Cookies.set('user', email, { expires: 7 });
    Cookies.set('userType', type, { expires: 7 });
}

export function clearSession() {
    Cookies.remove('session');
    Cookies.remove('user');
    Cookies.remove('userType');
}

export function getSession() {
    const session = Cookies.get('session');
    const user = Cookies.get('user');
    const userType = Cookies.get('userType');
    
    return {
        isAuthenticated: session === 'true',
        user,
        userType
    };
} 
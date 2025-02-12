'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'),
});

type SignInType = z.infer<typeof signInSchema>;

export default function SignInPage() {
    const router = useRouter();
    const form = useForm<SignInType>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: SignInType) => {
        try {
            const result = await signIn(data.email, data.password);
            console.log('Sign in result:', result);

            if (result.success) {
                const redirectPath = result.user.type === 'Farmer' ? '/dashboard' : '/marketplace';
                console.log('Redirecting to:', redirectPath);
                
                // Use replace instead of push to avoid back button issues
                router.replace(redirectPath);
            } else {
                form.setError('root', {
                    type: 'manual',
                    message: result.error,
                });
            }
        } catch (error) {
            console.error('Sign in error:', error);
            form.setError('root', {
                type: 'manual',
                message: 'An error occurred during sign in',
            });
        }
    };

    return (
        <div className="container max-w-md mx-auto py-12">
            <div className="space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold">Welcome Back</h1>
                    <p className="text-muted-foreground">
                        Sign in to your account to continue
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your email"
                                            type="email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your password"
                                            type="password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {form.formState.errors.root && (
                            <p className="text-sm font-medium text-destructive">
                                {form.formState.errors.root.message}
                            </p>
                        )}

                        <Button type="submit" className="w-full">
                            Sign In
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-primary hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </form>
                </Form>
            </div>
        </div>
    );
} 
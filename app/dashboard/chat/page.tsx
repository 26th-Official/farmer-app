'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

const messageSchema = z.object({
    content: z.string().min(1, 'Message cannot be empty'),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "👋 Hello! I'm your farming assistant. I can help you with questions about farming techniques, crop management, pest control, and more. How can I assist you today?"
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const form = useForm<MessageFormData>({
        resolver: zodResolver(messageSchema),
        defaultValues: {
            content: '',
        },
    });

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const onSubmit = async (data: MessageFormData) => {
        try {
            setIsLoading(true);
            const userMessage: Message = {
                role: 'user',
                content: data.content,
            };
            setMessages((prev) => [...prev, userMessage]);
            form.reset();

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: data.content,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const { reply } = await response.json();
            const assistantMessage: Message = {
                role: 'assistant',
                content: reply,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={cn(
                            'flex w-full',
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        <div
                            className={cn(
                                'rounded-lg px-4 py-2 max-w-[80%]',
                                message.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                            )}
                        >
                            {message.role === 'assistant' ? (
                                <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                                    {message.content}
                                </ReactMarkdown>
                            ) : (
                                message.content
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex w-full justify-start">
                        <div className="bg-muted rounded-lg px-4 py-5 max-w-[80%]">
                            <div className="flex items-center space-x-2">
                                <div className="size-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="size-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="size-1 bg-primary rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex items-center gap-2"
                    >
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input
                                            placeholder="Ask about farming techniques, crop management, etc..."
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
} 
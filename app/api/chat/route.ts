import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

const SYSTEM_PROMPT = `You are an expert farming assistant. You help farmers with:
- Crop selection and rotation
- Pest management and disease control
- Soil health and fertilization
- Sustainable farming practices
- Weather impact on farming
- Modern farming techniques
- Market trends and pricing strategies

Provide clear, practical advice based on scientific knowledge and best practices in agriculture.
Keep responses concise but informative.`;

export async function POST(request: Request) {
    try {
        const { message } = await request.json();

        const completion = await openai.chat.completions.create({
            model: 'llama3-8b-8192',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: message },
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        const reply = completion.choices[0]?.message?.content || 'Sorry, I could not process your request.';

        return NextResponse.json({ reply });
    } catch (error) {
        console.error('OpenAI API error:', error);
        return NextResponse.json(
            { error: 'Failed to get response from AI' },
            { status: 500 }
        );
    }
} 
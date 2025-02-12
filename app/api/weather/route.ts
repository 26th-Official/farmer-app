import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const cityId = searchParams.get('cityId');

        if (!cityId) {
            return NextResponse.json(
                { error: 'City ID is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.OPENWEATHER_API_KEY;
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&lang=en&units=metric&APPID=${apiKey}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Weather API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch weather data' },
            { status: 500 }
        );
    }
} 
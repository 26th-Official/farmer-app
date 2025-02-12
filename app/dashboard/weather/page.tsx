'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Search } from 'lucide-react';
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { format } from 'date-fns';

interface City {
    id: string;
    name: string;
}

interface WeatherData {
    list: Array<{
        dt: number;
        main: {
            temp: number;
            humidity: number;
            feels_like: number;
        };
        weather: Array<{
            main: string;
            description: string;
            icon: string;
        }>;
        wind: {
            speed: number;
        };
    }>;
}

const DEFAULT_CITY = {
    id: "1264527",
    name: "Chennai"
};

export default function WeatherPage() {
    const [cities, setCities] = useState<City[]>([]);
    const [selectedCity, setSelectedCity] = useState<City>(DEFAULT_CITY);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCommandOpen, setIsCommandOpen] = useState(false);
    const commandRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load cities from the JSON file
        fetch('/citylist.json')
            .then(res => res.json())
            .then(data => {
                const formattedCities = Object.entries(data).map(([id, name]) => ({
                    id,
                    name: name as string,
                }));
                setCities(formattedCities);
            })
            .catch(error => console.error('Error loading cities:', error));

        // Load saved city from localStorage or use default
        const savedCity = localStorage.getItem('selectedCity');
        if (savedCity) {
            setSelectedCity(JSON.parse(savedCity));
        }
    }, []);

    useEffect(() => {
        if (selectedCity) {
            fetchWeatherData(selectedCity.id);
            // Save selected city to localStorage
            localStorage.setItem('selectedCity', JSON.stringify(selectedCity));
        }
    }, [selectedCity]);

    // Add click outside handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
                setIsCommandOpen(false);
            }
        }

        // Add event listener when command box is open
        if (isCommandOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Cleanup event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isCommandOpen]);

    const fetchWeatherData = async (cityId: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/weather?cityId=${cityId}`);
            const data = await response.json();
            setWeatherData(data);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCitySelect = (city: City) => {
        setSelectedCity(city);
        setIsCommandOpen(false);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold">Weather Forecast</h2>
                <p className="text-muted-foreground">
                    Check the weather forecast for your area
                </p>
            </div>

            <div className="w-full max-w-sm" ref={commandRef}>
                <Command className="rounded-lg border shadow-md">
                    <CommandInput 
                        placeholder="Search for a city..." 
                        onFocus={() => setIsCommandOpen(true)}
                    />
                    {isCommandOpen && (
                        <CommandList>
                            <CommandEmpty>No cities found.</CommandEmpty>
                            <CommandGroup heading="Cities">
                                {cities.map((city) => (
                                    <CommandItem
                                        key={city.id}
                                        onSelect={() => handleCitySelect(city)}
                                        className="cursor-pointer"
                                    >
                                        <Search className="mr-2 h-4 w-4" />
                                        {city.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    )}
                </Command>
            </div>

            {selectedCity && (
                <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                        Currently showing weather for:
                    </p>
                    <p className="text-sm font-medium">{selectedCity.name}</p>
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : weatherData && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {weatherData.list.slice(0, 6).map((forecast, index) => (
                        <div
                            key={forecast.dt}
                            className="rounded-lg border bg-card p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">
                                        {format(new Date(forecast.dt * 1000), 'EEEE')}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(forecast.dt * 1000), 'MMM d, h:mm a')}
                                    </p>
                                </div>
                                <img
                                    src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
                                    alt={forecast.weather[0].description}
                                    className="h-12 w-12"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-baseline justify-between">
                                    <p className="text-2xl font-bold">
                                        {Math.round(forecast.main.temp)}°C
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Feels like {Math.round(forecast.main.feels_like)}°C
                                    </p>
                                </div>
                                <p className="text-sm capitalize">
                                    {forecast.weather[0].description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div>
                                    <p className="text-sm text-muted-foreground">Humidity</p>
                                    <p className="font-medium">{forecast.main.humidity}%</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Wind Speed</p>
                                    <p className="font-medium">{forecast.wind.speed} m/s</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 
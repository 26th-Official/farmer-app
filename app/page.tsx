import { Button } from '@/components/ui/button';
import { Sprout, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Welcome to Farmer Marketplace</h1>
                <p className="text-lg md:text-xl text-muted-foreground">
                    Connect with local farmers, buy fresh produce, and get AI-powered farming assistance
                    all in one place.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
                    <Link href="/marketplace">
                        <Button size="lg" className="w-full sm:w-auto">
                            <ShoppingBag className="w-5 h-5 mr-2" />
                            Browse Marketplace
                        </Button>
                    </Link>
                    <Link href="/signup">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto">
                            <Sprout className="w-5 h-5 mr-2" />
                            Join as Farmer
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
                <div className="p-6 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                    <h3 className="text-lg font-semibold mb-2">AI-Powered Farming</h3>
                    <p className="text-muted-foreground">
                        Get personalized advice and insights for your crops using our advanced AI assistant.
                    </p>
                </div>
                
                <div className="p-6 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                    <h3 className="text-lg font-semibold mb-2">Direct Sales</h3>
                    <p className="text-muted-foreground">
                        Connect directly with customers and sell your produce without intermediaries.
                    </p>
                </div>
                
                <div className="p-6 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                    <h3 className="text-lg font-semibold mb-2">Secure Payments</h3>
                    <p className="text-muted-foreground">
                        Safe and secure transactions powered by Stripe payment processing.
                    </p>
                </div>

                <div className="p-6 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                    <h3 className="text-lg font-semibold mb-2">Weather Forecasting</h3>
                    <p className="text-muted-foreground">
                        Stay informed with accurate 6-day weather predictions to better plan your farming activities.
                    </p>
                </div>
            </div>
        </div>
    );
}

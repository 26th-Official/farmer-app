'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShoppingCart, Loader2, PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface Product {
    id: string;
    name: string;
    quantity: number;
    price: number;
    email: string;
}

const purchaseSchema = z.object({
    quantity: z.string().refine(
        (val) => !isNaN(Number(val)) && Number(val) > 0,
        { message: 'Quantity must be a positive number' }
    ),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

export default function MarketplacePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm<PurchaseFormData>({
        resolver: zodResolver(purchaseSchema),
        defaultValues: {
            quantity: '',
        },
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch('/api/products');
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                setProducts(data);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePurchase = async (data: PurchaseFormData) => {
        if (!selectedProduct) return;

        const quantity = Number(data.quantity);
        if (quantity > selectedProduct.quantity) {
            form.setError('quantity', {
                type: 'manual',
                message: 'Requested quantity exceeds available stock',
            });
            return;
        }

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: selectedProduct.id,
                    quantity: quantity,
                    unitPrice: selectedProduct.price,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create checkout session');
            }

            if (!result.url) {
                throw new Error('No checkout URL received');
            }

            // Redirect to Stripe checkout
            window.location.href = result.url;
        } catch (error) {
            console.error('Error creating checkout session:', error);
            setError('Failed to initiate checkout. Please try again later.');
            setIsDialogOpen(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container py-12 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-12">
                <div className="text-center text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
            <div className="space-y-8">
                <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold">Marketplace</h1>
                    <p className="text-muted-foreground">
                        Browse and purchase fresh produce directly from farmers
                    </p>
                </div>

                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <PackageSearch className="h-16 w-16 text-primary opacity-50 mb-4" />
                        <h4 className="font-semibold">No Products Available</h4>
                        <p className="text-muted-foreground mt-2">There are currently no products listed in the marketplace.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="rounded-lg border bg-card p-6 space-y-4"
                            >
                                <div className="space-y-2">
                                    <h3 className="font-semibold">{product.name}</h3>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p>Available: {product.quantity} kg</p>
                                        <p>Price: ₹{product.price}/kg</p>
                                        <p>Seller: {product.email.split('@')[0]}</p>
                                    </div>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => {
                                        setSelectedProduct(product);
                                        setIsDialogOpen(true);
                                        form.reset();
                                    }}
                                >
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Purchase
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Purchase Product</DialogTitle>
                        </DialogHeader>
                        {selectedProduct && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="font-semibold">
                                        {selectedProduct.name}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Price: ₹{selectedProduct.price}/kg
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Available: {selectedProduct.quantity} kg
                                    </p>
                                </div>

                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(handlePurchase)}
                                        className="space-y-4"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="quantity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Quantity (kg)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="Enter quantity in kg"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button type="submit" className="w-full">
                                            Proceed to Payment
                                        </Button>
                                    </form>
                                </Form>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
} 
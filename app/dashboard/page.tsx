'use client';

import { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Plus, Pencil, Trash, PackageSearch, Loader2 } from 'lucide-react';

const productSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Quantity must be a positive number',
    }),
    price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Price must be a positive number',
    }),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Product {
    id: string;
    name: string;
    quantity: number;
    price: number;
    email: string;
}

export default function DashboardPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isPending, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const { user } = getSession();

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            quantity: '',
            price: '',
        },
    });

    useEffect(() => {
        startTransition(() => {
            fetchProducts();
        });
    }, []);

    useEffect(() => {
        if (editingProduct) {
            form.reset({
                name: editingProduct.name,
                quantity: String(editingProduct.quantity),
                price: String(editingProduct.price),
            });
        }
    }, [editingProduct, form]);

    const fetchProducts = async () => {
        try {
            startTransition(async () => {
                const response = await fetch('/api/products?email=' + user);
                const data = await response.json();
                setProducts(data);
            });
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const onSubmit = async (data: ProductFormData) => {
        try {
            const productData = {
                id: editingProduct?.id || uuidv4(),
                name: data.name,
                quantity: Number(data.quantity),
                price: Number(data.price),
                email: user,
            };

            const response = await fetch('/api/products', {
                method: editingProduct ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });

            if (response.ok) {
                await fetchProducts();
                setIsDialogOpen(false);
                form.reset();
                setEditingProduct(null);
            }
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/products?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchProducts();
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Products</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => {
                                setEditingProduct(null);
                                form.reset();
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingProduct ? 'Edit Product' : 'Add Product'}
                            </DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Product name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantity (kg)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Quantity in kg"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price (per kg)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Price per kg"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">
                                    {editingProduct ? 'Update' : 'Add'} Product
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
            {isPending ? (
                <div className="flex justify-center py-20 items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    {products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <PackageSearch className="h-16 w-16 text-primary opacity-50 mb-4" />
                            <h4 className="font-semibold">No Products Available</h4>
                            <p className="text-muted-foreground mt-2">There are currently no products listed in the marketplace.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="rounded-lg border bg-card p-4 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">{product.name}</h3>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(product)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        <p>Quantity: {product.quantity} kg</p>
                                        <p>Price: ₹{product.price}/kg</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

        </div>
    );
} 
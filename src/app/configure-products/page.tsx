'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {Textarea} from '@/components/ui/textarea';
import {useToast} from '@/hooks/use-toast';
import {z} from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useEffect} from 'react';

const productSchema = z.object({
  description: z.string().min(2, {
    message: 'Description must be at least 2 characters.',
  }),
  squareFootagePrice: z
    .number()
    .min(0, {message: 'Price must be a positive number.'}),
  dimensions: z.string().optional(),
});

type Product = z.infer<typeof productSchema>;

const defaultProducts: Product[] = [
  {
    description: 'Standard Glass',
    squareFootagePrice: 2.5,
    dimensions: '1/4 inch',
  },
  {
    description: 'Tempered Glass',
    squareFootagePrice: 3.5,
    dimensions: '1/4 inch',
  },
];

async function loadProducts(): Promise<Product[]> {
  try {
    const response = await fetch('/api/products', {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as Product[];
  } catch (error: any) {
    console.error('Error loading products from API:', error);
    return [];
  }
}

async function saveProducts(products: Product[]): Promise<void> {
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(products),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error saving products via API:', error);
    throw error;
  }
}

export default function ConfigureProductsPage() {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const {toast} = useToast();

  const form = useForm<Product>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      description: '',
      squareFootagePrice: 0,
      dimensions: '',
    },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const initialProducts = await loadProducts();
        setProducts(initialProducts.length > 0 ? initialProducts : defaultProducts);
        if (initialProducts.length === 0){
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Could not load product list.',
            });
        }
      } catch (error: any) {
        console.error('Error loading products:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Could not load product list.',
        });
        setProducts(defaultProducts);        
      }
    };

    fetchProducts();
  }, [toast]);

  async function onSubmit(values: Product) {
    try {
      const updatedProducts = [...products, values];
      await saveProducts(updatedProducts);
      setProducts(updatedProducts);
      form.reset();
      toast({
        title: 'Product added successfully!',
        description: 'Your product has been added to the list.',
      });
    } catch (error: any) {
      console.error('Error saving products:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Could not save product to the list.',
      });
    }
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Configure Product List</CardTitle>
          <CardDescription>
            Add, manage, and update product details.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Product description" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a brief description of the product.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="squareFootagePrice"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Square Footage Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={e => {
                          const value = parseFloat(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Set the price per square footage.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dimensions"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Dimensions (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1/4 inch" {...field} />
                    </FormControl>
                    <FormDescription>
                      Specify the dimensions of the product.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Add Product</Button>
            </form>
          </Form>

          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <Table>
              <TableCaption>A list of your products.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Price/Sq. Ft.</TableHead>
                  <TableHead>Dimensions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>${product.squareFootagePrice.toFixed(2)}</TableCell>
                    <TableCell>{product.dimensions || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

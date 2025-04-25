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
import {
  Table,
  TableBody,
  TableCell,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useForm,
  
} from 'react-hook-form';
import {useEffect} from 'react';
import {Trash2, Edit} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {useRouter} from 'next/navigation';
import {z} from 'zod';import { zodResolver } from '@hookform/resolvers/zod';
import {useToast} from '@/hooks/use-toast';


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

async function loadProductsFromJson(): Promise<Product[]> {
  try {
    const response = await fetch('/api/products', {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn('products.json not found. Using an empty array.');
        return []; // Return an empty array if the file is not found
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.products as Product[];
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
  const [products, setProducts] = useState<Product[]>([]);
  const {toast} = useToast();
  const [salesTaxRate, setSalesTaxRate] = useState<number>(8.25);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const form = useForm<Product>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      description: '',
      squareFootagePrice: 0,
      dimensions: '',
    },
  });

  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const initialProducts = await loadProductsFromJson();
        setProducts(initialProducts.length > 0 ? initialProducts : []);
        if (initialProducts.length === 0) {
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
        setProducts([]);
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

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    form.setValue('description', products[index].description);
    form.setValue('squareFootagePrice', products[index].squareFootagePrice);
    form.setValue('dimensions', products[index].dimensions || '');
  };

  const handleUpdate = async (index: number, values: Product) => {
    try {
      const updatedProducts = [...products];
      updatedProducts[index] = values;
      await saveProducts(updatedProducts);
      setProducts(updatedProducts);
      setEditingIndex(null);
      form.reset();
      toast({
        title: 'Product updated successfully!',
        description: 'Your product has been updated.',
      });
    } catch (error: any) {
      console.error('Error updating products:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Could not update product.',
      });
    }
  };

  const handleDelete = async (index: number) => {
    try {
      const updatedProducts = [...products];
      updatedProducts.splice(index, 1);
      await saveProducts(updatedProducts);
      setProducts(updatedProducts);
      toast({
        title: 'Product deleted successfully!',
        description: 'Your product has been deleted from the list.',
      });
    } catch (error: any) {
      console.error('Error deleting products:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Could not delete product.',
      });
    }
  };

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
          <Button variant="secondary" onClick={() => router.push('/')}>
            Main Menue
          </Button>
          <div className="mb-6">
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={e => {
                  e.preventDefault();
                  const value = parseFloat((e.target as any)[
                    'salesTaxRate'
                  ].value);
                  setSalesTaxRate(isNaN(value) ? 0 : value);
                  toast({title: `Sales Tax Rate updated to ${value}%`});
                }}
              >
                <FormItem>
                  <FormLabel>Sales Tax Rate (%)</FormLabel>
                  <FormControl>
                    <Input name="salesTaxRate" type="number" defaultValue={salesTaxRate} placeholder="0.00" />
                  </FormControl>
                </FormItem>
                <Button type="submit">Save Sales Tax Rate</Button>
              </form>
            </Form>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <FormDescription className="max-w-[400px]">
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>
                      ${product.squareFootagePrice.toFixed(2)}
                    </TableCell>
                    <TableCell>{product.dimensions || 'N/A'}</TableCell>
                    <TableCell>
                      {editingIndex === index ? (
                        <Form {...form}>
                          <form
                            onSubmit={form.handleSubmit(values =>
                              handleUpdate(index, values)
                            )}
                            className="space-y-2"
                          >
                            <FormField
                              control={form.control}
                              name="description"
                              render={({field}) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder="Product description"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="squareFootagePrice"
                              render={({field}) => (
                                <FormItem>
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
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="dimensions"
                              render={({field}) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., 1/4 inch"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="submit" size="sm">
                              Update
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => setEditingIndex(null)}
                            >
                              Cancel
                            </Button>
                          </form>
                        </Form>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(index)}
                          >
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the product.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(index)}
                                >
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </TableCell>
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


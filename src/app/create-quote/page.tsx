'use client';

import {useState, useEffect} from 'react';
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

// Define the schema for the quote form
const quoteSchema = z.object({
  customerName: z.string().min(2, {
    message: 'Customer Name must be at least 2 characters.',
  }),
  projectName: z.string().min(2, {
    message: 'Project Name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  products: z.array(
    z.object({
      description: z.string(),
      squareFootage: z.number().min(0, {
        message: 'Square footage must be a positive number.',
      }),
      price: z.number(),
    })
  ),
});

type Quote = z.infer<typeof quoteSchema>;

// Define a type for the products.  This is temporary, we will be fetching the products in a future step.
type Product = {
  description: string;
  squareFootagePrice: number;
  dimensions?: string;
};

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

export default function CreateQuotePage() {
  const {toast} = useToast();
  const [products, setProducts] = useState<
    {description: string; squareFootage: number; price: number}[]
  >([]);

  const form = useForm<Quote>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      customerName: '',
      projectName: '',
      description: '',
      products: [],
    },
  });

  const addProduct = (product: Product) => {
    setProducts([
      ...products,
      {
        description: product.description,
        squareFootage: 0,
        price: product.squareFootagePrice,
      },
    ]);
  };

  const updateSquareFootage = (index: number, squareFootage: number) => {
    const newProducts = [...products];
    newProducts[index].squareFootage = squareFootage;
    setProducts(newProducts);
  };

  const calculateTotal = () => {
    return products.reduce((total, product) => {
      return total + product.squareFootage * product.price;
    }, 0);
  };

  function onSubmit(values: Quote) {
    // Here you would handle the form submission, e.g., sending the data to a server
    console.log(values);
    toast({
      title: 'Quote created successfully!',
      description: 'Your quote has been saved.',
    });
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create New Quote</CardTitle>
          <CardDescription>
            Enter the details for your new quote.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Customer name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the name of the customer.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectName"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Project name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the name of the project.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a description for the quote.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Products</FormLabel>
                <FormDescription>
                  Select the products for the quote.
                </FormDescription>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {defaultProducts.map(product => (
                    <Card key={product.description}>
                      <CardHeader>
                        <CardTitle>{product.description}</CardTitle>
                        <CardDescription>
                          Price: ${product.squareFootagePrice.toFixed(2)}/sq.
                          ft.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => addProduct(product)}
                        >
                          Add Product
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <Table>
                  <TableCaption>List of selected products</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Square Footage</TableHead>
                      <TableHead>Price/Sq. Ft.</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{product.description}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="0"
                            value={product.squareFootage}
                            onChange={e => {
                              const value = parseFloat(e.target.value);
                              updateSquareFootage(
                                index,
                                isNaN(value) ? 0 : value
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          ${(product.squareFootage * product.price).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div>
                <Label>Total: ${calculateTotal().toFixed(2)}</Label>
              </div>

              <Button type="submit">Create Quote</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

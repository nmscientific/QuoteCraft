'use client';

import {useState} from 'react';
import fs from 'fs';
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
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Trash} from 'lucide-react';


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
      productDescription: z.string(),
      lengthFeet: z.number().min(0, {
        message: 'Length in feet must be a positive number.',
      }),
      lengthInches: z.number().min(0, {
        message: 'Length in inches must be a positive number.',
      }),
      widthFeet: z.number().min(0, {
        message: 'Width in feet must be a positive number.',
      }),
      widthInches: z.number().min(0, {
        message: 'Width in inches must be a positive number.',
      }),
      price: z.number().min(0),
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
    {productDescription: string; lengthFeet: number; lengthInches: number; widthFeet: number; widthInches: number; price: number}[]
  >([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

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
        productDescription: product.description,
        lengthFeet: 0,
        lengthInches: 0,
        widthFeet: 0,
        widthInches: 0,
        price: product.squareFootagePrice,
      },
    ]);
    setSelectedProduct(null); // Reset selected product after adding
  };

  const removeProduct = (index: number) => {
    const newProducts = [...products];
    newProducts.splice(index, 1);
    setProducts(newProducts);
  };

  const updateProduct = (index: number, field: string, value: number) => {
    const newProducts = [...products];
    // @ts-ignore
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const calculateTotal = () => {
    return products.reduce((total, product) => {
      const length = product.lengthFeet + product.lengthInches / 12;
      const width = product.widthFeet + product.widthInches / 12;
      return total + length * width * product.price;
    }, 0);
  };

  const onSubmit = async (values: Quote) => {
    const now = new Date();
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    const yy = now.getFullYear().toString().slice(-2);
    const hh = now.getHours().toString().padStart(2, '0');
    const min = now.getMinutes().toString().padStart(2, '0');
    const quoteNumber = `${mm}${dd}${yy}${hh}${min}`;

    const quoteData = {
      ...values,
      quoteNumber,
    };

    const quotesDir = './src/quotes';
    const filePath = `${quotesDir}/quote-${quoteNumber}.json`;

    try {
      if (!fs.existsSync(quotesDir)) {
        fs.mkdirSync(quotesDir, {recursive: true});
      }
      await fs.promises.writeFile(filePath, JSON.stringify(quoteData, null, 2));

      toast({
        title: 'Quote created successfully!',
        description: `Your quote has been saved as quote-${quoteNumber}.json`,
      });
    } catch (error) {
      console.error('Error saving quote:', error);
      toast({
        variant: 'destructive',
        title: 'Error saving quote',
        description: 'There was an error saving your quote. Please try again.',
      });
    } finally {
      console.log('Quote saved', quoteData);
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
                <Select onValueChange={(value) => {
                  setSelectedProduct(value);
                }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a product" value={selectedProduct || undefined} />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultProducts.map((product) => (
                      <SelectItem key={product.description} value={product.description}>
                        {product.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const product = defaultProducts.find(p => p.description === selectedProduct);
                    if (product) {
                      addProduct(product);
                    } else {
                      toast({
                        title: 'Please select a product',
                      });
                    }
                  }}
                >
                  Add Product
                </Button>
              </div>

              <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <Table>
                  <TableCaption>List of selected products</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Length (Ft)</TableHead>
                      <TableHead>Length (In)</TableHead>
                      <TableHead>Width (Ft)</TableHead>
                      <TableHead>Width (In)</TableHead>
                      <TableHead>Price/Sq. Ft.</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{product.productDescription}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="0"
                            value={product.lengthFeet}
                            onChange={e => {
                              const value = parseFloat(e.target.value);
                              updateProduct(index, 'lengthFeet', isNaN(value) ? 0 : value);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="0"
                            value={product.lengthInches}
                            onChange={e => {
                              const value = parseFloat(e.target.value);
                              updateProduct(index, 'lengthInches', isNaN(value) ? 0 : value);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="0"
                            value={product.widthFeet}
                            onChange={e => {
                              const value = parseFloat(e.target.value);
                              updateProduct(index, 'widthFeet', isNaN(value) ? 0 : value);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="0"
                            value={product.widthInches}
                            onChange={e => {
                              const value = parseFloat(e.target.value);
                              updateProduct(index, 'widthInches', isNaN(value) ? 0 : value);
                            }}
                          />
                        </TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          ${(() => {
                            const length = product.lengthFeet + product.lengthInches / 12;
                            const width = product.widthFeet + product.widthInches / 12;
                            return (length * width * product.price).toFixed(2);
                          })()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeProduct(index)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
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

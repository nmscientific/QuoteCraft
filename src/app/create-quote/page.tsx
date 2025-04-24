'use client';

import {useState, useEffect, Suspense, ReactNode, useCallback} from 'react';
import { useSearchParams } from 'next/navigation';
import logo from '@/public/logo.png';
import { saveQuote } from '@/app/actions';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {cn} from '@/lib/utils';
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
import { readFile } from '../server-actions';

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

async function loadProductsFromJson(): Promise<Product[]> {
  try {
    const response = await fetch('/products.json', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn('products.json not found. Using an empty array.');
        return []; // Return an empty array if the file is not found
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as Product[];
  } catch (error: any) {
    console.error('Error loading products from API:', error);
    return [];
  }
}

function SearchParamsWrapper({children, }: { children: ReactNode }) {
  const {toast} = useToast();

    const [products, setProducts] = useState< {
      productDescription: string;
      lengthFeet: number;
      lengthInches: number;
      widthFeet: number;
      widthInches: number;
      price: number;
    }[] >([]);
  const searchParams = useSearchParams();
  const form = useForm<Quote>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      customerName: '',
      projectName: '',
      description: '',
      products: [],

    },

  });
  useEffect(() => {
    const quoteFilename = searchParams.get('quoteFilename');
    const edit = searchParams.get('edit');

    if (!edit) {
      return;
    }

    const loadQuote = async () => {
      try {
        const fileContent = await readFile(`public/quotes/${quoteFilename}`);
        const quote = JSON.parse(fileContent);
        form.setValue('customerName', quote.customerName);
        form.setValue('projectName', quote.projectName);
        form.setValue('description', quote.description);
        setProducts(quote.products);

      } catch (error) {
        console.error('Error loading quote:', error);
      }};
    loadQuote();}, [searchParams, form, toast]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  useEffect(() => {

    const fetchProducts = async () => {
      try {
        const initialProducts = await loadProductsFromJson();
        setAvailableProducts(initialProducts);
      } catch (error) {
      }
    }
    fetchProducts();
  }, []);


  const addProduct = useCallback((product: Product) => {
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
  },[products]);

  const removeProduct = useCallback((index: number) => {
    const newProducts = [...products];
    newProducts.splice(index, 1);
    setProducts(newProducts);
  },[products]);

  const updateProduct = useCallback((index: number, field: string, value: number) => {
    const newProducts = [...products];
    // @ts-ignore
    newProducts[index][field] = value;
    setProducts(newProducts);
  }, [products]);

  const calculateTotal = useCallback(() => {
    return products.reduce((total, product) => {
      const length = product.lengthFeet + product.lengthInches / 12;
      const width = product.widthFeet + product.widthInches / 12;
      return total + length * width * product.price;
    }, 0);
  }, [products]);

  return <>{children({form, products, selectedProduct, setSelectedProduct, availableProducts, addProduct, removeProduct, updateProduct, calculateTotal, toast})}</>;
}
export default function CreateQuotePage() {
  const logoImg = logo; 

  
  const [isQuoteSaved, setIsQuoteSaved] = useState(false);
  
  useEffect(() => {
    setIsQuoteSaved(false);

    const fetchProducts = async () => {
      try {
        const initialProducts = await loadProductsFromJson();
        setAvailableProducts(initialProducts);
      } catch (error) {
      }
    }
    fetchProducts();
  }, [ ]);

  

 


  const onSubmit = async (values: Quote) => {
    const now = new Date();
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    const yy = now.getFullYear().toString().slice(-2);
    const hh = now.getHours().toString().padStart(2, '0');
    const min = now.getMinutes().toString().padStart(2, '0');
      console.log('onSubmit');
      const quoteNumber = `${mm}${dd}${yy}${hh}${min}`;
      const total = calculateTotal();

      const quoteData = {
        customerName: values.customerName,
        projectName: values.projectName,
        description: values.description,
        quoteNumber,
        products: products,
        total: total,
      };

    try{
      const result = await saveQuote(quoteData);
      if (result.success) {
        

        setIsQuoteSaved(true);
        toast({title: 'Quote created successfully!', description: result.message});
      } else {
        toast({variant: 'destructive', title: 'Error saving quote', description: result.message});
      }
    }catch(e){
      console.error('error saving quote',e)
    }
  };
  const handlePrint = () => {
    console.log('handlePrint');
    window.print();
  };

  return (
    
    <div className="container py-10">
    <Suspense fallback={<div>Loading...</div>}>
        <SearchParamsWrapper>
          {({form, products, selectedProduct, setSelectedProduct, availableProducts, addProduct, removeProduct, updateProduct, calculateTotal, toast})=> (

      <Card>
          <CardHeader>
            <img src={logoImg.src} alt="Logo" className='h-10 w-10 print:hidden' />
            <h1 className='print:block hidden font-bold'>
              Quote
            </h1>
          <div className="print:hidden">
            <CardTitle className='no-print'>
              Create New Quote
            </CardTitle>
            <CardDescription className='no-print'>
              Enter the details for your new quote.
          </CardDescription>          
        </div>
        </CardHeader>
        <CardContent className="grid gap-4 print:mb-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} onChange={()=>{
              setIsQuoteSaved(false)
            }} className="space-y-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({field}) => (
                  <FormItem>
                    <FormLabel className='no-print'>Customer Name</FormLabel>
                    <FormControl>
                      <Input className='print:m-0 print:p-0' placeholder="Customer name" {...field} />
                    </FormControl>
                    <FormDescription className='no-print'>
                      Enter the name of the customer.
                    </FormDescription>
                    <FormMessage/>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectName"
                render={({field}) => (
                  <FormItem>
                    <FormLabel className='no-print'>Project Name</FormLabel>
                    <FormControl >
                      <Input placeholder="Project name" {...field} />
                    </FormControl>
                    <FormDescription className='no-print'>
                      Enter the name of the project.
                    </FormDescription>
                    <FormMessage/>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({field}) => (
                  <FormItem>
                    <FormLabel className='no-print'>Description</FormLabel>
                    <FormControl >
                      <Textarea placeholder="Description" {...field} />
                    </FormControl>
                    <FormDescription className='no-print'>
                      Enter a description for the quote.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel className='no-print'>Products</FormLabel>
                <FormDescription className='no-print'>
                  Select the products for the quote.
                </FormDescription>
                <Select onValueChange={(value) => {
                  setSelectedProduct(value);
                }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue className='no-print' placeholder="Select a product" value={selectedProduct || undefined} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map((product) => (
                      <SelectItem key={product.description} value={product.description}>
                        {product.description}
                      </SelectItem>

                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  className="print:hidden"
                  size="sm"
                  onClick={() =>{
                    const product = availableProducts.find(p => p.description === selectedProduct);
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
                <Table                 
                  className={cn({
                    'print:table': isQuoteSaved,
                    'print:w-auto': isQuoteSaved
                  })}
                >
                  <TableCaption>List of selected products</TableCaption>
                  <TableHeader> <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Length (Ft)</TableHead>
                      <TableHead >Length (In)</TableHead>
                      <TableHead>Width (Ft)</TableHead>
                      <TableHead>Width (In)</TableHead>
                      <TableHead>Price/Sq. Ft.</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow> </TableHeader>
                  <TableBody> 
                    {products.map((product, index) => (                   
                      <TableRow key={index} className='print:my-1'>
                        <TableCell className='print:text-sm print:p-0'>{product.productDescription}</TableCell>
                        <TableCell className='print:text-sm print:w-10 print:p-0'>
                         {product.lengthFeet}                         
                        </TableCell>
                        <TableCell className='print:text-sm print:w-10 print:p-0' >
                          {product.lengthInches}
                        </TableCell>
                        <TableCell className='print:text-sm print:w-10 print:p-0' >
                          {product.widthFeet}
                        </TableCell>
                        <TableCell className='print:text-sm print:w-10 print:p-0' >{product.widthInches}</TableCell>
                        <TableCell className='print:text-sm print:p-0'>${product.price.toFixed(2)}</TableCell>
                        <TableCell className='print:text-sm print:p-0'>
                          ${(() => {
                                const length = product.lengthFeet + product.lengthInches / 12;
                                const width = product.widthFeet + product.widthInches / 12;
                                return (length * width * product.price).toFixed(2);
                              })()}
                        </TableCell>

                        
                        
                        <TableCell className='print:hidden'> 
                        <Button
                            variant="destructive"                           
                            onClick={() => removeProduct(index)}>                         
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

              <div className="print:hidden">
              <Button type="submit">Create Quote</Button>
              {isQuoteSaved && (
                <>
                   <Button type="button" onClick={handlePrint}>Print Quote</Button>
                </>
              )}</div>
              
              
            </form>
          </Form>
        </CardContent>      
          </SearchParamsWrapper>
      </Card>
     )}
     </Suspense></div>);
    )}
   
    );
}

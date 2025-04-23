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
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from '@/components/ui/alert-dialog';
import {useToast} from '@/hooks/use-toast';

// Define a type for the quote data
type Quote = {
  customerName: string;
  projectName: string;
  description?: string;
  products: {
    productDescription: string;
    lengthFeet: number;
    lengthInches: number;
    widthFeet: number;
    widthInches: number;
    price: number;
  }[];
};

export default function OpenQuotePage() {
  const [quoteFiles, setQuoteFiles] = useState<string[]>([]);
  const [quotesData, setQuotesData] = useState<{[filename: string]: Quote}>({});
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const {toast} = useToast();

  useEffect(() => {
    // Placeholder for loading quotes from a server action or API route
    const mockQuoteFiles = ['quote1.json', 'quote2.json']; // Replace with actual data fetching
    const mockQuotesData: {[filename: string]: Quote} = {
      'quote1.json': {
        customerName: 'John Doe',
        projectName: 'Sample Project 1',
        description: 'A sample quote',
        products: [
          {
            productDescription: 'Standard Glass',
            lengthFeet: 10,
            lengthInches: 0,
            widthFeet: 5,
            widthInches: 0,
            price: 2.5,
          },
        ],
      },
      'quote2.json': {
        customerName: 'Jane Smith',
        projectName: 'Sample Project 2',
        description: 'Another sample quote',
        products: [
          {
            productDescription: 'Tempered Glass',
            lengthFeet: 8,
            lengthInches: 6,
            widthFeet: 4,
            widthInches: 6,
            price: 3.5,
          },
        ],
      },
    };
    setQuoteFiles(mockQuoteFiles);
    setQuotesData(mockQuotesData);
  }, []);

  const handleDeleteQuote = async (filename: string) => {
    // Placeholder for deleting quote using a server action or API route
    console.log(`Deleting quote: ${filename}`);
    toast({
      title: 'Quote deleted successfully!',
      description: `Quote ${filename} has been deleted.`,
    });
  };

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Open Existing Quote</CardTitle>
          <CardDescription>View, edit, and manage existing quotes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {quoteFiles.length === 0 ? (
            <p>No quotes found.</p>
          ) : (
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <Table>
                <TableCaption>List of saved quotes</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quoteFiles.map(file => (
                    <TableRow key={file}>
                      <TableCell>{file}</TableCell>
                      <TableCell>{quotesData[file]?.customerName}</TableCell>
                      <TableCell>{quotesData[file]?.projectName}</TableCell>
                      <TableCell>
                        <Button variant="outline" onClick={() => {
                          // Implement navigation to edit page with filename
                          window.location.href = `/edit-quote?filename=${file}`;
                        }}>
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the quote.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteQuote(file)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

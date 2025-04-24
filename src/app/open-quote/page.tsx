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
import { listFiles, readFile, deleteFile } from '../server-actions';

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
    const getQuotes = async () => {
      try {
        const files = await listFiles('src/quotes/');
        if (files) {            
            setQuoteFiles(files.filter((file: string) => file.endsWith('.json')));
        } else {
            console.error('Error getting files');
        }
      } catch (error) {
          console.error('Error getting files:', error);
      }
    };

    const loadQuotes = async () => {
        try {
            const quotes: {[filename: string]: Quote} = {};
            const files = await listFiles('src/quotes/');

            if (files) {                
                for (const file of files) {
                  if (file.endsWith('.json')){
                    const fileContent = await readFile(file);
                    quotes[file.replace('src/quotes/', '')] = JSON.parse(fileContent);
                  }
                }
                setQuotesData(quotes);
            } else {
                console.error('Error getting files:');
            }
        } catch (error) {
            console.error('Error loading quotes:', error);
        }
    };
    getQuotes();
    loadQuotes();
  }, []);

  const handleDeleteQuote = async (filename: string) => {    
    try {
        const result = await deleteFile(`src/quotes/${filename}`);
        if(result){
          setQuoteFiles(quoteFiles.filter(file => file !== filename));
          setQuotesData(prevData => ({ ...prevData, [filename]: undefined}));
          toast({ title: 'Quote deleted successfully!', description: `Quote ${filename} has been deleted.` });
        }else{
          toast({ variant: 'destructive', title: 'Error deleting quote', description: `Error deleting ${filename}.` });
        }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error deleting quote', description: `Error deleting ${filename}.` });
    }
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


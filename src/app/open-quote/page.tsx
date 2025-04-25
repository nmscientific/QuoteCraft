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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption, // Corrected: Added missing import
} from '@/components/ui/table';
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
import {useToast} from '@/hooks/use-toast';
import {listFiles, readFile, deleteFile} from '../server-actions';
import {useRouter} from 'next/navigation';

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
  const {toast} = useToast();
  const router = useRouter();

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        const files = await listFiles('public/quotes/');
        if (!files) {
          console.error('Could not load list of files.');
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not load list of files.',
          });
          return;
        }

        // Sort files by date (newest to oldest)
        const sortedFiles = files
          .filter(file => file.endsWith('.json'))
          .sort((a, b) => {
            // Extract timestamp from filename (assuming format quote-MMDDYYHHMM.json)
            const timestampA = a.match(/quote-(\d+)\.json/)?.[1];
            const timestampB = b.match(/quote-(\d+)\.json/)?.[1];

            if (timestampA && timestampB) {
              // Compare timestamps to sort files
              return timestampB.localeCompare(timestampA);
            }
            return 0; // Keep original order if timestamp extraction fails
          });

        setQuoteFiles(sortedFiles);

        const loadedQuotes: {[filename: string]: Quote} = {};
        for (const file of sortedFiles) {
          try {
            const fileContent = await readFile(`public/quotes/${file}`);
            if (fileContent) {
              loadedQuotes[file] = JSON.parse(fileContent);
            } else {
              console.warn(`Could not read content of file: ${file}`);
            }
          } catch (parseError) {
            console.error(`Error parsing file ${file}:`, parseError);
            toast({
              variant: 'destructive',
              title: 'Error',
              description: `Could not parse file ${file}.`,
            });
          }
        }
        setQuotesData(loadedQuotes);
      } catch (error) {
        console.error('Error loading quotes:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load quotes.',
        });
      }
    };

    loadQuotes();
  }, [toast]);

  const handleDeleteQuote = async (filename: string) => {
    try {
      const result = await deleteFile(`public/quotes/${filename}`);
      if (result) {
        setQuoteFiles(quoteFiles.filter(file => file !== filename));
        setQuotesData(prevData => {
          const newData = {...prevData};
          delete newData[filename];
          return newData;
        });
        toast({
          title: 'Quote deleted successfully!',
          description: `Quote ${filename} has been deleted.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error deleting quote',
          description: `Error deleting ${filename}.`,
        });
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast({
        variant: 'destructive',
        title: 'Error deleting quote',
        description: `Error deleting ${filename}.`,
      });
    }
  };

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Open Existing Quote</CardTitle>
          <CardDescription>
            View, edit, and manage existing quotes.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button variant="secondary" onClick={() => router.push('/')}>
            Main Menu
          </Button>
          {quoteFiles.length === 0 ? (
            <p>No quotes found.</p>
          ) : (
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <Table>
                <TableCaption>List of saved quotes</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quoteFiles.map(file => {
                    const quote = quotesData[file];
                    if (!quote) {
                      return null; // Skip if quote data is not available
                    }
                    const quoteNumber = file.replace('quote-', '').replace('.json', '');
                    return (
                      <TableRow key={file}>
                        <TableCell>{quoteNumber}</TableCell>
                        <TableCell>{quote.customerName}</TableCell>
                        <TableCell>{quote.projectName}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            onClick={() => {
                              router.push(
                                `/create-quote?view=true&quoteFilename=${file}`
                              );
                            }}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              router.push(
                                `/create-quote?edit=true&quoteFilename=${file}`
                              );
                            }}
                          >
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive">Delete</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the quote.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteQuote(file)}
                                >
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

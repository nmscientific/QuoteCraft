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

import fs from 'node:fs/promises';
import path from 'node:path';

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

// Function to read quote files from the 'quotes' directory
async function getQuoteFiles(): Promise<string[]> {
  const quotesDirectory = path.join(process.cwd(), 'quotes');

  try {
    // Ensure the 'quotes' directory exists
    await fs.mkdir(quotesDirectory, {recursive: true});

    const files = await fs.readdir(quotesDirectory);
    return files.filter(file => file.endsWith('.json'));
  } catch (error) {
    console.error('Error reading quote files:', error);
    return [];
  }
}

// Function to read quote data from a file
async function readQuoteData(filename: string): Promise<Quote | null> {
  const quotesDirectory = path.join(process.cwd(), 'quotes');
  const filePath = path.join(quotesDirectory, filename);

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent) as Quote;
  } catch (error) {
    console.error(`Error reading quote data from ${filename}:`, error);
    return null;
  }
}

// Function to delete a quote file
async function deleteQuoteFile(filename: string): Promise<void> {
  const quotesDirectory = path.join(process.cwd(), 'quotes');
  const filePath = path.join(quotesDirectory, filename);

  try {
    await fs.unlink(filePath);
    console.log(`Deleted quote file: ${filename}`);
  } catch (error) {
    console.error(`Error deleting quote file ${filename}:`, error);
    throw error;
  }
}

export default function OpenQuotePage() {
  const [quoteFiles, setQuoteFiles] = useState<string[]>([]);
  const [quotesData, setQuotesData] = useState<{[filename: string]: Quote}>({});
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuotes() {
      const files = await getQuoteFiles();
      setQuoteFiles(files);

      const quoteData: {[filename: string]: Quote} = {};
      for (const file of files) {
        const data = await readQuoteData(file);
        if (data) {
          quoteData[file] = data;
        }
      }
      setQuotesData(quoteData);
    }

    loadQuotes();
  }, []);

  const handleDeleteQuote = async (filename: string) => {
    try {
      await deleteQuoteFile(filename);
      // Update the state to remove the deleted quote
      const updatedQuoteFiles = quoteFiles.filter(file => file !== filename);
      setQuoteFiles(updatedQuoteFiles);
      const updatedQuotesData = {...quotesData};
      delete updatedQuotesData[filename];
      setQuotesData(updatedQuotesData);
      // Optionally, reset the selected quote
      if (selectedQuote === filename) {
        setSelectedQuote(null);
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
      // Handle error as needed (e.g., display an error message)
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

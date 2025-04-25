'use server';

import fs from 'fs';
import {Quote} from '@/types';

const QUOTES_DIR = 'public/quotes';

async function ensureDirectoryExists() {
  if (!fs.existsSync(QUOTES_DIR)) {
    fs.mkdirSync(QUOTES_DIR, {recursive: true});
  }
}

export async function saveQuote(quoteData: Quote) {
  const now = new Date();
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const dd = now.getDate().toString().padStart(2, '0');
  const yy = now.getFullYear().toString().slice(-2);
  const hh = now.getHours().toString().padStart(2, '0');
  const min = now.getMinutes().toString().padStart(2, '0');
  const quoteNumber = quoteData.quoteNumber || `${mm}${dd}${yy}${hh}${min}`;

  const quoteWithNumber = {
    customerName: quoteData.customerName,
    projectName: quoteData.projectName,
    description: quoteData.description,
    products: quoteData.products,
    total: quoteData.total,
    quoteNumber,
  };

  const filePath = `${QUOTES_DIR}/quote-${quoteNumber}.json`;

  try {
    await ensureDirectoryExists();
    await fs.promises.writeFile(filePath, JSON.stringify(quoteWithNumber, null, 2));
    return {success: true, message: `Quote saved as quote-${quoteNumber}.json`};
  } catch (error) {
    console.error('Error saving quote:', error);
    return {success: false, message: 'Error saving quote'};
  }
}

export async function updateQuote(quoteData: Quote, quoteFilename: string) {
  const filePath = `${QUOTES_DIR}/${quoteFilename}`;

  try {
    await ensureDirectoryExists();
    await fs.promises.writeFile(filePath, JSON.stringify(quoteData, null, 2));
    return {success: true, message: `Quote updated successfully!`};
  } catch (error) {
    console.error('Error updating quote:', error);
    return {success: false, message: 'Error updating quote'};
  }
}


'use server';

import fs from 'fs';
import {Quote} from '@/types';

export async function saveQuote(quoteData: Quote) {
  const now = new Date();
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const dd = now.getDate().toString().padStart(2, '0');
  const yy = now.getFullYear().toString().slice(-2);
  const hh = now.getHours().toString().padStart(2, '0');
    const min = now.getMinutes().toString().padStart(2, '0');
    const quoteNumber = `${mm}${dd}${yy}${hh}${min}`;

  const quoteWithNumber = {
      customerName: quoteData.customerName,
      projectName: quoteData.projectName,
      description: quoteData.description,
      products: quoteData.products,
      total: quoteData.total,


    quoteNumber,
  };

  const quotesDir = 'public/quotes';
  const filePath = `${quotesDir}/quote-${quoteNumber}.json`;

  try {
    if (!fs.existsSync(quotesDir)) {
      fs.mkdirSync(quotesDir, {recursive: true});
    }
    await fs.promises.writeFile(filePath, JSON.stringify(quoteWithNumber, null, 2));
    return {success: true, message: `Quote saved as quote-${quoteNumber}.json`};
  } catch (error) {
    console.error('Error saving quote:', error);
    return {success: false, message: 'Error saving quote'};
  }
}
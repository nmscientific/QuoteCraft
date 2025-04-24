import {NextResponse} from 'next/server';
import fs from 'fs/promises';
import { Product } from '@/types';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'products.json');

export async function GET() {
  try {
     // Read the products data from the JSON file
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');    
    const products = JSON.parse(fileContent);
    
    return NextResponse.json({
        products
    });
  } catch (error: any) {
    console.error('Error reading data:', error);
    return new NextResponse(JSON.stringify({message: 'Error reading data'}), {
      status: 500,
      headers: {'Content-Type': 'application/json'},
    });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return new NextResponse(JSON.stringify({message: 'Data saved successfully'}), {
      status: 200,
      headers: {'Content-Type': 'application/json'},
    });
  } catch (error: any) {
    console.error('Error writing data:', error);
    return new NextResponse(JSON.stringify({message: 'Error writing data'}), {
      status: 500,
      headers: {'Content-Type': 'application/json'},
    });
  }
}

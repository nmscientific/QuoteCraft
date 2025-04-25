// src/app/api/salestax/route.ts
import {NextRequest, NextResponse} from 'next/server';
import fs from 'fs';
import path from 'path';

const SALES_TAX_FILE_PATH = path.join(process.cwd(), 'public', 'salestax.json');

export async function GET() {
  try {
    const data = fs.readFileSync(SALES_TAX_FILE_PATH, 'utf8');
    return NextResponse.json({salesTaxRate: parseFloat(data)});
  } catch (error) {
    console.error('Error reading sales tax data:', error);
    return NextResponse.json({salesTaxRate: 8.25});
  }
}

export async function POST(req: NextRequest) {
  try {
    const {salesTaxRate} = await req.json();
    fs.writeFileSync(SALES_TAX_FILE_PATH, salesTaxRate.toString());
    return NextResponse.json({message: 'Sales tax rate saved successfully'});
  } catch (error) {
    console.error('Error saving sales tax data:', error);
    return NextResponse.json(
      {message: 'Error saving sales tax rate'},
      {status: 500}
    );
  }
}
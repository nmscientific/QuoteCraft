import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const customersFilePath = path.join(process.cwd(), 'public', 'customers.json');

interface Customer {
  id: string;
  companyName: string;
  representativeName: string;
  address: string;
  phone: string;
  email: string;
  taxExempt: boolean;
}

async function readCustomers(): Promise<Customer[]> {
  try {
    const fileContent = await fs.readFile(customersFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File does not exist, return empty array
      return [];
    }
    throw error; // Re-throw other errors
  }
}

async function writeCustomers(customers: Customer[]): Promise<void> {
  await fs.writeFile(customersFilePath, JSON.stringify(customers, null, 2), 'utf-8');
}

export async function GET(request: NextRequest) {
  try {
    const customers = await readCustomers();
  } catch (error: any) {
    console.error('Error reading customers:', error);
    return NextResponse.json({ message: 'Error reading customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const newCustomer: Omit<Customer, 'id'> = await request.json();
    const customers = await readCustomers();
    const customerToAdd: Customer = { id: Date.now().toString(), ...newCustomer }; // Simple ID generation
    customers.push(customerToAdd);
    await writeCustomers(customers);
  } catch (error: any) {
    console.error('Error adding customer:', error);
    return NextResponse.json({ message: 'Error adding customer' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updatedCustomer: Customer = await request.json();
    let customers = await readCustomers();
    const index = customers.findIndex(cust => cust.id === updatedCustomer.id);

    if (index === -1) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }

    customers[index] = updatedCustomer;
    await writeCustomers(customers);
  } catch (error: any) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ message: 'Error updating customer' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    let customers = await readCustomers();
    const initialLength = customers.length;
    customers = customers.filter(cust => cust.id !== id);

    if (customers.length === initialLength) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }

    await writeCustomers(customers);
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ message: 'Error deleting customer' }, { status: 500 });
  }
}
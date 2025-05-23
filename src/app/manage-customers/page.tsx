'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface Customer {
  id: number;
  companyName: string;
  representativeName: string;
  address: string;
  phone: string;
  email: string;
  taxExempt: boolean;
}

const initialCustomers: Customer[] = [
  { id: 1, companyName: 'Acme Corp', representativeName: 'John Doe', address: '123 Main St', phone: '555-1234', email: 'john.doe@acme.com', taxExempt: false },
  { id: 2, companyName: 'Beta Inc', representativeName: 'Jane Smith', address: '456 Oak Ave', phone: '555-5678', email: 'jane.smith@beta.com', taxExempt: true },
];

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null); // For editing
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id'>>({
    companyName: '',
    representativeName: '',
    address: '',
    phone: '',
    email: '',
    taxExempt: false,
  });
  const [editCustomerData, setEditCustomerData] = useState<Omit<Customer, 'id'> | null>(null); // For editing

  const handleAddCustomer = () => {
    const customerToAdd: Customer = { id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1, ...newCustomer };
    setCustomers([...customers, customerToAdd]);
    setNewCustomer({ name: '', email: '' });
    setIsAddModalOpen(false);
  };

  const handleEditCustomer = (customer: Customer) => {
    setCurrentCustomer(customer);
    setEditCustomerData({ ...customer }); // Initialize edit form with current customer data
    setIsEditModalOpen(true);
  };

  const handleSaveCustomer = () => {
    if (currentCustomer && editCustomerData) {
      setCustomers(customers.map((c) => (c.id === currentCustomer.id ? { ...currentCustomer, ...editCustomerData } : c)));
      setIsEditModalOpen(false);
      setCurrentCustomer(null); // Clear current customer after saving
    }
  };

  const handleDeleteCustomer = (id: number) => {
    setCustomers(customers.filter((c) => c.id !== id));
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Customer Management</h1>

      <div className="flex justify-end mb-4">
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>Add Customer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="companyName" className="text-right">
                  Company Name
                </Label>
                <Input
                  id="companyName"
                  value={newCustomer.companyName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, companyName: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="representativeName" className="text-right">
                  Representative Name
                </Label>
                <Input
                  id="representativeName"
                  value={newCustomer.representativeName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, representativeName: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="taxExempt" className="text-right">
                  Tax Exempt
                </Label>
                <Checkbox
                  id="name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddCustomer}>Add Customer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Representative</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Tax Exempt</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.id}</TableCell>
              <TableCell>{customer.companyName}</TableCell>
              <TableCell>{customer.representativeName}</TableCell>
              <TableCell>{customer.address}</TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditCustomer(customer)}>
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteCustomer(customer.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-companyName" className="text-right">
                Company Name
              </Label>
              <Input
                id="edit-companyName"
                value={currentCustomer?.name || ''}
                onChange={(e) => setCurrentCustomer(currentCustomer ? { ...currentCustomer, name: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Representative Name
              </Label>
              <Input
                id="edit-representativeName"
                value={editCustomerData?.representativeName || ''}
                onChange={(e) => setEditCustomerData(editCustomerData ? { ...editCustomerData, representativeName: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-address" className="text-right">
                Address
              </Label>
              <Input
                id="edit-address"
                value={editCustomerData?.address || ''}
                onChange={(e) => setEditCustomerData(editCustomerData ? { ...editCustomerData, address: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">
                Phone
              </Label>
              <Input
                id="edit-phone"
                value={editCustomerData?.phone || ''}
                onChange={(e) => setEditCustomerData(editCustomerData ? { ...editCustomerData, phone: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editCustomerData?.email || ''}
                onChange={(e) => setEditCustomerData(editCustomerData ? { ...editCustomerData, email: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-taxExempt" className="text-right">
                Tax Exempt
              </Label>
              <Checkbox
                id="edit-taxExempt"
                checked={editCustomerData?.taxExempt || false}
                onCheckedChange={(checked) =>
                  setEditCustomerData(editCustomerData ? { ...editCustomerData, taxExempt: checked as boolean } : null)
                }
                value={currentCustomer?.email || ''}
                onChange={(e) => setCurrentCustomer(currentCustomer ? { ...currentCustomer, email: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveCustomer}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
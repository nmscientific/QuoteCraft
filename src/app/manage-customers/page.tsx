'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Assuming you have a table component
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// You might need other imports for modals, checkboxes, etc.
// import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { Checkbox } from "@/components/ui/checkbox";

// Define a type for your customer data
interface Customer {
  id: number;
  companyName: string;
  representativeName: string;
  address: string;
  phone: string;
  email: string;
  taxExempt: boolean;
}

const CustomerManagementPage = () => {
  // State for managing customer data
  const [customers, setCustomers] = useState<Customer[]>([]);
  // State for managing new customer input
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id'>>({ companyName: '', representativeName: '', address: '', phone: '', email: '', taxExempt: false });
  // State for managing edit customer input and currently editing customer ID
  // State for managing edit customer input
  const [editCustomerData, setEditCustomerData] = useState<Omit<Customer, 'id'> | null>(null);
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
  // State for controlling modal visibility
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Handler for input changes in the new customer form
  const handleNewCustomerInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setNewCustomer(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Handler for input changes in the edit customer form
  const handleEditCustomerInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setEditCustomerData(prev => {
      if (!prev) return null; // Should not happen if modal is open, but for safety
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
    });
  };

  // Handler for adding a new customer
  const handleAddCustomer = async () => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomer),
      });

      if (response.ok) {
        const addedCustomer = await response.json();
        setCustomers(prev => [...prev, addedCustomer]); // Add the new customer to the state
        setNewCustomer({ companyName: '', representativeName: '', address: '', phone: '', email: '', taxExempt: false }); // Reset form
        setIsAddModalOpen(false); // Close modal
      } else {
        console.error('Failed to add customer:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  // Handler for opening the edit modal and populating it
  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomerId(customer.id);
    // Omit the 'id' property when setting editCustomerData
    const { id, ...rest } = customer;
    setEditCustomerData(rest);
    setIsEditModalOpen(true);
  };

  // Handler for updating a customer
  const handleUpdateCustomer = async () => {
    if (editingCustomerId === null || editCustomerData === null) {
      console.error("No customer selected for editing.");
      return;
    }

    try {
      const response = await fetch(`/api/customers`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: editingCustomerId, ...editCustomerData }), // Include the ID in the body
      });

      if (response.ok) {
        const updatedCustomer = await response.json();
        setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)); // Update the state
        setIsEditModalOpen(false); // Close modal
        setEditingCustomerId(null); // Reset editing state
      } else {
        console.error('Failed to update customer:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };
  // Handler for deleting a customer
  const handleDeleteCustomer = async (id: number) => {
    // Ask for confirmation before deleting
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return; // Stop if the user cancels
    }

    try {
      // Send DELETE request to the API to delete the customer
      const response = await fetch(`/api/customers?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Filter out the deleted customer from the state
        setCustomers(customers.filter((c) => c.id !== id));
        console.log(`Customer with ID ${id} deleted successfully.`);
      } else if (response.status === 404) {
        console.error(`Customer with ID ${id} not found.`);
        alert(`Customer with ID ${id} not found.`); // Inform the user
      } else {
        console.error('Failed to delete customer:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  useEffect(() => {
    // Fetch customers from the API when the page loads
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCustomers(data);
        } else {
          console.error("API did not return an array:", data);
          setCustomers([]);
        }
      })
      .catch(error => {
        console.error('Error fetching customers:', error);
        setCustomers([]); // Set to empty array on fetch error
      });
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Customer Management</h1>

      {/* Add Customer Button */}
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsAddModalOpen(true)}>Add New Customer</Button>
      </div>

      {/* Add Customer Modal/Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={newCustomer.companyName}
                  onChange={handleNewCustomerInputChange}
                  className="mt-1 block w-full"
                />
              </div>
              <div>
                <label htmlFor="representativeName" className="block text-sm font-medium text-gray-700">Representative Name</label>
                <Input
                  id="representativeName"
                  name="representativeName"
                  value={newCustomer.representativeName}
                  onChange={handleNewCustomerInputChange}
                  className="mt-1 block w-full"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <Input
                  id="address"
                  name="address"
                  value={newCustomer.address}
                  onChange={handleNewCustomerInputChange}
                  className="mt-1 block w-full"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <Input
                  id="phone"
                  name="phone"
                  value={newCustomer.phone}
                  onChange={handleNewCustomerInputChange}
                  className="mt-1 block w-full"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={handleNewCustomerInputChange}
                  className="mt-1 block w-full"
                />
              </div>
              <div className="flex items-center">
                <Input
                  id="taxExempt"
                  name="taxExempt"
                  type="checkbox"
                  checked={newCustomer.taxExempt}
                  onChange={handleNewCustomerInputChange}
                  className="mr-2"
                />
                <label htmlFor="taxExempt" className="text-sm font-medium text-gray-700">Tax Exempt</label>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAddCustomer}>Add Customer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Table */}
      <div className="mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead className="w-[150px]">Representative Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tax Exempt</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.companyName}</TableCell>
                <TableCell>{customer.representativeName}</TableCell>
                <TableCell>{customer.address}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.taxExempt ? 'Yes' : 'No'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditCustomer(customer)}>Edit</Button>
                  {/* Original Delete button, keeping for reference if needed
                  <Button variant="destructive" size="sm" onClick={() => { /* TODO: Implement Delete */ }&rbrace;&gt;Delete</Button>
                  */&rbrace;
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteCustomer(customer.id)}>Delete</Button>
                </TableCell>
              </TableRow>
              )))&rbrace;
          </TableBody>
        </Table>
      </div>

      {/* Edit Customer Modal/Form */}
      {isEditModalOpen && editCustomerData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Customer</h2>
            <div className="space-y-4">
              {/* Input fields for editing */}
                <div>
                  <label htmlFor="editCompanyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                  <Input
                    id="editCompanyName"
                    name="companyName"
                    value={editCustomerData.companyName}
                    onChange={handleEditCustomerInputChange}
                    className="mt-1 block w-full"
                  />
                </div>
                <div>
                  <label htmlFor="editRepresentativeName" className="block text-sm font-medium text-gray-700">Representative Name</label>
                  <Input
                    id="editRepresentativeName"
                    name="representativeName"
                    value={editCustomerData.representativeName}
                    onChange={handleEditCustomerInputChange}
                    className="mt-1 block w-full"
                  />
                </div>
                <div>
                  <label htmlFor="editAddress" className="block text-sm font-medium text-gray-700">Address</label>
                  <Input
                    id="editAddress"
                    name="address"
                    value={editCustomerData.address}
                    onChange={handleEditCustomerInputChange}
                    className="mt-1 block w-full"
                  />
                </div>
                <div>
                  <label htmlFor="editPhone" className="block text-sm font-medium text-gray-700">Phone</label>
                  <Input
                    id="editPhone"
                    name="phone"
                    value={editCustomerData.phone}
                    onChange={handleEditCustomerInputChange}
                    className="mt-1 block w-full"
                  />
                </div>
                <div>
                  <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700">Email</label>
                  <Input
                    id="editEmail"
                    name="email"
                    type="email"
                    value={editCustomerData.email}
                    onChange={handleEditCustomerInputChange}
                    className="mt-1 block w-full"
                  />
                </div>
                <div className="flex items-center">
                  <Input
                    id="editTaxExempt"
                    name="taxExempt"
                    type="checkbox"
                    checked={editCustomerData.taxExempt}
                    onChange={handleEditCustomerInputChange}
                    className="mr-2"
                  />
                  <label htmlFor="editTaxExempt" className="text-sm font-medium text-gray-700">Tax Exempt</label>
                </div>
              </div>
            <div className="flex justify-end mt-6 space-x-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateCustomer}>Save Changes</Button>
            </div>
            </div>
          </div>
};

export default CustomerManagementPage;
'use client';

import { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Transaction {
  id: string;
  type: string;
  vendorName: string;
  itemName: string;
  amount: number;
  discount: number;
  quantity: number;
  payment_status: string;
  advance_amount: number;
  remaining_amount: number;
  due_date: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerData {
  name: string;
  totalAmount: number;
  transactions: Transaction[];
  pendingAmount: number;
  lastTransaction: Date;
  recentItem: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/purchases');
        
        if (!response.ok) {
          throw new Error('Failed to fetch customer data');
        }
        
        const transactions: Transaction[] = await response.json();
        
        // Filter for customer transactions (sales)
        const customerTransactions = transactions.filter(
          transaction => transaction.type === "sale"
        );
        
        // Group by customer name
        const customerMap = new Map<string, CustomerData>();
        
        customerTransactions.forEach(transaction => {
          const name = transaction.vendorName;
          const transactionAmount = transaction.amount || 0;
          const transactionDate = new Date(transaction.createdAt);
          const pendingAmount = transaction.remaining_amount || 0;
          const itemName = transaction.itemName || 'Unknown item';
          
          if (customerMap.has(name)) {
            const customer = customerMap.get(name)!;
            customer.totalAmount += transactionAmount;
            customer.pendingAmount += pendingAmount;
            customer.transactions.push(transaction);
            
            // Update last transaction date if this one is newer
            if (transactionDate > customer.lastTransaction) {
              customer.lastTransaction = transactionDate;
              customer.recentItem = itemName;
            }
          } else {
            customerMap.set(name, {
              name,
              totalAmount: transactionAmount,
              pendingAmount: pendingAmount,
              transactions: [transaction],
              lastTransaction: transactionDate,
              recentItem: itemName
            });
          }
        });
        
        // Convert map to array and sort by total amount
        const customersArray = Array.from(customerMap.values());
        customersArray.sort((a, b) => b.totalAmount - a.totalAmount);
        
        setCustomers(customersArray);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCustomers();
  }, []);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Customers"
        text="Manage your customer relationships and view transaction history."
      />
      
      {isLoading ? (
        <div className="flex items-center justify-center h-24">
          <p className="text-muted-foreground">Loading customer data...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>{error}</p>
              <p className="text-muted-foreground mt-2">Please try again later</p>
            </div>
          </CardContent>
        </Card>
      ) : customers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground p-4">
              <p>No customers found</p>
              <p className="text-sm mt-1">Customer data will appear here when you record sales</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Overview</CardTitle>
              <CardDescription>
                Complete list of customers and their transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Total Business</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Recent Purchase</TableHead>
                    <TableHead>Outstanding</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.name}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>₹{customer.totalAmount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>{customer.transactions.length}</TableCell>
                      <TableCell>{customer.lastTransaction.toLocaleDateString()}</TableCell>
                      <TableCell>
                        {customer.pendingAmount > 0 ? (
                          <Badge variant="outline">
                            ₹{customer.pendingAmount.toLocaleString('en-IN')}
                          </Badge>
                        ) : (
                          <Badge variant="default">Fully Paid</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer) => (
              <Card key={customer.name}>
                <CardHeader>
                  <CardTitle>{customer.name}</CardTitle>
                  <CardDescription>
                    {customer.transactions.length} transactions total
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Business</p>
                      <p className="text-2xl font-bold">₹{customer.totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Outstanding Balance</p>
                      <p className="text-xl font-medium">
                        {customer.pendingAmount > 0 
                          ? `₹${customer.pendingAmount.toLocaleString('en-IN')}`
                          : "No outstanding balance"}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Recent Purchase</p>
                      <div className="flex justify-between items-center mt-1">
                        <p>{customer.recentItem}</p>
                        <Badge variant="secondary">
                          {customer.lastTransaction.toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
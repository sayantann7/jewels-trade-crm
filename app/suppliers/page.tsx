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

interface SupplierData {
  name: string;
  totalAmount: number;
  transactions: Transaction[];
  pendingAmount: number;
  lastTransaction: Date;
  recentItem: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSuppliers() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/purchases');
        
        if (!response.ok) {
          throw new Error('Failed to fetch supplier data');
        }
        
        const transactions: Transaction[] = await response.json();
        
        // Filter for supplier transactions (purchases)
        const supplierTransactions = transactions.filter(
          transaction => transaction.type === "purchase"
        );
        
        // Group by supplier name
        const supplierMap = new Map<string, SupplierData>();
        
        supplierTransactions.forEach(transaction => {
          const name = transaction.vendorName;
          const transactionAmount = transaction.amount || 0;
          const transactionDate = new Date(transaction.createdAt);
          const pendingAmount = transaction.remaining_amount || 0;
          const itemName = transaction.itemName || 'Unknown item';
          
          if (supplierMap.has(name)) {
            const supplier = supplierMap.get(name)!;
            supplier.totalAmount += transactionAmount;
            supplier.pendingAmount += pendingAmount;
            supplier.transactions.push(transaction);
            
            // Update last transaction date if this one is newer
            if (transactionDate > supplier.lastTransaction) {
              supplier.lastTransaction = transactionDate;
              supplier.recentItem = itemName;
            }
          } else {
            supplierMap.set(name, {
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
        const suppliersArray = Array.from(supplierMap.values());
        suppliersArray.sort((a, b) => b.totalAmount - a.totalAmount);
        
        setSuppliers(suppliersArray);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSuppliers();
  }, []);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Suppliers"
        text="Manage your supplier relationships and view purchase history."
      />
      
      {isLoading ? (
        <div className="flex items-center justify-center h-24">
          <p className="text-muted-foreground">Loading supplier data...</p>
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
      ) : suppliers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground p-4">
              <p>No suppliers found</p>
              <p className="text-sm mt-1">Supplier data will appear here when you record purchases</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Overview</CardTitle>
              <CardDescription>
                Complete list of suppliers and their transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Total Business</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Recent Supply</TableHead>
                    <TableHead>Outstanding</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.name}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>₹{supplier.totalAmount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>{supplier.transactions.length}</TableCell>
                      <TableCell>{supplier.lastTransaction.toLocaleDateString()}</TableCell>
                      <TableCell>
                        {supplier.pendingAmount > 0 ? (
                          <Badge variant="outline">
                            ₹{supplier.pendingAmount.toLocaleString('en-IN')}
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
            {suppliers.map((supplier) => (
              <Card key={supplier.name}>
                <CardHeader>
                  <CardTitle>{supplier.name}</CardTitle>
                  <CardDescription>
                    {supplier.transactions.length} transactions total
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Business</p>
                      <p className="text-2xl font-bold">₹{supplier.totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Outstanding Balance</p>
                      <p className="text-xl font-medium">
                        {supplier.pendingAmount > 0 
                          ? `₹${supplier.pendingAmount.toLocaleString('en-IN')}`
                          : "No outstanding balance"}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Recent Item Supplied</p>
                      <div className="flex justify-between items-center mt-1">
                        <p>{supplier.recentItem}</p>
                        <Badge variant="secondary">
                          {supplier.lastTransaction.toLocaleDateString()}
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
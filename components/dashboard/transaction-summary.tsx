'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';

export function TransactionSummary() {
  const [summary, setSummary] = useState({
    currentMonthPurchases: 0,
    lastMonthPurchases: 0,
    purchasePercentChange: 0,
    currentMonthSales: 0,
    lastMonthSales: 0,
    salesPercentChange: 0,
    pendingPayables: 0,
    pendingReceivables: 0,
    pendingSuppliers: 0,
    pendingCustomers: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/purchases');
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        
        const data = await response.json();
        
        // Get current date info
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Get last month info
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        // Filter transactions for current month and last month
        interface Transaction {
          type: 'purchase' | 'sale';
          createdAt: string;
          amount: number;
          payment_status?: 'due' | 'overdue' | 'paid';
          remaining_amount?: number;
          vendorName?: string;
        }

        const currentMonthPurchases = data
          .filter((t: Transaction) => t.type === 'purchase' && 
                new Date(t.createdAt).getMonth() === currentMonth &&
                new Date(t.createdAt).getFullYear() === currentYear)
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        
        const lastMonthPurchases = data
          .filter((t: Transaction) => t.type === 'purchase' && 
                      new Date(t.createdAt).getMonth() === lastMonth &&
                      new Date(t.createdAt).getFullYear() === lastMonthYear)
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        
        const currentMonthSales = data
          .filter((t: Transaction) => t.type === 'sale' && 
                      new Date(t.createdAt).getMonth() === currentMonth &&
                      new Date(t.createdAt).getFullYear() === currentYear)
          .reduce((sum : number, t: Transaction) => sum + t.amount, 0);
        
        const lastMonthSales = data
          .filter((t: Transaction) => t.type === 'sale' && 
                      new Date(t.createdAt).getMonth() === lastMonth &&
                      new Date(t.createdAt).getFullYear() === lastMonthYear)
          .reduce((sum:number, t: Transaction) => sum + t.amount, 0);
        
        // Calculate percentage changes
        const purchasePercentChange = lastMonthPurchases === 0 
          ? 100 
          : Math.round(((currentMonthPurchases - lastMonthPurchases) / lastMonthPurchases) * 100);
        
        const salesPercentChange = lastMonthSales === 0 
          ? 100 
          : Math.round(((currentMonthSales - lastMonthSales) / lastMonthSales) * 100);
        
        // Calculate pending payables and receivables
        const pendingPayables = data
          .filter((t: Transaction) => t.type === 'purchase' && 
                      (t.payment_status === 'due' || t.payment_status === 'overdue'))
          .reduce((sum:number, t: Transaction) => sum + (t.remaining_amount ?? 0), 0);
        
        const pendingReceivables = data
          .filter((t: Transaction) => t.type === 'sale' && 
                      (t.payment_status === 'due' || t.payment_status === 'overdue'))
          .reduce((sum:number, t: Transaction) => sum + (t.remaining_amount ?? 0), 0);
        
        // Count unique suppliers and customers with pending payments
        const pendingSuppliers = new Set(
          data
            .filter((t: Transaction) => t.type === 'purchase' && 
                       (t.payment_status === 'due' || t.payment_status === 'overdue'))
            .map((t: Transaction) => t.vendorName)
        ).size;
        
        const pendingCustomers = new Set(
          data
            .filter((t: Transaction) => t.type === 'sale' && 
                       (t.payment_status === 'due' || t.payment_status === 'overdue'))
            .map((t: Transaction) => t.vendorName)
        ).size;
        
        setSummary({
          currentMonthPurchases,
          lastMonthPurchases,
          purchasePercentChange,
          currentMonthSales,
          lastMonthSales,
          salesPercentChange,
          pendingPayables,
          pendingReceivables,
          pendingSuppliers,
          pendingCustomers
        });
        
      } catch (error) {
        console.error('Error fetching transaction data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);
  
  // Format currency function
  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Loading...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded mt-2"></div>
              <div className="h-3 w-1/2 bg-muted animate-pulse rounded mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Purchases
          </CardTitle>
          <Icons.dollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.currentMonthPurchases)}</div>
          <p className="text-xs text-muted-foreground">
            {summary.purchasePercentChange > 0 ? '+' : ''}{summary.purchasePercentChange}% from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Sales
          </CardTitle>
          <Icons.users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.currentMonthSales)}</div>
          <p className="text-xs text-muted-foreground">
            {summary.salesPercentChange > 0 ? '+' : ''}{summary.salesPercentChange}% from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Payables
          </CardTitle>
          <Icons.clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.pendingPayables)}</div>
          <p className="text-xs text-muted-foreground">
            {summary.pendingSuppliers} suppliers pending
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Receivables
          </CardTitle>
          <Icons.timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.pendingReceivables)}</div>
          <p className="text-xs text-muted-foreground">
            {summary.pendingCustomers} customers pending
          </p>
        </CardContent>
      </Card>
    </>
  );
}
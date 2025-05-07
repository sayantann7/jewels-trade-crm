import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

// Define the Transaction interface to match our database schema
interface Transaction {
  id: string;
  createdAt: string;
  updatedAt: string;
  itemName: string;
  vendorName: string;
  quantity: number;
  unit_price: number;
  discount: number;
  amount: number;
  advance_amount: number;
  remaining_amount: number;
  payment_status: 'paid' | 'due' | 'overdue';
  due_date: string | null;
  type: string;
}

async function getPurchases() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/purchases`, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error('Failed to fetch purchases');
    }

    const transactions = await res.json();
    // Filter to only include type: "purchase"
    return transactions.filter((transaction: Transaction) => transaction.type === "sale");
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return [];
  }
}

export default async function PurchasesPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }

  const purchases = await getPurchases();

  // Format currency in Indian Rupee format
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Get a formatted date string
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Sales" 
        text="View and manage all your sales transactions."
      >
        <Link href="/sales/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Sale
          </Button>
        </Link>
      </DashboardHeader>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
          <CardDescription>
            Complete list of all sales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">No sale transactions found</p>
              <Link href="/purchases/new">
                <Button variant="outline">Record your first sale</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase: Transaction) => (
                    <TableRow key={purchase.id}>
                      <TableCell>{formatDate(purchase.createdAt)}</TableCell>
                      <TableCell className="font-medium">{purchase.vendorName}</TableCell>
                      <TableCell>{purchase.itemName}</TableCell>
                      <TableCell className="text-right">{purchase.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(purchase.unit_price)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(purchase.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          purchase.payment_status === 'paid' ? 'default' : 
                          purchase.payment_status === 'due' ? 'secondary' : 'destructive'
                        }>
                          {purchase.payment_status.charAt(0).toUpperCase() + purchase.payment_status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(purchase.due_date)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(purchase.remaining_amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
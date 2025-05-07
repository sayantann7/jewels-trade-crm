import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

// Transaction interface from the purchases API
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

// Payment interface for subsequent payments
interface Payment {
  id: string;
  transactionId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  notes?: string;
}

// Combined payment record for display
interface PaymentRecord {
  id: string;
  date: string;
  vendorName: string;
  amount: number;
  transactionType: 'purchase' | 'sale';
  paymentType: 'advance' | 'subsequent';
  relatedItem: string;
  paymentMethod?: string;
  transactionId: string;
}

async function getTransactionsAndPayments() {
  // Step 1: Get all transactions (for advance payments)
  let transactions: Transaction[] = [];
  try {
    const res = await fetch('/api/purchases');

    if (!res.ok) {
      throw new Error('Failed to fetch transactions');
    }

    transactions = await res.json();
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }

  // Step 2: Get subsequent payments
  let subsequentPayments: Payment[] = [];
  try {
    const res = await fetch('/api/purchases/payment', {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Failed to fetch subsequent payments');
      // Continue with just advance payments if this endpoint fails
    } else {
      subsequentPayments = await res.json();
    }
  } catch (error) {
    console.error('Error fetching payments:', error);
    // Continue with just advance payments if this endpoint fails
  }

  // Step 3: Process and combine payment records
  const paymentRecords: PaymentRecord[] = [];

  // Add advance payments
  transactions.forEach(transaction => {
    if (transaction.advance_amount > 0) {
      paymentRecords.push({
        id: `advance-${transaction.id}`,
        date: transaction.createdAt,
        vendorName: transaction.vendorName,
        amount: transaction.advance_amount,
        transactionType: transaction.type as 'purchase' | 'sale',
        paymentType: 'advance',
        relatedItem: transaction.itemName,
        transactionId: transaction.id
      });
    }
  });

  // Add subsequent payments and link to transactions
  subsequentPayments.forEach(payment => {
    const relatedTransaction = transactions.find(t => t.id === payment.transactionId);
    
    if (relatedTransaction) {
      paymentRecords.push({
        id: payment.id,
        date: payment.paymentDate,
        vendorName: relatedTransaction.vendorName,
        amount: payment.amount,
        transactionType: relatedTransaction.type as 'purchase' | 'sale',
        paymentType: 'subsequent',
        relatedItem: relatedTransaction.itemName,
        paymentMethod: payment.paymentMethod,
        transactionId: relatedTransaction.id
      });
    }
  });

  // Sort by date (most recent first)
  paymentRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return paymentRecords;
}

export default async function PaymentsPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }

  const payments = await getTransactionsAndPayments();

  // Format currency in Indian Rupee format
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Payments History" 
        text="View all payments made to suppliers and received from customers."
      />

      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
          <CardDescription>
            Comprehensive list of all advance and subsequent payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">No payment records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Vendor/Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Payment Stage</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.date)}</TableCell>
                      <TableCell className="font-medium">{payment.vendorName}</TableCell>
                      <TableCell>
                        <Badge variant={payment.transactionType === 'purchase' ? 'outline' : 'default'}>
                          {payment.transactionType.charAt(0).toUpperCase() + payment.transactionType.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{payment.relatedItem}</TableCell>
                      <TableCell>
                        <Badge variant={payment.paymentType === 'advance' ? 'secondary' : 'default'}>
                          {payment.paymentType === 'advance' ? 'Advance' : 'Subsequent'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
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
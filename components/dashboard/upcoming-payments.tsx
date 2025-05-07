'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface DuePayment {
  id: string;
  type: 'payable' | 'receivable';
  party: string;
  amount: string;
  due: string;
  daysLeft: number;
}

interface Payment {
  id: string;
  type: 'purchase' | 'sale';
  vendorName: string;
  remaining_amount: number;
  due_date: string;
  payment_status: 'due' | 'overdue' | 'paid';
}

interface UpcomingPaymentsProps {
  className?: string;
}

export function UpcomingPayments({ className }: UpcomingPaymentsProps) {
  const [payments, setPayments] = useState<Array<{
    id: string;
    type: 'payable' | 'receivable';
    party: string;
    amount: string;
    due: string;
    daysLeft: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingPayments = async () => {
      try {
        const response = await fetch('/api/purchases');
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        
        const data = await response.json();
        
        // Get current date
        const now = new Date();
        
        // Filter for upcoming payments (due in the next 30 days)
        const duePayments = data
          .filter((payment:Payment) => {
            // Check if payment status is due or overdue
            if (payment.payment_status !== 'due' && payment.payment_status !== 'overdue') {
              return false;
            }
            
            const dueDate = new Date(payment.due_date);
            const timeDiff = dueDate.getTime() - now.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            // Include if due within the next 30 days or is overdue
            return daysDiff <= 30;
            })
            .map((payment: Payment) => {
            const dueDate = new Date(payment.due_date);
            const timeDiff = dueDate.getTime() - now.getTime();
            const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            return {
              id: payment.id,
              type: payment.type === 'purchase' ? 'payable' : 'receivable',
              party: payment.vendorName,
              amount: `₹${payment.remaining_amount.toLocaleString('en-IN')}`,
              due: payment.due_date,
              daysLeft: daysLeft,
            } as DuePayment;
            })
            .sort((a: DuePayment, b: DuePayment) => a.daysLeft - b.daysLeft) // Sort by days left
          .slice(0, 5); // Take the 5 most imminent payments
        
        setPayments(duePayments);
        
      } catch (error) {
        console.error('Error fetching upcoming payments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUpcomingPayments();
  }, []);

  if (loading) {
    return (
      <Card className={cn('col-span-3', className)}>
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
          <CardDescription>
            Payments due soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-14" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // If no upcoming payments
  if (payments.length === 0) {
    return (
      <Card className={cn('col-span-3', className)}>
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
          <CardDescription>
            No payments due soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            No upcoming payments in the next 30 days
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('col-span-3', className)}>
      <CardHeader>
        <CardTitle>Upcoming Payments</CardTitle>
        <CardDescription>
          Payments due in the next 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {payment.party}
                </p>
                <p className="text-sm text-muted-foreground">
                  Due on {new Date(payment.due).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-medium">{payment.amount}</div>
                <Badge variant={payment.type === 'payable' ? 'destructive' : 'default'}>
                  {payment.type === 'payable' ? 'Pay' : 'Receive'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
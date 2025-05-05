'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UpcomingPaymentsProps {
  className?: string;
}

export function UpcomingPayments({ className }: UpcomingPaymentsProps) {
  const payments = [
    {
      id: 1,
      type: 'payable',
      party: 'GemSource Inc.',
      amount: '₹45,000',
      due: '2025-04-12',
      daysLeft: 2,
    },
    {
      id: 2,
      type: 'receivable',
      party: 'Luxury Jewels',
      amount: '₹78,000',
      due: '2025-04-13',
      daysLeft: 3,
    },
    {
      id: 3,
      type: 'payable',
      party: 'Diamond Traders',
      amount: '₹1,25,000',
      due: '2025-04-14',
      daysLeft: 4,
    },
    {
      id: 4,
      type: 'receivable',
      party: 'Royal Jewelry',
      amount: '₹92,000',
      due: '2025-04-15',
      daysLeft: 5,
    },
  ];

  return (
    <Card className={cn('col-span-3', className)}>
      <CardHeader>
        <CardTitle>Upcoming Payments</CardTitle>
        <CardDescription>
          Payments due in the next 5 days
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
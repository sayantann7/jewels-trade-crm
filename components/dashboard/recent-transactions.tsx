'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function RecentTransactions() {
  const transactions = [
    {
      id: 1,
      date: '2025-04-08',
      type: 'purchase',
      party: 'GemSource Inc.',
      item: 'Emerald, 120 carats',
      amount: '₹2,35,000',
      status: 'Partial',
    },
    {
      id: 2,
      date: '2025-04-07',
      type: 'sale',
      party: 'Luxury Jewels',
      item: 'Ruby, 85 carats',
      amount: '₹3,15,000',
      status: 'Paid',
    },
    {
      id: 3,
      date: '2025-04-06',
      type: 'purchase',
      party: 'Diamond Traders',
      item: 'Diamond, 45 carats',
      amount: '₹4,75,000',
      status: 'Pending',
    },
    {
      id: 4,
      date: '2025-04-05',
      type: 'sale',
      party: 'Royal Jewelry',
      item: 'Sapphire, 65 carats',
      amount: '₹1,85,000',
      status: 'Partial',
    },
    {
      id: 5,
      date: '2025-04-04',
      type: 'sale',
      party: 'Elite Gems',
      item: 'Emerald, 40 carats',
      amount: '₹95,000',
      status: 'Paid',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          Your recent purchase and sale transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Party</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={transaction.type === 'purchase' ? 'outline' : 'secondary'}>
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.party}</TableCell>
                <TableCell>{transaction.item}</TableCell>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      transaction.status === 'Paid'
                        ? 'default'
                        : transaction.status === 'Partial'
                        ? 'outline'
                        : 'destructive'
                    }
                  >
                    {transaction.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
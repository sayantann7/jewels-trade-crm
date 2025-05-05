'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownToLine, ArrowUpFromLine, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  const router = useRouter();
  
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Create new records or transactions</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button 
          variant="outline" 
          className="justify-start h-14"
          onClick={() => router.push('/purchases/new')}
        >
          <ArrowDownToLine className="mr-2 h-4 w-4" />
          New Purchase
        </Button>
        <Button 
          variant="outline" 
          className="justify-start h-14"
          onClick={() => router.push('/sales/new')}
        >
          <ArrowUpFromLine className="mr-2 h-4 w-4" />
          New Sale
        </Button>
        <Button 
          variant="outline" 
          className="justify-start h-14"
          onClick={() => router.push('/transactions/new')}
        >
          <Wallet className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </CardContent>
    </Card>
  );
}
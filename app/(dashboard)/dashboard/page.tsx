import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { TransactionSummary } from '@/components/dashboard/transaction-summary';
import { UpcomingPayments } from '@/components/dashboard/upcoming-payments';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
    // if (!session) {
    //   redirect('/login');
    // }
  
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="View your business at a glance." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TransactionSummary />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <UpcomingPayments className="lg:col-span-4" />
        <QuickActions className="lg:col-span-3" />
      </div>
      <div>
        <RecentTransactions />
      </div>
    </DashboardShell>
  );
}
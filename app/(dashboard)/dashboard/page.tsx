import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { TransactionSummary } from '@/components/dashboard/transaction-summary';
import { UpcomingPayments } from '@/components/dashboard/upcoming-payments';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

export default async function DashboardPage() {
    const session = await getServerSession();
    if (!session?.user?.email) {
      redirect('/login');
    }
  
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
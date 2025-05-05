import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { SaleForm } from '@/components/sales/sale-form';

export default async function NewSalePage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }
  
  return (
    <DashboardShell>
      <DashboardHeader heading="New Sale" text="Record a new sale transaction." />
      <div className="grid gap-8">
        <SaleForm />
      </div>
    </DashboardShell>
  );
}
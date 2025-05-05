import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { PurchaseForm } from '@/components/purchases/purchase-form';
import { getServerSession } from 'next-auth';

export default async function NewPurchasePage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }
  
  return (
    <DashboardShell>
      <DashboardHeader heading="New Purchase" text="Record a new purchase transaction." />
      <div className="grid gap-8">
        <PurchaseForm />
      </div>
    </DashboardShell>
  );
}
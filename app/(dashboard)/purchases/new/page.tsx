import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { PurchaseForm } from '@/components/purchases/purchase-form';

export default async function NewPurchasePage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
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
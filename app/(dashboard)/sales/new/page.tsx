import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { SaleForm } from '@/components/sales/sale-form';

export default async function NewSalePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
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
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { toast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

export default function NewTransactionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [type, setType] = useState('all');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  
  // Fetch pending transactions
  useEffect(() => {
    const fetchPendingTransactions = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/transactions/pending');
        setPendingTransactions(response.data);
        setFilteredTransactions(response.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch pending transactions.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPendingTransactions();
  }, []);
  
  // Filter transactions by type
  useEffect(() => {
    if (type === 'all') {
      setFilteredTransactions(pendingTransactions);
    } else {
      setFilteredTransactions(
        pendingTransactions.filter(transaction => transaction.type === type)
      );
    }
    setSelectedEntity('');
    setSelectedTransaction(null);
  }, [type, pendingTransactions]);
  
  // Handle transaction selection
  const handleTransactionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEntity(e.target.value);
    const selected = pendingTransactions.find(t => 
      (t.type === 'purchase' ? t.vendorName : t.customerName) === e.target.value
    );
    setSelectedTransaction(selected);
    setAmount(selected ? selected.remaining_amount.toString() : '');
  };
  
  // Form validation
  useEffect(() => {
    if (!selectedEntity) {
      setError('Please select a customer or supplier');
    } else if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
    } else if (selectedTransaction && parseFloat(amount) > selectedTransaction.remaining_amount) {
      setError('Amount cannot exceed the remaining balance');
    } else {
      setError('');
    }
  }, [selectedEntity, amount, selectedTransaction]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (error) return;
    
    setIsSubmitting(true);
    
    try {
      await axios.post('/api/transactions/payment', {
        transactionId: selectedTransaction.id,
        amount: parseFloat(amount),
      });
      
      toast({
        title: 'Success',
        description: `Payment of ₹${parseFloat(amount).toLocaleString('en-IN')} recorded successfully.`,
      });
      
      // Reset form
      setSelectedEntity('');
      setAmount('');
      setSelectedTransaction(null);
      
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to record payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Record Payment" 
        text="Clear pending payments for customers or suppliers" 
      />
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden border">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 border-b">
            <h2 className="text-lg font-semibold">Payment Details</h2>
            <p className="text-sm text-muted-foreground">
              Record a payment to clear outstanding balances
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Transaction Type Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Transaction Type</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md border transition-colors ${
                    type === 'all' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background hover:bg-muted/50'
                  }`}
                  onClick={() => setType('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md border transition-colors ${
                    type === 'purchase' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background hover:bg-muted/50'
                  }`}
                  onClick={() => setType('purchase')}
                >
                  Suppliers
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md border transition-colors ${
                    type === 'sale' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background hover:bg-muted/50'
                  }`}
                  onClick={() => setType('sale')}
                >
                  Customers
                </button>
              </div>
            </div>
            
            {/* Entity Selection */}
            <div className="space-y-2">
              <label htmlFor="entity" className="block text-sm font-medium">
                {type === 'purchase' ? 'Select Supplier' : type === 'sale' ? 'Select Customer' : 'Select Entity'}
              </label>
              <div className="relative">
                <select
                  id="entity"
                  className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  value={selectedEntity}
                  onChange={handleTransactionSelect}
                  disabled={isLoading || filteredTransactions.length === 0}
                >
                  <option value="">Select...</option>
                  {filteredTransactions.map((transaction, index) => (
                    <option 
                      key={index} 
                      value={transaction.type === 'purchase' ? transaction.vendorName : transaction.customerName}
                    >
                      {transaction.type === 'purchase' ? transaction.vendorName : transaction.customerName} - 
                      ₹{transaction.remaining_amount.toLocaleString('en-IN')} due
                    </option>
                  ))}
                </select>
                
                {isLoading && (
                  <div className="absolute right-3 top-3">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                
                {filteredTransactions.length === 0 && !isLoading && (
                  <div className="mt-2 text-sm text-muted-foreground flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    No pending transactions found
                  </div>
                )}
              </div>
            </div>
            
            {/* Transaction Details */}
            {selectedTransaction && (
              <div className="bg-muted/50 p-4 rounded-md space-y-3">
                <h3 className="text-sm font-medium">Transaction Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{selectedTransaction.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {new Date(selectedTransaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-medium">₹{selectedTransaction.amount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Outstanding</p>
                    <p className="font-medium text-destructive">
                      ₹{selectedTransaction.remaining_amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Payment Amount */}
            <div className="space-y-2">
              <label htmlFor="amount" className="block text-sm font-medium">
                Payment Amount (₹)
              </label>
              <div className="relative">
                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter payment amount"
                  className="w-full pl-8 pr-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={!selectedTransaction}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-muted-foreground">₹</span>
                </div>
              </div>
              
              {selectedTransaction && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => setAmount(selectedTransaction.remaining_amount.toString())}
                  >
                    Clear full amount (₹{selectedTransaction.remaining_amount.toLocaleString('en-IN')})
                  </button>
                </div>
              )}
            </div>
            
            {error && (
              <div className="text-sm text-destructive flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}
            
            <div className="pt-4 flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedEntity || !amount || !!error || isSubmitting}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Record Payment
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
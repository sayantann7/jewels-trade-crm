'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, IndianRupee, CalendarIcon, Package2, Percent, CreditCard } from 'lucide-react';

// Schema for validation
const purchaseFormSchema = z.object({
  supplier: z.string().min(2, 'Supplier name is required'),
  itemName: z.string().min(2, 'Item name is required'),
  itemType: z.string().min(1, 'Item type is required'),
  quantity: z.number().gt(0, 'Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Unit price must be a valid number'),
  discountRate: z.number().min(0).max(100, 'Discount rate must be between 0 and 100'),
  advancePayment: z.number().min(0, 'Advance payment must be a valid number'),
  dueDate: z.string().min(1, 'Due date is required'),
});

export function PurchaseForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state variables - initialize as empty strings for clean initial form
  const [supplier, setSupplier] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemType] = useState('general');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [discountRate, setDiscountRate] = useState<number | ''>('');
  const [advancePayment, setAdvancePayment] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Calculation state variables
  const [grossAmount, setGrossAmount] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  
  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Calculate derived values
  useEffect(() => {
    const qtyValue = typeof quantity === 'number' ? quantity : 0;
    const priceValue = typeof unitPrice === 'number' ? unitPrice : 0;
    const discountValue = typeof discountRate === 'number' ? discountRate : 0;
    const advanceValue = typeof advancePayment === 'number' ? advancePayment : 0;
    
    const gross = qtyValue * priceValue;
    const discount = gross * (discountValue / 100);
    const net = gross - discount;
    
    setGrossAmount(gross);
    setNetAmount(net);
    setRemainingBalance(net - advanceValue);
    
    // Limit advance payment to net amount
    if (advanceValue > net && typeof advancePayment === 'number') {
      setAdvancePayment(net);
    }
  }, [quantity, unitPrice, discountRate, advancePayment]);
  
  // Validate form
  const validateForm = () => {
    const validationErrors: Record<string, string> = {};
    
    // Pre-validation checks for empty fields that should be required
    if (quantity === '') {
      validationErrors.quantity = 'Quantity is required';
    }
    if (unitPrice === '') {
      validationErrors.unitPrice = 'Unit price is required';
    }
    if (!supplier) {
      validationErrors.supplier = 'Supplier name is required';
    }
    if (!itemName) {
      validationErrors.itemName = 'Item name is required';
    }
    
    // Only proceed with Zod validation if the pre-validation passed
    if (Object.keys(validationErrors).length === 0) {
      try {
        // Convert empty values to 0 for validation
        purchaseFormSchema.parse({
          supplier,
          itemName,
          itemType,
          quantity: typeof quantity === 'number' ? quantity : 0,
          unitPrice: typeof unitPrice === 'number' ? unitPrice : 0,
          discountRate: typeof discountRate === 'number' ? discountRate : 0,
          advancePayment: typeof advancePayment === 'number' ? advancePayment : 0,
          dueDate
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            if (err.path.length > 0) {
              validationErrors[err.path[0].toString()] = err.message;
            }
          });
        }
      }
    }
    
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const isValid = validateForm();
    if (!isValid) {
      toast({
        title: 'Form Error',
        description: 'Please fix the errors in the form before submitting.',
        variant: 'destructive',
      });
      return;
    }
    
    // Prevent double submission
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Convert dueDate from YYYY-MM-DD to ISO-8601 DateTime format
      const isoDateTime = new Date(dueDate).toISOString();
      
      const purchaseData = {
        vendorName: supplier,
        itemName,
        quantity: typeof quantity === 'number' ? quantity : 0,
        unit_price: typeof unitPrice === 'number' ? unitPrice : 0,
        discount: typeof discountRate === 'number' ? discountRate : 0,
        amount: netAmount,
        advance_amount: typeof advancePayment === 'number' ? advancePayment : 0,
        remaining_amount: remainingBalance,
        due_date: isoDateTime,
        type: "purchase",
      };
      
      console.log('Sending purchase data to API:', purchaseData);
      
      const response = await axios.post('/api/purchases', purchaseData);
      
      if (response.status !== 201) {
        console.error('API returned non-success status:', response.status);
        toast({
          title: 'Error',
          description: 'Failed to record the purchase.',
          variant: 'destructive',
        });
        return;
      }
      
      toast({
        title: 'Success',
        description: 'Purchase recorded successfully.',
      });
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error submitting purchase:', error);
      toast({
        title: 'Error',
        description: 'Failed to record the purchase. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <form 
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* Supplier Information */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-foreground">Supplier Information</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="supplier" className="block text-sm font-medium text-foreground">
                Supplier Name
              </label>
              <div className="relative">
                <input
                  id="supplier"
                  type="text"
                  placeholder="Enter supplier name"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className={`w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                    errors.supplier ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.supplier && (
                <p className="text-sm text-red-500">{errors.supplier}</p>
              )}
            </div>
          </div>
        </div>

        {/* Item Details */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-foreground">Item Details</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label htmlFor="itemName" className="block text-sm font-medium text-foreground">
                Item Name
              </label>
              <div className="relative">
                <input
                  id="itemName"
                  type="text"
                  placeholder="Enter Item name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className={`w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                    errors.itemName ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.itemName && (
                <p className="text-sm text-red-500">{errors.itemName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="quantity" className="block text-sm font-medium text-foreground">
                  Quantity (Carats/Grams)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                    <Package2 className="h-4 w-4" />
                  </div>
                  <input
                    id="quantity"
                    type="number"
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    value={quantity}
                    onChange={(e) => {
                      const value = e.target.value === '' ? '' : Number(e.target.value);
                      setQuantity(value);
                    }}
                    className={`w-full rounded-md border pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                      errors.quantity ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.quantity && (
                  <p className="text-sm text-red-500">{errors.quantity}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="unitPrice" className="block text-sm font-medium text-foreground">
                  Unit Price (₹)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                    <IndianRupee className="h-4 w-4" />
                  </div>
                  <input
                    id="unitPrice"
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => {
                      const value = e.target.value === '' ? '' : Number(e.target.value);
                      setUnitPrice(value);
                    }}
                    className={`w-full rounded-md border pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                      errors.unitPrice ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.unitPrice && (
                  <p className="text-sm text-red-500">{errors.unitPrice}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Details */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-foreground">Payment Details</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="discountRate" className="block text-sm font-medium text-foreground">
                  Discount Rate (%)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                    <Percent className="h-4 w-4" />
                  </div>
                  <input
                    id="discountRate"
                    type="number"
                    placeholder="0"
                    min="0"
                    max="100"
                    value={discountRate}
                    onChange={(e) => {
                      const value = e.target.value === '' ? '' : Number(e.target.value);
                      setDiscountRate(value);
                    }}
                    className={`w-full rounded-md border pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                      errors.discountRate ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.discountRate && (
                  <p className="text-sm text-red-500">{errors.discountRate}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="advancePayment" className="block text-sm font-medium text-foreground">
                  Advance Payment (₹)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <input
                    id="advancePayment"
                    type="number"
                    placeholder="0.00"
                    min="0"
                    max={netAmount}
                    value={advancePayment}
                    onChange={(e) => {
                      const value = e.target.value === '' ? '' : Number(e.target.value);
                      if (typeof value === 'number' && value > netAmount) {
                        setAdvancePayment(netAmount);
                      } else {
                        setAdvancePayment(value);
                      }
                    }}
                    className={`w-full rounded-md border pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                      errors.advancePayment ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.advancePayment && (
                  <p className="text-sm text-red-500">{errors.advancePayment}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="dueDate" className="block text-sm font-medium text-foreground">
                  Payment Due Date
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                    <CalendarIcon className="h-4 w-4" />
                  </div>
                  <input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={`w-full rounded-md border pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                      errors.dueDate ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.dueDate && (
                  <p className="text-sm text-red-500">{errors.dueDate}</p>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <h4 className="text-sm font-medium text-slate-500 mb-4">Purchase Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Gross Amount:</span>
                    <span className="font-medium text-foreground">₹{grossAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Discount ({typeof discountRate === 'number' ? discountRate : 0}%):</span>
                    <span className="font-medium text-foreground">₹{(grossAmount * (typeof discountRate === 'number' ? discountRate : 0) / 100).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-200">
                    <span className="text-sm text-slate-600">Net Amount:</span>
                    <span className="font-medium text-lg text-foreground">₹{netAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Advance Payment:</span>
                    <span className="font-medium text-green-600">₹{(typeof advancePayment === 'number' ? advancePayment : 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-200">
                    <span className="text-sm text-slate-600">Remaining Balance:</span>
                    <span className="font-medium text-lg text-rose-600">₹{remainingBalance.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 sticky bottom-0 py-3 bg-white border-t px-6 mt-8 -mx-8">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> 
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-black px-6" 
          >
            {isSubmitting ? 'Saving...' : 'Save Purchase'}
          </Button>
        </div>
      </form>
    </div>
  );
}
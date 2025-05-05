'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

const purchaseFormSchema = z.object({
  supplier: z.string().min(2, 'Supplier name is required'),
  itemName: z.string().min(2, 'Item name is required'),
  itemType: z.string().min(1, 'Item type is required'),
  quantity: z.string().transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, 'Quantity must be greater than 0'),
  unitPrice: z.string().transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, 'Unit price must be a valid number'),
  discountRate: z.string().transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0 && val <= 100, 'Discount rate must be between 0 and 100'),
  advancePayment: z.string().transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, 'Advance payment must be a valid number'),
  dueDate: z.string().min(1, 'Due date is required'),
});

type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;

export function PurchaseForm() {
  const router = useRouter();
  const [grossAmount, setGrossAmount] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      supplier: '',
      itemDescription: '',
      itemType: '',
      quantity: 0,
      unitPrice: 0,
      discountRate: 0,
      advancePayment: 0,
      dueDate: new Date().toISOString().split('T')[0],
    },
  });
  
  const { watch, setValue } = form;
  const quantity = Number(watch('quantity'));
  const unitPrice = Number(watch('unitPrice'));
  const discountRate = Number(watch('discountRate'));
  const advancePayment = Number(watch('advancePayment'));
  
  useEffect(() => {
    const gross = quantity * unitPrice;
    const discount = gross * (discountRate / 100);
    const net = gross - discount;
    
    setGrossAmount(gross);
    setNetAmount(net);
    setRemainingBalance(net - advancePayment);
  }, [quantity, unitPrice, discountRate, advancePayment]);
  
  async function onSubmit(data: PurchaseFormValues) {
    console.log('Form submitted:', data);
    toast({
      title: 'Purchase recorded',
      description: 'The purchase has been successfully recorded.',
    });
  
    const purchaseData = {
      vendorName: data.supplier,
      itemName: data.itemName,
      quantity: data.quantity,
      unit_price: data.unitPrice,
      discount: data.discountRate,
      amount: netAmount,
      advance_amount: advancePayment,
      remaining_amount: remainingBalance,
      due_date: data.dueDate,
      type: "purchase",
    };
  
    try {
      const response = await axios.post('/api/purchases', purchaseData);
  
      if (response.status !== 201) {
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
  
      form.reset();
      router.push('/dashboard');
    } catch (error) {
      console.error('Error submitting purchase:', error);
      toast({
        title: 'Error',
        description: 'Failed to record the purchase.',
        variant: 'destructive',
      });
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter supplier name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="itemName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Item name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity (Carats/Grams)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        placeholder="Enter quantity" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter unit price"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="discountRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Rate (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Enter discount rate"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="advancePayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Advance Payment (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="0"
                        placeholder="Enter advance payment"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          const value = e.target.value;
                          if (Number(value) > netAmount) {
                            setValue('advancePayment', netAmount.toString());
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Gross Amount</p>
                <p className="text-2xl font-bold">₹{grossAmount.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Net Amount</p>
                <p className="text-2xl font-bold">₹{netAmount.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Advance Paid</p>
                <p className="text-2xl font-bold">₹{advancePayment.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Remaining Balance</p>
                <p className="text-2xl font-bold">₹{remainingBalance.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit">Save Purchase</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
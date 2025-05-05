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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

const saleFormSchema = z.object({
  customer: z.string().min(2, 'Customer name is required'),
  itemDescription: z.string().min(3, 'Item description is required'),
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

type SaleFormValues = z.infer<typeof saleFormSchema>;

export function SaleForm() {
  const router = useRouter();
  const [grossAmount, setGrossAmount] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  
  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customer: '',
      itemDescription: '',
      itemType: '',
      quantity: '0',
      unitPrice: '0',
      discountRate: '0',
      advancePayment: '0',
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
  
  function onSubmit(data: SaleFormValues) {
    toast({
      title: 'Sale recorded',
      description: 'The sale has been successfully recorded.',
    });
    
    // Reset form and redirect
    form.reset();
    router.push('/sales');
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="customer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer name" {...field} />
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
              name="itemType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="diamond">Diamond</SelectItem>
                      <SelectItem value="ruby">Ruby</SelectItem>
                      <SelectItem value="emerald">Emerald</SelectItem>
                      <SelectItem value="sapphire">Sapphire</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="itemDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter item description" {...field} />
                  </FormControl>
                  <FormDescription>
                    Include quality, size, color, and any other relevant details.
                  </FormDescription>
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
            <Button type="submit">Record Sale</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
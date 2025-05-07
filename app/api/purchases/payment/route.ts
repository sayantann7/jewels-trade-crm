import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { transactionId, amount } = await request.json();

    // Get current transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });
    
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }
    
    // Calculate new remaining amount
    const newRemainingAmount = Math.max(0, transaction.remaining_amount - amount);
    
    // Determine payment status
    let paymentStatus = 'due';
    if (newRemainingAmount === 0) {
      paymentStatus = 'paid';
    } else if (new Date(transaction.due_date) < new Date()) {
      paymentStatus = 'overdue';
    }
    
    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        remaining_amount: newRemainingAmount,
        payment_status: paymentStatus
      }
    });
    
    // Create payment history record
    const paymentRecord = await prisma.paymentHistory.create({
      data: {
        transactionId: transactionId,
        amount: amount,
        paymentDate: new Date(),
        type: transaction.type
      }
    });
    
    return NextResponse.json({ 
      transaction: updatedTransaction,
      payment: paymentRecord
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const payments = await prisma.paymentHistory.findMany({
      select: {
        id: true,
        amount: true,
        paymentDate: true,
        type: true,
        transactionId: true
      }
    });
    
    return NextResponse.json(payments, { status: 200 });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}
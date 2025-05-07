import { PrismaClient } from "@/app/generated/prisma";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

function determinePaymentStatus(remainingAmount: number, dueDate: Date | string | null): 'paid' | 'due' | 'overdue' {
    // If no remaining amount, it's fully paid
    if (remainingAmount <= 0) {
      return 'paid';
    }
    
    // If no due date, it's due (can't be overdue without a date)
    if (!dueDate) {
      return 'due';
    }
    
    // Convert to Date object if it's a string
    const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const currentDate = new Date();
    
    // Compare dates - if due date has passed, it's overdue
    return currentDate > dueDateObj ? 'overdue' : 'due';
  }

export async function POST(request: Request) {
    const body = await request.json();
    const { itemName, vendorName, quantity, discount, amount, remaining_amount, due_date, type, advance_amount, unit_price } = body;

    console.log("Received data:", body);

    const payment_status = determinePaymentStatus(remaining_amount, due_date);

    try {
        const purchase = await prisma.transaction.create({
            data: {
                itemName, vendorName, quantity, discount, amount, payment_status, remaining_amount, due_date, type, advance_amount, unit_price
            },
        });
        return NextResponse.json(purchase, { status: 201 });
    } catch (error) {
        console.error("Error creating purchase:", error);
        return NextResponse.json({ error: "Failed to create purchase" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const purchases = await prisma.transaction.findMany({});
        return NextResponse.json(purchases, { status: 200 });
    } catch (error) {
        console.error("Error creating purchase:", error);
        return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 });
    }
}


export async function DELETE(request: Request) {
    const { id } = await request.json();

    try {
        const purchase = await prisma.transaction.delete({
            where: { id },
        });
        return NextResponse.json(purchase, { status: 200 });
    } catch (error) {
        console.error("Error creating purchase:", error);
        return NextResponse.json({ error: "Failed to delete purchase" }, { status: 500 });
    }
}
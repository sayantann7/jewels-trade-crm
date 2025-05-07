import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const pendingTransactions = await prisma.transaction.findMany({
      where: {
        payment_status: {
          in: ['due', 'overdue']
        },
        remaining_amount: {
          gt: 0
        }
      },
      orderBy: {
        due_date: 'asc'
      }
    });
    
    return NextResponse.json(pendingTransactions, { status: 200 });
  } catch (error) {
    console.error("Error fetching pending transactions:", error);
    return NextResponse.json({ error: "Failed to fetch pending transactions" }, { status: 500 });
  }
}
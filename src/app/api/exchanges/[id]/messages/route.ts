import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const messages = await db.message.findMany({
    where: { exchangeId: id },
    include: { sender: true },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(messages);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { senderId, content, isSystem } = body;

  if (!senderId || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const message = await db.message.create({
    data: {
      exchangeId: id,
      senderId,
      content,
      isSystem: isSystem || false,
    },
    include: { sender: true },
  });

  // Update exchange timestamp
  await db.exchange.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json(message, { status: 201 });
}

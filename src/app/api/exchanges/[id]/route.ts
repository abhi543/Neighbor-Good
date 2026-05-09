import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const exchange = await db.exchange.findUnique({
    where: { id },
    include: {
      post: { include: { author: true } },
      requester: true,
      owner: true,
      messages: { include: { sender: true }, orderBy: { createdAt: 'asc' } },
    },
  });

  if (!exchange) {
    return NextResponse.json({ error: 'Exchange not found' }, { status: 404 });
  }

  return NextResponse.json(exchange);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status, rating, badgeGiven } = body;

  const updateData: Record<string, unknown> = {};
  if (status) updateData.status = status;
  if (rating !== undefined) updateData.rating = rating;
  if (badgeGiven !== undefined) updateData.badgeGiven = badgeGiven;

  const exchange = await db.exchange.update({
    where: { id },
    data: updateData,
    include: {
      post: { include: { author: true } },
      requester: true,
      owner: true,
      messages: { include: { sender: true }, orderBy: { createdAt: 'asc' } },
    },
  });

  // If completing with a thumbs up, update warmth scores
  if (status === 'COMPLETED' && rating === 1) {
    await db.user.update({
      where: { id: exchange.ownerId },
      data: { warmthScore: { increment: 1 }, gaveCount: { increment: 1 } },
    });
    await db.user.update({
      where: { id: exchange.requesterId },
      data: { receivedCount: { increment: 1 } },
    });
  }

  return NextResponse.json(exchange);
}

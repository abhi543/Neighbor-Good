import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { reporterId, targetId, reason } = body;

  if (!reporterId || !targetId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (reporterId === targetId) {
    return NextResponse.json({ error: 'Cannot flag yourself' }, { status: 400 });
  }

  const flag = await db.flag.create({
    data: { reporterId, targetId, reason },
  });

  // Increment flag count on target
  await db.user.update({
    where: { id: targetId },
    data: { flagCount: { increment: 1 } },
  });

  return NextResponse.json(flag, { status: 201 });
}

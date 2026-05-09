import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const status = searchParams.get('status');

  const where: Record<string, unknown> = {};

  if (status && status !== 'ALL') {
    where.status = status;
  }
  if (userId) {
    where.OR = [{ requesterId: userId }, { ownerId: userId }];
  }

  const exchanges = await db.exchange.findMany({
    where,
    include: {
      post: { include: { author: true } },
      requester: true,
      owner: true,
      messages: { include: { sender: true }, orderBy: { createdAt: 'asc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Add message count to each exchange
  const exchangesWithCount = await Promise.all(
    exchanges.map(async (exchange) => {
      const messageCount = await db.message.count({
        where: { exchangeId: exchange.id },
      });
      return { ...exchange, _count: { messages: messageCount } };
    })
  );

  return NextResponse.json(exchangesWithCount);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { postId, requesterId } = body;

  if (!postId || !requesterId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const post = await db.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const exchange = await db.exchange.create({
    data: {
      postId,
      requesterId,
      ownerId: post.authorId,
      status: 'PENDING',
    },
    include: {
      post: { include: { author: true } },
      requester: true,
      owner: true,
    },
  });

  return NextResponse.json(exchange, { status: 201 });
}

import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const authorId = searchParams.get('authorId');

  const where: Record<string, unknown> = { status: 'ACTIVE' };

  if (type && type !== 'ALL') {
    where.type = type;
  }
  if (category && category !== 'ALL') {
    where.category = category;
  }
  if (authorId) {
    where.authorId = authorId;
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const posts = await db.post.findMany({
    where,
    include: { author: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, title, description, category, imageUrl, lat, lng, expiresAt, authorId } = body;

  if (!title || !type || !category || !expiresAt || !authorId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const post = await db.post.create({
    data: {
      type,
      title,
      description,
      category,
      imageUrl,
      lat,
      lng,
      expiresAt: new Date(expiresAt),
      status: 'ACTIVE',
      authorId,
    },
    include: { author: true },
  });

  return NextResponse.json(post, { status: 201 });
}

import { NextResponse } from 'next/server';
import { db } from '../../../lib/database-client';

export async function POST(request: Request) {
  try {
    const { sql, params } = await request.json();
    const result = await db.query(sql, params);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
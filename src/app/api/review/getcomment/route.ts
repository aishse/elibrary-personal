import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const review_id = searchParams.get('review_id'); // Get the 'id' parameter
  

  if (!review_id) {
    return NextResponse.json({ error: 'Missing review_id' }, { status: 400 });
  }
  try {
    const [rows] = await promisePool.query('Select * from Comment WHERE review_id = ?', [review_id]);

    return NextResponse.json({ reviews: rows });

  } catch (error) {

    console.error('Error querying database:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
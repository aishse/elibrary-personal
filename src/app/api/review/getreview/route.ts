import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isbn_13 = searchParams.get('isbn_13'); // Get the 'id' parameter
  

  if (!isbn_13) {
    return NextResponse.json({ error: 'Missing isbn' }, { status: 400 });
  }
  try {
    const [rows] = await promisePool.query('SELECT * FROM REVIEW r where r.isbn_13 = ?', [isbn_13]);

    return NextResponse.json({ reviews: rows });

  } catch (error) {

    console.error('Error querying database:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
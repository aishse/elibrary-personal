import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get('isbn'); 

  try {
    
    const genre = await promisePool.query("SELECT name FROM Book_Has_Genre WHERE isbn_13 = ?", [isbn]);

    return NextResponse.json({ genre });

  } catch (error) {

    console.error('Error querying database:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}


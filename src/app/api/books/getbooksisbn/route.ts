import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get('isbn'); 

  try {
    
    const [rows] = await promisePool.query("SELECT b.*, a.f_name, a.l_name FROM Book b JOIN Book_Has_Author bha ON b.isbn_13 = bha.isbn_13 JOIN Author a ON bha.author_id = a.author_id WHERE b.isbn_13 = ?", [isbn]);

    return NextResponse.json({ book: rows });

  } catch (error) {

    console.error('Error querying database:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}


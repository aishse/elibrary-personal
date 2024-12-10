import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const book_search = searchParams.get('filter'); 
  
  console.log(book_search); 
  if (!book_search) {
    return NextResponse.json({ error: 'Missing search' }, { status: 400 });
  }
  try {
     const searchPattern = `%${book_search}%`;
    const [rows] = await promisePool.query("SELECT * FROM Book WHERE title LIKE ?",[searchPattern]
    );

    if (Array.isArray(rows) && rows.length === 0) {
      // No username found
      return NextResponse.json({ error: 'No books found' }, { status: 404 });
    }

    return NextResponse.json({ books: rows });

  } catch (error) {

    console.error('Error querying database:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
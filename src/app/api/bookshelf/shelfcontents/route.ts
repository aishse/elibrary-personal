import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookshelf_id = searchParams.get('bookshelf_id'); // Get the 'id' parameter
  

  if (!bookshelf_id) {
    return NextResponse.json({ error: 'Missing bookshelf_id' }, { status: 400 });
  }
  try {
    const [rows] = await promisePool.query('SELECT * FROM Book b WHERE b.isbn_13 IN (SELECT isbn_13 FROM Bookshelf_Contents WHERE bookshelf_id = ?)', [bookshelf_id]);

    return NextResponse.json({ books: rows });

  } catch (error) {

    console.error('Error querying database:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
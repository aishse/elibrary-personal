
import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
 
  const { bookshelf_id, isbn_13} = await request.json(); 
  
  if (!bookshelf_id || !isbn_13) {

    return NextResponse.json({ error: 'Missing bookshelf id or isbn id' }, { status: 400 });
  }
  try {
    await promisePool.query("INSERT INTO Bookshelf_Contents (bookshelf_id, isbn_13) VALUES (?, ?)", [bookshelf_id, isbn_13]);
    return NextResponse.json({ message: 'Book added successfully' });


  } catch (error) {
    //console.error('Error querying database:', error);
   // sends error code
    return NextResponse.json(error, { status: 500 });
  }
}
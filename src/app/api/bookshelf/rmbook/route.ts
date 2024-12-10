
import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
 
  const { bookshelf_id, isbn_13} = await request.json(); 

  if (!bookshelf_id ) {
    return NextResponse.json({ error: 'Missing shelf id or isbn_id' }, { status: 400 });
  }
  try {
    await promisePool.query("DELETE FROM Bookshelf_Contents WHERE WHERE bookshelf_id = ? AND isbn_13 = ?", [bookshelf_id, isbn_13 ]);
    return NextResponse.json({ message: 'Bookshelf removed successfully' });


  } catch (error) {
    console.error('Error querying database:', error);
   // sends error code
    return NextResponse.json(error.code, { status: 500 });
  }
}
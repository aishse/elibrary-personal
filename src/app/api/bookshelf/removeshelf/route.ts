
import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
 
  const { bookshelf_id } = await request.json(); 

  if (!bookshelf_id ) {
    return NextResponse.json({ error: 'Missing shelf id' }, { status: 400 });
  }
  try {
    await promisePool.query("DELETE FROM Bookshelf WHERE bookshelf_id = ?", [bookshelf_id ]);
    return NextResponse.json({ message: 'Bookshelf removed successfully' });


  } catch (error) {
    console.error('Error querying database:', error);
   // sends error code
    return NextResponse.json(error.code, { status: 500 });
  }
}
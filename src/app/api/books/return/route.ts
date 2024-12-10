
import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
 
  const { user_id, isbn_13 } = await request.json(); 

  if (!user_id || !isbn_13) {

    return NextResponse.json({ error: 'Missing user id or isbn_13' }, { status: 400 });
  }
  try {
    await promisePool.query("DELETE FROM Borrow WHERE user_id = ? AND isbn_13 = ?", [user_id, isbn_13]);
    return NextResponse.json({ message: 'Book returned successfully' });


  } catch (error) {
    console.error('Error querying database:', error);
   // sends error code
    return NextResponse.json(error.code, { status: 500 });
  }
}
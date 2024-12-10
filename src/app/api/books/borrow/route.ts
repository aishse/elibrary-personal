
import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
 
  const { user_id, isbn_13 } = await request.json(); 

  if (!isbn_13 || !user_id) {
    return NextResponse.json({ error: 'Missing user id or isbn_13' }, { status: 400 });
  }
  try {
    await promisePool.query("INSERT INTO Borrow (user_id, isbn_13) VALUES (?, ?)", [user_id, isbn_13]);
    return NextResponse.json({ message: 'Book borrowed successfully' });


  } catch (error) {
    console.error('Error querying database:', error);
   // sends error code
    return NextResponse.json(error.code, { status: 500 });
  }
}
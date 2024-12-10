
import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
 
  const { user_id, isbn_13, current_page } = await request.json(); 

  if (!isbn_13 || !user_id || !current_page) {
    return NextResponse.json({ error: 'Missing user id or isbn_13 or current page' }, { status: 400 });
  }
  try {
    await promisePool.query("UPDATE Read_Book SET current_page = ? WHERE user_id = ? AND isbn_13 = ?", [current_page, user_id, isbn_13]);
    return NextResponse.json({ message: 'Added new book read successfully' });


  } catch (error) {
    console.error('Error querying database:', error);
   // sends error code
    return NextResponse.json(error.code, { status: 500 });
  }
}
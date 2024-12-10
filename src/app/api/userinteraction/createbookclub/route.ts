
import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
 
  const { book_club_name, moderator_user_id } = await request.json(); 

  if (!book_club_name || !moderator_user_id) {
    return NextResponse.json({ error: 'Missing bookclub name or moderator id' }, { status: 400 });
  }
  try {
    await promisePool.query("INSERT INTO Book_Club(name, moderator) VALUES (?, ?)", [book_club_name, moderator_user_id]);
    return NextResponse.json({ message: 'Book club created successfully' });


  } catch (error) {
    console.error('Error querying database:', error);
   // sends error code
    return NextResponse.json(error.code, { status: 500 });
  }
}
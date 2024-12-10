
import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
 
  const { club_id, user_id } = await request.json(); 

  if (!club_id || !user_id) {
    return NextResponse.json({ error: 'Missing club id or user id' }, { status: 400 });
  }
  try {
    await promisePool.query("INSERT INTO Book_Club_Membership (club_id, user_id) VALUES (?, ?)", [club_id, user_id ]);
    return NextResponse.json({ message: 'Book club member added successfully' });


  } catch (error) {
    console.error('Error querying database:', error);
   // sends error code
    return NextResponse.json(error.code, { status: 500 });
  }
}
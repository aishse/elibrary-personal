
import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
 
  const { user_id, review_id, text} = await request.json(); 

  if (!user_id || !review_id || !text) {

    return NextResponse.json({ error: 'Missing comment information' }, { status: 400 });
  }
  try {
    await promisePool.query("INSERT INTO Comment (user_id, review_id, text) VALUES (?, ?, ?)", [user_id, review_id, text]);
    return NextResponse.json({ message: 'Comment created successfully' });


  } catch (error) {
    console.error('Error querying database:', error);
   // sends error code
    return NextResponse.json(error.code, { status: 500 });
  }
}
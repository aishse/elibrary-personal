
import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
 
  const { user_id, isbn_13, rating, text} = await request.json(); 

  if (!user_id || !isbn_13 || !rating || !text) {

    return NextResponse.json({ error: 'Missing review information' }, { status: 400 });
  }
  try {
    await promisePool.query("INSERT INTO Review (user_id, isbn_13, rating, text) VALUES (?, ?, ?, ?)", [user_id, isbn_13, rating, text]);
    return NextResponse.json({ message: 'Review created successfully' });


  } catch (error) {
    console.error('Error querying database:', error);
   // sends error code
    return NextResponse.json(error.code, { status: 500 });
  }
}

import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
 
  const { user_id, bookshelf_name } = await request.json(); 

  if (!user_id || !bookshelf_name ) {
    return NextResponse.json({ error: 'Missing user id or bookshelf name' }, { status: 400 });
  }
  try {
    await promisePool.query("INSERT INTO Bookshelf (user_id, name) VALUES (?, ?)", [user_id, bookshelf_name ]);
    return NextResponse.json({ message: 'Bookshelf created successfully' });


  } catch (error) {
    console.error('Error querying database:', error);
   // sends error code
    return NextResponse.json(error.code, { status: 500 });
  }
}
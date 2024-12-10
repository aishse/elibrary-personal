import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function PUT(request: Request) {

  const {current_page, user_id, isbn_13} = await request.json();
  

  if (!current_page || !user_id || !isbn_13) {
    return NextResponse.json({ error: 'Missing page, user id, or isbn' }, { status: 400 });
  }
  try {
     
    const [rows] = await promisePool.query("UPDATE Read_Books SET current_page = ? WHERE user_id = ? AND isbn_13 = ?", [current_page, user_id, isbn_13]);
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }
  
    return NextResponse.json({ message: 'Book updated successfully' });

  } catch (error) {

    console.error('Error querying database:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}


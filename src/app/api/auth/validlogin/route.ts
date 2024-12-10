import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
 
  const url = new URL(request.url);
  const username = url.searchParams.get('email');

  if (!username) {
    return NextResponse.json({ error: 'Missing user' }, { status: 400 });
  }
  try {
    const [rows] = await promisePool.query("SELECT password, user_id FROM User WHERE email = ?", [username]);
    
    if (!Array.isArray(rows) || rows.length === 0) {
      // No username found
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ password: rows });


  } catch (error) {
    console.error('Error querying database:', error);
   // sends error code
    return NextResponse.json(error.code, { status: 500 });
  }
}
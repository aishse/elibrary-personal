
import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username'); // Get the 'id' parameter


  if (!username) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }
  try {
    const [rows] = await promisePool.query('SELECT user_id FROM User WHERE username = ?', [username]);


    if ((rows as any[]).length === 1) {
      // No username found
      return NextResponse.json({ error: 'Username not found' }, { status: 404 });
    }

    return NextResponse.json({ users: rows });

  } catch (error) {

    console.error('Error querying database:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
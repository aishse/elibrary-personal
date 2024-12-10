import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  

  if (!username) {
    return NextResponse.json({ error: 'Missing username' }, { status: 400 });
  }
  try {
    
    const [rows] = await promisePool.query("SELECT * FROM User WHERE username LIKE ? LIMIT 10", '%' + username + '%');

    return NextResponse.json({ users: rows });

  } catch (error) {

    console.error('Error querying database:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
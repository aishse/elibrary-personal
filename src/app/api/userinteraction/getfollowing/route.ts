import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get('user_id'); // Get the 'id' parameter
  

  if (!user_id) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
  }
  try {
    
    const [rows] = await promisePool.query("SELECT User.username FROM User JOIN Follower ON Follower.user_id = User.user_id WHERE Follower.follower_id = ?", user_id);

    return NextResponse.json({ following: rows });

  } catch (error) {

    console.error('Error querying database:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
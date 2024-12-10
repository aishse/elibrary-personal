import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user_search = searchParams.get('user_search'); // Get the 'id' parameter
  

  if (!user_search) {
    return NextResponse.json({ error: 'Missing search' }, { status: 400 });
  }
  try {
     const searchPattern = `%${user_search}%`;
    const [rows] = await promisePool.query(
        "SELECT Book_Club.club_id, Book_Club.name FROM Book_Club WHERE Book_Club.moderator IN (SELECT User.user_id FROM User WHERE User.username LIKE ?)",
        [searchPattern]
    );

    if (rows.length === 0) {
      // No username found
      return NextResponse.json({ error: 'No bookclubs found' }, { status: 404 });
    }

    return NextResponse.json({ users: rows });

  } catch (error) {

    console.error('Error querying database:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
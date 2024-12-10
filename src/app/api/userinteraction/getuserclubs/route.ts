import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get('user_id'); // Get the 'id' parameter
  

  if (!user_id) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
  }
  try {
    const [rows] = await promisePool.query(
        `SELECT Book_Club.*, User.username
        FROM Book_Club_Membership
        JOIN Book_Club ON Book_Club_Membership.club_id = Book_Club.club_id
        JOIN User ON Book_Club.moderator = User.user_id
        WHERE Book_Club_Membership.user_id = ?`, [user_id]);

    return NextResponse.json({ clubs: rows });

  } catch (error) {

    console.error('Error querying database:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}

import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
 
  const { user_id, follower_id } = await request.json(); 

  if (!user_id || !follower_id) {
    return NextResponse.json({ error: 'Missing user or follower_id' }, { status: 400 });
  }
  try {
    await promisePool.query("DELETE FROM Follower WHERE user_id = ? AND follower_id = ?", [user_id, follower_id]);
    return NextResponse.json({ message: 'Follower deleted successfully' });


  } catch (error) {
    console.error('Error querying database:', error);
   // sends error code
    return NextResponse.json(error.code, { status: 500 });
  }
}
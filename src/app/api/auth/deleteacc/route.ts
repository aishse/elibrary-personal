
import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
 
  const { user_id } = await request.json(); 

  if (!user_id ) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
  }
  try {
    await promisePool.query("DELETE FROM User WHERE user_id = ?", [user_id]);
    return NextResponse.json({ message: 'User deleted successfully' });
    

  } catch (error) {
    console.error('Error querying database:', error);
   // sends error code
    return NextResponse.json(error.code, { status: 500 });
  }
}
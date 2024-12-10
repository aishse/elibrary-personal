
import promisePool from '../../../../lib/db'; 

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
 
  const { username, password, email } = await request.json(); 

  if (!username || !password || !email) {
    return NextResponse.json({ error: 'Missing email. pswrd, or username' }, { status: 400 });
  }
  try {
    await promisePool.query("INSERT INTO User (username, password, email) VALUES (?, ?, ?)", [username, password, email]);
    
    console.log("Retrieving user_id...");
    const [userResult] = await promisePool.query(
      "SELECT user_id FROM User WHERE email = ?",
      [email]
    );
    const userId = userResult[0]?.user_id;

    console.log("user_id retrieved:", userId);
    if (!userId) {
      throw new Error("User ID not found after insertion.");
    }

    console.log("Inserting into Bookshelf...");
    await promisePool.query(
      "INSERT INTO Bookshelf(user_id, name) VALUES (?, ?)",
      [userId, "read-books"]
    );
   
    return NextResponse.json({ message: 'User created successfully' });


  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: `Username '${error.sqlMessage.split("'")[1]}' already exists.` },
        { status: 409 } 
      );
    }
   // sends error code
   console.error(error); 
    return NextResponse.json(error.code, { status: 500 });
  }
}
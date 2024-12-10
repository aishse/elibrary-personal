// use this as a template for other routes, just modify the query with what you need

import promisePool from '../../../lib/db'; 

import { NextResponse } from 'next/server';
export async function GET(request: Request) {
  try {
    const [rows] = await promisePool.query('SELECT * FROM User');
    return NextResponse.json({ users: rows });

  } catch (error) {
    console.error('Error querying database:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}


import promisePool from "../../../../lib/db";

import { NextResponse } from "next/server";
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const user_id = searchParams.get("user_id"); // Get the 'id' parameter

	if (!user_id) {
		return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
	}
	try {
		const [rows] = await promisePool.query(
			`SELECT Book.isbn_13, Book.title, Request.request_date
            FROM Request 
            JOIN Book ON Request.isbn_13 = Book.isbn_13
            WHERE Request.user_id = ?`,
			[user_id]
		);

		return NextResponse.json({ borrowed: rows });
	} catch (error) {
		console.error("Error querying database:", error);
		// sends error code
		return NextResponse.json(error.code, { status: 500 });
	}
}

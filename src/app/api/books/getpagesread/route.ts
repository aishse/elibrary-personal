import promisePool from "../../../../lib/db";

import { NextResponse } from "next/server";
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const user_id = searchParams.get("user_id"); // Get the 'id' parameter

	if (!user_id) {
		return NextResponse.json({ error: "Missing user_id or isbn_13" }, { status: 400 });
	}
	try {
		const [rows] = await promisePool.query(
			`SELECT Read_Book.isbn_13, Read_Book.current_page, Book.title
            FROM Read_Book
            JOIN Book ON Read_Book.isbn_13 = Book.isbn_13
            WHERE Read_Book.user_id = ?`,
			[user_id]
		);

		return NextResponse.json({ books: rows });
	} catch (error) {
		console.error("Error querying database:", error);
		// sends error code
		return NextResponse.json(error.code, { status: 500 });
	}
}

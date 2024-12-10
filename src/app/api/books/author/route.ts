import promisePool from "../../../../lib/db";

import { NextResponse } from "next/server";
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const book_search = searchParams.get("filter");

	if (!book_search) {
		return NextResponse.json({ error: "Missing search" }, { status: 400 });
	}
	try {
		const searchPattern = `%${book_search}%`;
		const [rows] = await promisePool.query(
			`SELECT b.* 
      FROM Book b 
      JOIN Book_Has_Author ON b.isbn_13 = Book_Has_Author.isbn_13 
      JOIN Author ON Book_Has_Author.author_id = Author.author_id
      WHERE CONCAT(Author.f_name, ' ', Author.l_name) LIKE ?;`,
			[searchPattern]
		);

		if (Array.isArray(rows) && rows.length === 0) {
			// No username found
			return NextResponse.json({ error: "No books found" }, { status: 404 });
		}

		return NextResponse.json({ books: rows });
	} catch (error) {
		console.error("Error querying database:", error);
		return NextResponse.json(
			{ error: "Database query failed" },
			{ status: 500 }
		);
	}
}

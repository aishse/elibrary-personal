import promisePool from "../../../../lib/db";

import { NextResponse } from "next/server";
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const isbn_13 = searchParams.get("isbn_13"); // Get the 'id' parameter

	if (!isbn_13) {
		return NextResponse.json({ error: "Missing isbn_13" }, { status: 400 });
	}
	try {
		const [rows] = await promisePool.query(
			"SELECT available_copies(isbn_13) AS copies FROM Book WHERE isbn_13 = ?",
			[isbn_13]
		);

		if ((rows as any[]).length === 0) {
			// No book found
			return NextResponse.json({ error: "Book not found" }, { status: 404 });
		}

		return NextResponse.json({ book: rows });
	} catch (error) {
		console.error("Error querying database:", error);
		return NextResponse.json(
			{ error: "Database query failed" },
			{ status: 500 }
		);
	}
}

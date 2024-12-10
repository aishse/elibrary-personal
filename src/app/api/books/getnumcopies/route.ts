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
			`SELECT available_copies(Book.isbn_13)
            FROM Book 
            WHERE Book.isbn_13 = ?`,
			[isbn_13]
		);

		return NextResponse.json({ borrowed: rows });
	} catch (error) {
		console.error("Error querying database:", error);
		// sends error code
		return NextResponse.json(error.code, { status: 500 });
	}
}

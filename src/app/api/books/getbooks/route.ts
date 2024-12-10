import promisePool from "../../../../lib/db";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		const [rows] = await promisePool.query("SELECT b.* FROM Book b");

		return NextResponse.json({ books: rows });
	} catch (error) {
		console.error("Error querying database:", error);
		return NextResponse.json(
			{ error: "Database query failed" },
			{ status: 500 }
		);
	}
}

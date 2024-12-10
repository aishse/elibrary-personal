import promisePool from "../../../../lib/db";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		const [rows] = await promisePool.query("SELECT Book_Club.*, User.username FROM Book_Club JOIN User ON User.user_id = Book_Club.moderator");

		return NextResponse.json({ clubs: rows });
	} catch (error) {
		console.error("Error querying database:", error);
		return NextResponse.json(
			{ error: "Database query failed" },
			{ status: 500 }
		);
	}
}

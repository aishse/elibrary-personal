import promisePool from "../../../../lib/db";

import { NextResponse } from "next/server";
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const user_id = searchParams.get("user_id"); // Get the 'id' parameter

	if (!user_id) {
		return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
	}
	try {
		const [rows] = await promisePool.query(
			"SELECT * FROM User WHERE user_id = ?",
			[user_id]
		);

		if ((rows as any[]).length === 0) {
			// No username found
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json({ user: rows });
	} catch (error) {
		console.error("Error querying database:", error);
		return NextResponse.json(
			{ error: "Database query failed" },
			{ status: 500 }
		);
	}
}

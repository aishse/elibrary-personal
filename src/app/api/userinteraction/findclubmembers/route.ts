import promisePool from "../../../../lib/db";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const club_id = searchParams.get("club_id"); // Get the 'id' parameter

	if (!club_id) {
		return NextResponse.json({ error: "Missing club_id" }, { status: 400 });
	}
	try {
		const [rows] = await promisePool.query(
			`SELECT User.username
            FROM Book_Club_Membership 
            JOIN User ON Book_Club_Membership.user_id = User.user_id
            WHERE Book_Club_Membership.club_id = ?
			ORDER BY User.username`,
			[club_id]
		);

		return NextResponse.json({ members: rows });
	} catch (error) {
		console.error("Error querying database:", error);
		return NextResponse.json(
			{ error: "Database query failed" },
			{ status: 500 }
		);
	}
}

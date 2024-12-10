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
			`SELECT User.username, Book.title, Review.rating
      FROM Review
      JOIN User ON Review.user_id = User.user_id
      JOIN Book ON Review.isbn_13 = Book.isbn_13
      JOIN Activity_Feed_Post ON Review.review_id = Activity_Feed_Post.review_id 
      WHERE Activity_Feed_Post.owner_id = ?`,
			user_id
		);

		return NextResponse.json({ reviews: rows });
	} catch (error) {
		console.error("Error querying database:", error);
		return NextResponse.json(
			{ error: "Database query failed" },
			{ status: 500 }
		);
	}
}

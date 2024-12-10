"use client";

import axios from "axios";
import { useEffect, useState } from "react";

export default function ActivityPage() {
	const [feed, setFeed] = useState<any[]>([]);

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		fetchFeed();
		setLoading(false);
	}, []);

	const fetchFeed = async () => {
		console.log("fetching feed...");
		try {
			// making GET request from the relevant api route
			let response = await axios.get(
				`/api/userinteraction/activityfeed?user_id=${localStorage.getItem(
					"user_id"
				)}`
			);
			setFeed(response.data.reviews);
		} catch (error) {
			console.log("Error fetching data:", error);
		}
	};

	return (
		<>
			<div className="container mx-48 my-10">
				{/* Display loading sign while data is being fetched */}
				{loading ? (
					<h1 className="text-4xl font-semibold mt-10">Loading...</h1>
				) : (
					<div>
						<div className="flex flex-row">
							<div>
								<h1 className="text-4xl font-bold row">Activity Feed</h1>
								<p className="mb-10">
									View or manage your activites and interactions with the
									library system.
								</p>
							</div>
						</div>
						<div id="books-list">
							{
								/* Displays all reviews posted by user's following */
								feed.length == 0 ? (
									<p>No activity to display</p>
								) : (
									feed.map((post) => (
										<div
											className="border rounded flex flex-row m-5 p-5 w-2/3"
											key={`${post.review_id}`}
										>
											<div id={`book-cover-${post}`}>
											</div>
											<div id={`book-content-${post}`} className="ml-5">
												<h4>{post.username} posted a review on {post.title}</h4>
												<p>
												{
												"⭐".repeat(post.rating)
												}</p>
											</div>
										</div>
									))
								)
							}
						</div>
					</div>
				)}
			</div>
		</>
	);
}

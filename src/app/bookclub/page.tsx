"use client";

import axios from "axios";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BookClub() {
	const [clubs, setClubs] = useState<any[]>([]);
	const [members, setMembers] = useState<any[]>([]);
	const [currentClubs, setCurrentClubs] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	const searchParams = useSearchParams();
	const clubId = searchParams.get("club_id");
	const router = useRouter();

	// Load clubs or members if clubId is not null
	useEffect(() => {
		setLoading(true);
		fetchClubs();
		if (clubId != null) {
			fetchMembers();
		}
		setLoading(false);
	}, [clubId]);

	// Get all clubs, or one if specified as parameter
	const fetchClubs = async () => {
		try {
			const response1 = await axios.get(`/api/userinteraction/getclubs`);
			if (clubId != null) {
				for (let i = 0; i < response1.data.clubs.length; i++) {
					if (response1.data.clubs[i].club_id == clubId) {
						setClubs(response1.data.clubs[i]);
						break;
					}
				}
			} else {
				setClubs(response1.data.clubs);
			}
			const response2 = await axios.get(
				`/api/userinteraction/getuserclubs?user_id=${localStorage.getItem(
					"user_id"
				)}`
			);
			setCurrentClubs(response2.data.clubs.map((club) => club.club_id));
		} catch (error) {
			console.error("Error fetching test route data:", error);
		}
	};

	// Get all members
	const fetchMembers = async () => {
		try {
			const response = await axios.get(
				`/api/userinteraction/findclubmembers?club_id=${clubId}`
			);
			setMembers(response.data.members);
		} catch (error) {
			console.error("Error fetching test route data:", error);
		}
	};

	// Join club
	const joinClub = async (event) => {
		try {
			const response = await fetch("/api/userinteraction/createclubmember", {
				method: "POST",
				body: JSON.stringify({
					user_id: localStorage.getItem("user_id"),
					club_id: event.target.id,
				}),
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			console.error("Error fetching test route data:", error);
		}
	};

	// Navigate to specific club using params
	const goToClub = async (event) => {
		router.push(`/bookclub?club_id=${event.target.id}`);
	};

	return (
		<>
			<div className="container mx-48 my-10">
				{/* Display loading sign while data is being fetched */}
				{loading ? (
					<h1 className="text-4xl font-semibold mt-10">Loading...</h1>
				) : (
					<div>
						<div className="flex justify-between w-2/3">
							<div>
								<h1 className="text-4xl font-bold row">Book Clubs</h1>
								<p className="mb-10">Create and join book clubs.</p>
							</div>
							<Link
								href="/createbookclub"
								className="border rounded-lg h-12 p-3"
							>
								<strong>+</strong> Create Club
							</Link>
						</div>
						<div id="books-list">
							{
								/* Display all clubs if no specific one has been clicked on */
								clubId == null ? (
									/* Display if there are no clubs, else show the existing clubs */
									clubs != null ? (
										clubs.map((club) => (
											<div
												className="border rounded flex flex-row m-5 p-5 w-2/3"
												id={`${club.club_id}`}
												key={`${club.club_id}`}
											>
												<div className="flex justify-between	w-full ml-5">
													<button id={`${club.club_id}`} onClick={goToClub}>
														{club.name}
													</button>
													{currentClubs.includes(clubId) ? (
														<button id={`${club.club_id}`} onClick={joinClub}>
															Join
														</button>
													) : (
                                                        <p>Already Joined~</p>
                                                    )}
												</div>
											</div>
										))
									) : (
										<p>No clubs to display</p>
									)
								) : (
									/* Display all clubs if no club has been clicked on */
									<div>
										<h1 className="text-xl font-bold">{clubs["name"]} Club</h1>
										<h2 className="text-lg mb-10 border-b-2 w-2/3">
											Moderator: {clubs["username"]}
										</h2>
										{members.map((user, index) => (
											<div key={index}>
												<p className="ml-5">{user.username}</p>
											</div>
										))}
									</div>
								)
							}
						</div>
					</div>
				)}
			</div>
		</>
	);
}

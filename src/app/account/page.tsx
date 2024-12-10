"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AccountPage() {
	const [username, setUsername] = useState("");
	const [joindate, setJoindate] = useState("");
	const [following, setFollowing] = useState<any[]>([]);
	const [followers, setFollowers] = useState(0);
	const [searchName, setSearchName] = useState("");
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	const router = useRouter();

	useEffect(() => {
		setLoading(true);
		loadUserData();
		setLoading(false);
	}, []);

	// Loads all data to be displayed
	const loadUserData = async () => {
		try {
			const userresponse = await axios.get(
				`/api/auth/findacc?user_id=${localStorage.getItem("user_id")}`
			);
			setUsername(userresponse.data.user[0].username);
			setJoindate(userresponse.data.user[0].join_date);
			const followingresponse = await axios.get(
				`/api/userinteraction/getfollowing?user_id=${localStorage.getItem(
					"user_id"
				)}`
			);
			setFollowing(
				followingresponse.data.following.map((user) => user.username)
			);
			const followerresponse = await axios.get(
				`/api/userinteraction/getfollowers?user_id=${localStorage.getItem(
					"user_id"
				)}`
			);
			setFollowers(followerresponse.data.followers.length);
		} catch (error) {
			console.error("Error fetching test route data:", error);
		}
	};

	// Searches for user by taking search bar input and returning 10 names (ordered alphabetically) for user to follow/unfollow
	const searchUser = async (event) => {
		try {
			const response = await axios.get(
				`/api/userinteraction/findusersbyname?username=${searchName}`
			);
			setSearchResults(response.data.users);
		} catch (error) {
			console.error("Error fetching test route data:", error);
		}
	};

	// Makes current user follower another user
	const followUser = async (event) => {
		try {
			const response = await fetch("/api/userinteraction/createfollower", {
				method: "POST",
				body: JSON.stringify({
					user_id: event.target.id,
					follower_id: localStorage.getItem("user_id"),
				}),
				headers: { "Content-Type": "application/json" },
			});
			loadUserData();
		} catch (error) {
			console.error("Error fetching test route data:", error);
		}
	};

	// Makes current user unfollow another user
	const unfollowUser = async (event) => {
		try {
			const response = await fetch("/api/userinteraction/deletefollower", {
				method: "DELETE",
				body: JSON.stringify({
					user_id: event.target.id,
					follower_id: localStorage.getItem("user_id"),
				}),
				headers: { "Content-Type": "application/json" },
			});
			loadUserData();
		} catch (error) {
			console.error("Error fetching test route data:", error);
		}
	};
	// Deletes current user's account
	const deleteAccount = async (event) => {
		try {
			const response = await fetch("/api/auth/deleteacc", {
				method: "DELETE",
				body: JSON.stringify({
					user_id: localStorage.getItem("user_id"),
				}),
				headers: { "Content-Type": "application/json" },
			});
			// Logout
			localStorage.removeItem('isAuthenticated');
			localStorage.removeItem("user_id");
			// Redirect
			router.push('/');
		} catch (error) {
			console.error("Error fetching test route data:", error);
		}
	};

	return (
		<>
			<div className="container mx-48 my-10">
				{
					/* Create loading screen while data is being fetched */
					loading ? (
						<h1 className="text-4xl font-semibold mt-10">Loading...</h1>
					) : (
						<div>
							{/* Displays username, join date, and following stats */}
							<div
								id="user-profile-container"
								className="flex justify-between w-2/3"
							>
								<div id="user-following-info" className="w-full">
									<h1 className="text-4xl font-semibold mt-10">
										{username}'s Account
									</h1>
									<div
										id="user-profile-info"
										className="border rounded-md p-6 mt-10 w-52 h-2/3"
									>
										<p>Joined {joindate.split("T")[0]}</p>
										<p>Followers: {followers}</p>
										<p>Following: {following.length}</p>
										<br />
										<hr />
										<br />
										<button onClick={deleteAccount} className="border rounded-md p-2 transition ease-in hover:bg-red-300  bg-red-400 text-white">
											Delete My Account
										</button>
									</div>
								</div>

								{/* Allows user to search other users by username */}
								<div id="make-friends" className="w-full py-5 ml-10">
									<h2 className="text-2xl font-semibold my-10">Find Friends</h2>
									<div
										id="search-users-form"
										className="space-y-4 flex flex-col items-center"
									>
										<div className="w-full">
											<label htmlFor="name" className="block text-lg">
												Username
											</label>
											<input
												onChange={(e) => setSearchName(e.target.value)}
												className="w-full p-2 border border-gray-300 rounded-md"
												required
											/>
										</div>
										<button
											type="submit"
											onClick={searchUser}
											className="w-1/3 p-2 bg-blue-600 text-white rounded-md"
										>
											Search
										</button>
									</div>
									<div id="user-results">
										{searchResults != null ? (
											searchResults.map((user) => (
												<div key={user.user_id} className="p-3 mt-3">
													{user.user_id == localStorage.getItem("user_id") ? (
														<></>
													) : (
														<div className="flex justify-left space-x-4">
															{
																/* Allows user to follow/unfollow other users except themselves */
																following.includes(user.username) ? (
																	<button
																		id={user.user_id}
																		onClick={unfollowUser}
																		className="border rounded-md px-3 py-1"
																	>
																		-
																	</button>
																) : (
																	<button
																		id={user.user_id}
																		onClick={followUser}
																		className="border rounded-md px-3 py-1"
																	>
																		+
																	</button>
																)
															}
															<p className="mt-1">Name: {user.username}</p>
														</div>
													)}
												</div>
											))
										) : (
											<></>
										)}
									</div>
								</div>
							</div>
						</div>
					)
				}
			</div>
		</>
	);
}

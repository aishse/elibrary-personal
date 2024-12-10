"use client";
import axios from "axios";
import { useEffect, useState } from "react";

export default function HomePage() {
	const [username, setUsername] = useState();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getUsername();
	}, []);

	const getUsername = async () => {
		try {
			setLoading(true);
			if (localStorage.getItem("user_id") != null) {
				const response = await axios.get(
					`/api/auth/findacc?user_id=${localStorage.getItem("user_id")}`
				);
				setUsername(response.data.user[0].username);
			}
		} catch (error) {
			console.error("Error querying database:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {};
	return (
		<>
			<div className="container mx-auto text-center py-10">
				{loading ? (
					<h1 className="text-4xl font-semibold mt-10">Loading...</h1>
				) : (username != null ? (
					<div>
						<h1 className="text-3xl font-bold">
							Welcome to eLibrary, {username}!
						</h1>
						<p className="mt-4">
							Your one-stop destination for managing books, shelves, and more!
						</p>
					</div>
				) : (
					<div>
						<h1 className="text-3xl font-bold">Welcome to eLibrary!</h1>
						<p className="mt-4">Login to get started!</p>
					</div>
				))}
			</div>
		</>
	);
}

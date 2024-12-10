"use client";

import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function BookshelfPage() {
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();

	const searchParams = useSearchParams();
	const shelfId = searchParams.get("shelf_id");

	// Creates shelf with name specified by user
	const createShelf = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name) {
			setError("All fields are required!");
			return;
		}

		try {
			const response = await fetch("/api/bookshelf/createshelf", {
				method: "POST",
				body: JSON.stringify({
					user_id: localStorage.getItem("user_id"),
					bookshelf_name: name,
				}),
				headers: { "Content-Type": "application/json" },
			});
			const data = await response.json();

			if (data.error) {
				setError(data.error);
			} else {
				// Redirect to all bookshelves after successful account creation
				router.push("/bookshelf");
			}
		} catch (error) {
			setError("Bookshelf creation failed! Please try again.");
		}
	};

	return (
		<>
			<div className="container mx-48 my-10">
				<div className="flex justify-center w-2/3">
					<h1 className="text-4xl font-bold row">Create New Bookshelf</h1>
				</div>
				<div className="flex justify-center items-center mt-20 w-2/3">
					<div className="max-w-sm w-full p-6 bg-white shadow-md rounded-md">
						{error && <p className="text-red-500 text-center">{error}</p>}
						<form
							id="new-shelf-form"
							onSubmit={createShelf}
							className="space-y-4"
						>
							<div>
								<label htmlFor="name" className="block">
									Name
								</label>
								<input
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="w-full p-2 border border-gray-300 rounded-md"
									required
								/>
							</div>
							<button
								type="submit"
								className="w-full p-2 bg-blue-600 text-white rounded-md"
							>
								Create
							</button>
						</form>
					</div>
				</div>
			</div>
		</>
	);
}

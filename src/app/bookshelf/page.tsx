"use client";

import axios from "axios";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BookshelfPage() {
	const [shelves, setShelves] = useState<any[]>([]);
	const [shelfName, setShelfName] = useState("");
	const [books, setBooks] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	const searchParams = useSearchParams();
	const shelfId = searchParams.get("shelf_id");
	const router = useRouter();

	// Load shelves or books if shelfId is not null
	useEffect(() => {
		setLoading(true);
		fetchShelves();
		if (shelfId != null) {
			fetchBooks();
		}
		setLoading(false);
	}, [shelfId]);

	// Get all shelves, or singular shelf name if shelfId is not null
	const fetchShelves = async () => {
		try {
			const response = await axios.get(
				`/api/bookshelf/usershelves?user_id=${localStorage.getItem("user_id")}`
			);
			if (shelfId != null) {
				for (let i = 0; i < response.data.bookshelves.length; i++) {
					if (response.data.bookshelves[i].bookshelf_id == shelfId) {
						setShelves(response.data.bookshelves[i]);
						break;
					}
				}
			} else {
				setShelves(response.data.bookshelves);
			}
		} catch (error) {
			console.error("Error fetching test route data:", error);
		}
	};

	// Fetch all books in shelf specified by shelfId
	const fetchBooks = async () => {
		try {
			const response = await axios.get(
				`/api/bookshelf/shelfcontents?bookshelf_id=${shelfId}`
			);
			setBooks(response.data.books);
		} catch (error) {
			console.error("Error fetching test route data:", error);
		}
	};

	// Delete given shelf
	const deleteShelf = async (event) => {
		try {
			const response = await fetch("/api/bookshelf/removeshelf", {
				method: "DELETE",
				body: JSON.stringify({ bookshelf_id: event.target.id }),
				headers: { "Content-Type": "application/json" },
			});
			fetchShelves();
		} catch (error) {
			console.log("Error fetching data:", error);
		}
	};

	// Navigate to specific shelf using params
	const goToShelf = async (event) => {
		router.push(`/bookshelf?shelf_id=${event.target.id}`);
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
								<h1 className="text-4xl font-bold row">Bookshelf</h1>
								<p className="mb-10">
									Create, manage, or remove your personal bookshelf.
								</p>
							</div>
							<Link href="/createshelf" className="border rounded-lg h-12 p-3">
								<strong>+</strong> Create Shelf
							</Link>
						</div>
						<div id="books-list">
							{
								/* Display all shelves if no specific one has been clicked on */
								shelfId == null ? (
									/* Display if there are no shelves, else show the existing shelves */
									shelves != null ? (
										shelves.map((shelf) => (
											<div
												className="border rounded flex flex-row m-5 p-5 w-2/3"
												id={`${shelf.bookshelf_id}`}
												key={`${shelf.bookshelf_id}`}
											>
												<div className="flex justify-between	w-full ml-5">
													<button
														id={`${shelf.bookshelf_id}`}
														onClick={goToShelf}
													>
														{shelf.name}
													</button>
													<button
														id={`${shelf.bookshelf_id}`}
														onClick={deleteShelf}
													>
														🗑️
													</button>
												</div>
											</div>
										))
									) : (
										<p>No shelves to display</p>
									)
								) : (
									/* Display all books if a shelf has been clicked on */
									<div className="flex flex-col w-2/3">
										<h1 className="text-xl font-bold mb-5 border-b-2">Shelf {shelves["name"]}</h1>
										{books.map((book, key) => (
											<div key ={key}>
												<p className="ml-5">{book.title}</p>
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

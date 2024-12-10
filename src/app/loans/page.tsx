"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AccountPage() {
	const [username, setUsername] = useState("");
	const [borrowed, setBorrowed] = useState<any[]>([]);
	const [requested, setRequests] = useState<any[]>([]);
	const [borrowHistory, setBorrowHistory] = useState<any[]>([]);
	const [pagesRead, setPagesRead] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	const router = useRouter();

	useEffect(() => {
		setLoading(true);
		loadBooks();
		setLoading(false);
	}, []);

	// Loads all data to be displayed
	const loadBooks = async () => {
		try {
			const userresponse = await axios.get(
				`/api/auth/findacc?user_id=${localStorage.getItem("user_id")}`
			);
			setUsername(userresponse.data.user[0].username);
			const bresponse = await axios.get(
				`/api/books/getborrowed?user_id=${localStorage.getItem("user_id")}`
			);
			setBorrowed(bresponse.data.borrowed);
			const rresponse = await axios.get(
				`/api/books/getrequested?user_id=${localStorage.getItem("user_id")}`
			);
			setRequests(rresponse.data.borrowed);
			const bhresponse = await axios.get(
				`/api/books/getborrowhistory?user_id=${localStorage.getItem("user_id")}`
			);
			setBorrowHistory(bhresponse.data.borrowed);
			setRequests(rresponse.data.borrowed);
			const presponse = await axios.get(
				`/api/books/getpagesread?user_id=${localStorage.getItem("user_id")}`
			);
			setPagesRead(presponse.data.books);
		} catch (error) {
			console.error("Error fetching test route data:", error);
		}
	};

	const updatePagesRead = async (event) => {
		if (isNaN(event.target.value) || event.target.value < 0) {
			event.target.value = 0;
		} else {
			try {
				const newPage = event.target.value;
				const updatePagesRead = pagesRead.map((book) =>
				  book.isbn_13 === event.target.id
					? { ...book, current_page: parseInt(newPage, 10) }
					: book
				);
				setPagesRead(updatePagesRead);
				const response = await fetch("/api/books/read", {
					method: "PUT",
					body: JSON.stringify({
						user_id: localStorage.getItem("user_id"),
						isbn_13: event.target.id,
						current_page: newPage,
					}),
					headers: { "Content-Type": "application/json" },
				});
				const data = await response.json();
				console.log(data);
			} catch (error) {
				console.error("Error posting data:", error);
			}
		}
	};

	return (
		<>
			<div className="container pl-32 my-10 w-screen">
				{
					/* Create loading screen while data is being fetched */
					loading ? (
						<h1 className="text-4xl font-semibold mt-10">Loading...</h1>
					) : (
						<div id="content" className="flex flex-col">
							{/* Displays username, join date, and following stats */}
							<div className="w-full">
								<h1 className="text-4xl font-semibold mt-10">
									{username}'s Books
								</h1>
								<div
									id="user-books"
									className="mt-10 w-11/12 flex justify-between"
								>
									<div id="loans" className="border rounded p-5 m-3 w-1/2">
										<h1 className="text-2xl">Loans</h1>
										{borrowed.map((book) => (
											<div
												key={book.isbn_13}
												className="flex justify-between p-3"
											>
												<p className="w-2/3 mr-5">{book.title}</p>
												<p>Due {book.due_date.split("T")[0]}</p>
											</div>
										))}
									</div>
									<div id="requests" className="border rounded p-5 m-3 w-1/2">
										<h1 className="text-2xl">Requests</h1>
										{requested.map((book) => (
											<div
												key={book.isbn_13}
												className="flex justify-between p-3"
											>
												<p className="w-2/3 mr-5">{book.title}</p>
												<p>Placed {book.request_date.split("T")[0]}</p>
											</div>
										))}
									</div>
								</div>
							</div>
							{/* Displays transaction history and pages read */}
							<div id="user-stats" className="mt-10 w-11/12 flex justify-between">
								<div id="loans" className="border rounded p-5 m-3 w-1/2">
									<h1 className="text-2xl">Borrowing History</h1>
									{borrowHistory.map((book, index) => (
										<div key={index} className="flex justify-between p-3">
											<p className="w-2/3 mr-5">{book.title}</p>
											<p>Borrowed {book.date_borrowed.split("T")[0]}</p>
										</div>
									))}
								</div>
								<div id="requests" className="border rounded p-5 m-3 w-1/2">
									<h1 className="text-2xl">Pages Read</h1>
									{pagesRead.map((book, index) => (
										<div key={index} className="flex flex-row">
											<div className="flex justify-between p-3">
												<p className="w-2/3 mr-5">{book.title}</p>
											</div>
											<div className="flex flex-col w-80 mr-2">
												<p> Current Page: </p>
												<input
													id={book.isbn_13}
													value={book.current_page}
													type="number"
													min="0"
													onChange={updatePagesRead}
													className="h-6 w-16 my-3"
												/>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)
				}
			</div>
		</>
	);
}

"use client";
import { useState, useEffect } from "react";
import axios from "axios";

import { useSearchParams, redirect, useRouter } from "next/navigation";
import { Switch } from "@headlessui/react";
import ReviewPage from "../components/reviewpage";

export default function BooksPage() {
	const [loading, setLoading] = useState(true);
	const [found, setFound] = useState(true);

	const [books, setBooks] = useState<any[]>([]);
	const [filter, setFilter] = useState("all");
	const [query, setQuery] = useState("");
	const [submit, onSubmit] = useState(false);
	const [book, setBook] = useState<any[]>([]);
	const [shelves, setShelves] = useState<any[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [choosingShelf, setchoosingShelf] = useState("");
	const [selectedBook, setSelectBook] = useState("");

	const [addMessage, setMessage] = useState<string | null>(null);
	const [reviewCreated, setReviewCreate] = useState<string | null>(null);
	const [reviews, setReview] = useState<any[]>([]);
	const [reviewText, setReviewText] = useState("");
	const [rating, setRating] = useState("");

	const [availableCopies, setAvailableCopies] = useState(0);

	enum Book_Actions {
		Checkout,
		Request,
		Requested,
		Return,
	}
	const [bookAction, setBookAction] = useState(null);

	const searchParams = useSearchParams();
	const book_id = searchParams.get("book_id");
	const router = useRouter();

	useEffect(() => {
		fetchBooks();
		onSubmit(false);
	}, [submit, filter, query, book_id]);

	const fetchBooks = async () => {
		setLoading(true);
		try {
			if (book_id == null) {
				// making GET request to search for all books
				let response;
				if (filter === "title") {
					response = await axios.get(`/api/books/title?filter=${query}`);
				} else if (filter === "author") {
					response = await axios.get(`/api/books/author?filter=${query}`);
				} else {
					response = await axios.get("/api/books/getbooks");
				}
				setBooks(response.data.books);
				setFound(true);
			} else {
				// Get number of copies
				const copiesresponse = await axios.get(
					`/api/books/availablecopies?isbn_13=${book_id}`
				);
				const available = copiesresponse.data.book[0].copies;
				setAvailableCopies(available);
				// Get if user has book checked out already
				const userloansresponse = await axios.get(
					`/api/books/getborrowed?user_id=${localStorage.getItem("user_id")}`
				);
				const userHasBook = userloansresponse.data.borrowed
					.map((book) => book.isbn_13)
					.includes(book_id);
				// Get if user has requested book already
				const userrequestsresponse = await axios.get(
					`/api/books/getrequested?user_id=${localStorage.getItem("user_id")}`
				);
				const userRequestedBook = userrequestsresponse.data.borrowed
					.map((book) => book.isbn_13)
					.includes(book_id);
				// If user already has book, can return
				if (userHasBook) {
					setBookAction(Book_Actions.Return);
					console.log(bookAction);
				}
				// Else they can checkout a copy, or request if not available
				else if (available == 0) {
					if (userRequestedBook) {
						setBookAction(Book_Actions.Requested);
					} else {
						setBookAction(Book_Actions.Request);
					}
				} else {
					setBookAction(Book_Actions.Checkout);
				}
				fetchBookView();
				fetchReviews(book_id);
			}
		} catch (error) {
			console.log("Error fetching data:", error);
			setFound(false);
		} finally {
			setLoading(false);
		}
	};

	const handleClick = () => {
		onSubmit(true);
	};

	const showMessage = (message: string) => {
		setMessage(message);
		setTimeout(() => {
			setMessage(null); // Clear the message after 5 seconds
		}, 5000); // 5000 milliseconds = 5 seconds
	};

	const showReviewMsg = (message: string) => {
		setReviewCreate(message);
		setTimeout(() => {
			setReviewCreate(null); // Clear the message after 3 seconds
		}, 3000); // 3000 milliseconds = 3 seconds
	};

	const viewBook = async (isbn_13: string) => {
		router.push(`/books?book_id=${isbn_13}`);
	};

	const fetchBookView = async () => {
		try {
			const response = await axios.get(
				`/api/books/getbooksisbn?isbn=${book_id}`
			);
			setBook(response.data.book);
		} catch (error) {
			console.error(error);
		}
	};

	const getShelves = async () => {
		try {
			const response = await axios.get(
				`/api/bookshelf/usershelves?user_id=${localStorage.getItem("user_id")}`
			);

			setShelves(response.data.bookshelves);
		} catch (error) {
			console.error(error);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value);
	};
	const handleSelectChange = async (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		setFilter(e.target.value);
	};

	const handleShelfToggle = (isbn_13: string) => {
		if (choosingShelf === isbn_13) {
			setchoosingShelf("");
		} else {
			setchoosingShelf(isbn_13);
			getShelves();
		}
	};

	const addToShelf = async (isbn_13: string, bookshelf_id: number) => {
		try {
			const response = await fetch("/api/bookshelf/addbook", {
				method: "POST",
				body: JSON.stringify({ bookshelf_id, isbn_13 }),
				headers: { "Content-Type": "application/json" },
			});

			const errorData = await response.json();
			if (!response.ok) {
				showMessage("Book already added to this shelf.");
			} else {
				showMessage("Book added to shelf!");
			}
		} catch (error) {
			showMessage("An error occured.");
			console.error(error);
		}
	};

	const createReview = async (isbn_13: string) => {
		console.log(reviewText);
		console.log(rating);
		const user_id = localStorage.getItem("user_id");

		try {
			const response = await fetch("/api/review/createreview", {
				method: "POST",
				body: JSON.stringify({ user_id, isbn_13, rating, text: reviewText }),
				headers: { "Content-Type": "application/json" },
			});
			setRating("");
			setReviewText("");
			showReviewMsg("Review created successfully!");
		} catch (error) {
			console.error(error);
			showReviewMsg("Error with your review");
		}

		fetchReviews(isbn_13);
	};

	const fetchReviews = async (isbn_13: string) => {
		setLoading(true);
		try {
			// making GET request from the relevant api route
			const response = await axios.get(
				`/api/review/getreview?isbn_13=${isbn_13}`
			);
			setReview(response.data.reviews);
		} catch (error) {
			console.log("Error fetching data:", error);
		}
	};

	// Checks out book to logged in user
	const checkoutBook = async (isbn_13: string) => {
		try {
			const response = await fetch("/api/books/borrow", {
				method: "POST",
				body: JSON.stringify({
					user_id: localStorage.getItem("user_id"),
					isbn_13,
				}),
				headers: { "Content-Type": "application/json" },
			});
			fetchBooks();
		} catch (error) {
			console.log("Error fetching data:", error);
		}
	};
	// Requests book for user
	const requestBook = async (isbn_13: string) => {
		try {
			const response = await fetch("/api/books/request", {
				method: "POST",
				body: JSON.stringify({
					user_id: localStorage.getItem("user_id"),
					isbn_13,
				}),
				headers: { "Content-Type": "application/json" },
			});
			fetchBooks();
		} catch (error) {
			console.log("Error fetching data:", error);
		}
	};
	// Checks out book to logged in user
	const returnBook = async (isbn_13: string) => {
		try {
			const response = await fetch("/api/books/return", {
				method: "DELETE",
				body: JSON.stringify({
					user_id: localStorage.getItem("user_id"),
					isbn_13,
				}),
				headers: { "Content-Type": "application/json" },
			});
			fetchBooks();
		} catch (error) {
			console.log("Error fetching data:", error);
		}
	};

	return (
		<div className="m-12">
			{
				/* Display all books unless book_id is null, in which case display info for specific book */
				book_id == null ? (
					<div className="flex flex-col items-center justify-center text-center mx-10 pt-5">
						<div className="mb-5">
							<h1 className="text-2xl font-bold">Browse Books</h1>
							<h1 className="text-md">
								Borrow, read, or search for books by name or author!
							</h1>
						</div>
						{/* Search bar to find specific book */}
						<div
							id="search-bar"
							className="flex flex-row items-center space-x-4 pb-10"
						>
							<select
								onChange={handleSelectChange}
								id="search-by"
								className="border rounded text-lg p-2"
							>
								<option value="select">All</option>
								<option value="title">Title</option>
								<option value="author">Author</option>
							</select>
							<input
								className="border rounded p-2 w-96"
								type="text"
								onChange={handleInputChange}
								placeholder="Search here..."
							/>
							<button
								id="search-book-button"
								onClick={handleClick}
								className="text-4xl"
							>
								🔎
							</button>
						</div>

						{/*  <p>{JSON.stringify(books)}</p> */}
						{loading ? (
							<h1 className="text-4xl font-semibold mt-10">Loading...</h1>
						) : (
							found && (
								<div className="grid grid-cols-3">
									{books.map((book) => (
										<div
											key={book.isbn_13}
											className="border text-center rounded flex m-5 p-5"
											id={`${book}`}
										>
											<div className="text-center items-center justify-center">
												<div id={`book-cover-${book}`} className="w-20%">
													<div className="bg-black flex">
														<img
															src={book.cover}
															alt={`cover for ${book.title}`}
														/>
													</div>
												</div>
												<div className="">
													<h4>{book.title}</h4>
													<h4>{book.author}</h4>
												</div>
												<div className="flex flex-rows gap-3 justify-center">
													<button
														onClick={() => viewBook(book.isbn_13)}
														className="mt-4 bg-slate-500 transition ease-in hover:bg-slate-400 w-[30%] border rounded-lg p-2 text-white"
													>
														View book
													</button>
													<div className="relative mt-4 bg-slate-500 transition ease-in hover:bg-slate-400 w-[30%] border rounded-lg p-2">
														<button
															onClick={() => handleShelfToggle(book.isbn_13)}
															className="text-white"
														>
															Add book to shelf
														</button>

														{choosingShelf === book.isbn_13 && (
															<div className="absolute mt-2 bg-white border rounded-lg shadow-lg w-full z-10">
																<ul className="flex flex-col p-2">
																	{shelves.map((shelf) => (
																		<li key={shelf.name} className="py-1">
																			<button
																				className="w-full text-left px-2 py-1 hover:bg-gray-100"
																				onClick={() => {
																					addToShelf(
																						book.isbn_13,
																						shelf.bookshelf_id
																					);
																					setSelectBook(book.isbn_13);
																					handleShelfToggle(book.isbn_13);
																				}}
																			>
																				{shelf.name}
																			</button>
																		</li>
																	))}
																</ul>
															</div>
														)}
													</div>
												</div>
												<p>{selectedBook === book.isbn_13 && addMessage}</p>
											</div>
										</div>
									))}
								</div>
							)
						)}
					</div>
				) : (
					book.map((book) => (
						<div
							key={book.isbn_13}
							className="flex flex-col justify-center items-center gap-4 p-5"
						>
							<div className="flex justify-center w-full bg-slate-300 p-3 rounded-xl">
								<img
									src={book.cover}
									alt={`cover for `}
									className="w-[15%] h-auto rounded-xl" // Adjust image sizing
								/>
							</div>
							<div className="flex flex-col gap-3 justify-center items-center text-center w-full">
								<h1 className="text-3xl text-blue-950 justify-self-center">
									{book.title}
								</h1>
								<div className="flex flex-col gap-3 justify-left items-start text-left outline-dashed w-full rounded-xl p-5">
									<h2 className="">
										Author: {`${book.f_name} ${book.l_name}`}
									</h2>
									<h2>Language: {book.language}</h2>
									<h2>Edition: {book.edition}</h2>
									<h2>
										Publish date (edition):{" "}
										{new Date(book.publish_date).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}{" "}
									</h2>
									<div className="flex justify-center gap-4 items-center text-center">
										<Switch
											checked={isOpen}
											onChange={setIsOpen}
											className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-blue-600"
										>
											<span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
										</Switch>
										<h1>Show book synopsis (Contains Spoilers!) </h1>
									</div>
								</div>
								<div id="book-actions" className="flex justify-between w-full mt-10">
									<div
										id="review-info"
										className="flex flex-col justify-start items-start w-screen"
									>
										<h1 className="justify-self-start">Rating (1-5)</h1>

										<input
											type="number"
											id="review-text"
											value={rating}
											onChange={(e) => setRating(e.target.value)}
											className="w-[5%] text-start pt-1 p-2 border border-gray-300 rounded-md leading-tight resize-none"
											required
											min="1"
											max="5"
											step="1"
										/>

										<div className="relative w-[50%] flex-cols">
											<h1 className="justify-self-start">Write a review:</h1>

											<textarea
												id="review"
												value={reviewText}
												onChange={(e) => setReviewText(e.target.value)}
												className="w-full text-start pt-1 p-2 border border-gray-300 rounded-md leading-tight resize-none min-h-[100px]"
												required
											/>
										</div>

										<button
											onClick={() => createReview(book.isbn_13)}
											className="mt-4 bg-slate-500 transition ease-in hover:bg-slate-400  border rounded-lg p-2 text-white"
										>
											Review book
										</button>
										<p>{reviewCreated}</p>

										{isOpen && <p>{book.synopsis}</p>}
										<ReviewPage reviewData={reviews} />
									</div>
									<div id="book-checkout-return" className="w-96 border rounded h-44">
										<p className="py-7">Available Copies: {availableCopies}</p>
										{bookAction == Book_Actions.Checkout && (
											<button onClick={() => checkoutBook(book.isbn_13)} className="border rounded p-3 transition ease-in hover:bg-green-300  bg-green-400 text-white">
												Checkout Book
											</button>
										)}
										{bookAction == Book_Actions.Request && (
											<div>
												<button onClick={() => requestBook(book.isbn_13)} className="border rounded p-3 transition ease-in hover:bg-blue-300  bg-blue-400 text-white">
													Request Book
												</button>
											</div>
										)}
										{bookAction == Book_Actions.Requested && (
											<div>
												<button className="border rounded p-3 bg-gray-400 text-white">
													Requested
												</button>
											</div>
										)}
										{bookAction == Book_Actions.Return && (
											<button onClick={() => returnBook(book.isbn_13)} className="border rounded p-3 transition ease-in hover:bg-red-300  bg-red-400 text-white">
												Return Book
											</button>
										)}
									</div>
								</div>
							</div>
						</div>
					))
				)
			}
		</div>
	);
}

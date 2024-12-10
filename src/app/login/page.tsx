// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function LoginPage() {
	const { login } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log(password);
		if (!email || !password) {
			setError("Both fields are required!");
			return;
		}

		try {
			// Assuming login is successful

			// making GET request from the relevant api route
			const response = await axios.get(`/api/auth/validlogin?email=${email}`);
			if (response.data.password[0].password !== password) {
				throw new Error();
			} else {
				console.log("correct password");
			}
			login(); // Set the user as logged in and persist the state

			// query user information since password worked

			const id = response.data.password[0].user_id;
			// const userprofile = await axios.get(`/api/auth/findacc?user_id=${id}`);

			localStorage.setItem(
				"user_id",
				JSON.stringify(id)
			);

			router.push("/"); // Redirect to home page
		} catch (error) {
			setError("Login failed! Please try again.");
		}
	};

	return (
		<div className="flex justify-center items-center h-screen">
			<div className="max-w-sm w-full p-6 bg-white shadow-md rounded-md">
				<h2 className="text-2xl font-bold text-center mb-4">Login</h2>
				{error && <p className="text-red-500 text-center">{error}</p>}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="email" className="block">
							Email
						</label>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full p-2 border border-gray-300 rounded-md"
							required
						/>
					</div>
					<div>
						<label htmlFor="password" className="block">
							Password
						</label>
						<input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full p-2 border border-gray-300 rounded-md"
							required
						/>
					</div>
					<button
						type="submit"
						className="w-full p-2 bg-blue-600 text-white rounded-md"
					>
						Login
					</button>
				</form>
				<div className="text-center mt-4">
					<p>
						Don't have an account?{" "}
						<a href="/create-account" className="text-blue-600">
							Create one
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}

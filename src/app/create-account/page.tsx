'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateAccountPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setError('All fields are required!');
      return;
    }
   
    try {
      const response = await fetch('/api/auth/createuser', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        // Redirect to login after successful account creation
        router.push('/login');
      }
    } catch (error) {
      setError('Account creation failed! Please try again.');
    }
  };
  
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="max-w-sm w-full p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-bold text-center mb-4">Create Account</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block">Email</label>
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
            <label htmlFor="password" className="block">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <button type="submit" className="w-full p-2 bg-green-600 text-white rounded-md">Create Account</button>
        </form>
        <div className="text-center mt-4">
          <p>Already have an account? <a href="/login" className="text-blue-600">Login</a></p>
        </div>
      </div>
    </div>
  );
}

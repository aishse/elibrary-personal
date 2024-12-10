'use client'

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleCreateAccount = () => {
    router.push('/create-account');
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="max-w-sm w-full p-6 bg-white shadow-md rounded-md text-center">
        <h2 className="text-2xl font-bold mb-6">Welcome to the App!</h2>
        <p className="mb-4">Please log in or create a new account to continue.</p>
        <div className="space-y-4">
          <button
            onClick={handleLogin}
            className="w-full p-2 bg-blue-600 text-white rounded-md"
          >
            Log In
          </button>
          <button
            onClick={handleCreateAccount}
            className="w-full p-2 bg-green-600 text-white rounded-md"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}

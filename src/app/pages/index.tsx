// src/app/page.tsx or src/pages/index.tsx
'use client'

import { useRouter } from 'next/navigation';

const HomePage = () => {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleCreateAccountClick = () => {
    router.push('/create-account');
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-center mb-6">Welcome to eLibrary</h1>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleLoginClick}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Login
          </button>
          <button
            onClick={handleCreateAccountClick}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

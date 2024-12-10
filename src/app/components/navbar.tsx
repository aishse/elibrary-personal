'use client';

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login'); // Redirect to login page after logout
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between">
        <h1 className="text-lg font-bold"><Link href="/">eLibrary</Link></h1>
        <ul className="flex space-x-10">
          {isAuthenticated ? (
            <>
              <li>
                <Link href="/account">Account</Link>
              </li>
              <li>
                <Link href="/loans">My Books</Link>
              </li>
              <li>
                <Link href="/books">Browse</Link>
              </li>
              <li>
                <Link href="/bookshelf">Bookshelf</Link>
              </li>
              <li>
                <Link href="/bookclub">Book Clubs</Link>
              </li>
              <li>
                <Link href="/activity">Activity</Link>
              </li>
              <li>
                <button onClick={handleLogout} className="text-red-500 hover:underline">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/login">Login</Link>
              </li>
              <li>
                <Link href="/create-account">Create Account</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

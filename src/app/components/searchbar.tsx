'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Searchbar = () => {
  const router = useRouter();

  const handleSearch = () => {
    // search();
    // TODO: implement search function?
  };

  return (
    <div id="search-bar" className="flex flex-row ml-32 h-1/2 mt-2">
      <select id="search-by" className="border rounded text-lg mr-10 p-2">
        <option value="title">Title</option>
        <option value="author">Author</option>
        <option value="keyword">Keyword</option>
      </select>
      <input className="border rounded p-2 w-96" type="text" placeholder="Search here..." />
      <button id="search-book-button" className="ml-6 text-4xl">🔎</button>
    </div>
  );
};

export default Searchbar;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SearchInput: React.FC = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query.trim())}`);
      setQuery(''); // Clear input after search
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-sm">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search players, teams, news..."
        className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
        aria-label="Search sports data"
      />
      <button
        type="submit"
        className="absolute right-0 top-0 mt-2 mr-3 text-gray-400 hover:text-emerald-400 transition-colors duration-200"
        aria-label="Submit search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
};

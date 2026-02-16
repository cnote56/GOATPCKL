
import React from 'react';
import { Link } from 'react-router-dom';
import { EXAMPLE_SPORTS } from '../constants'; // Keeping EXAMPLE_SPORTS for potential dynamic usage, but will hardcode for specific template appearance
import { SearchInput } from './SearchInput';
import { useUser } from '../context/UserContext'; // Import useUser

interface HeaderProps {
  toggleChatBot: () => void;
}

// Full list of sports displayed in the template for navigation
const TEMPLATE_SPORTS = [
  { name: 'Football', icon: '⚽' },
  { name: 'Tennis', icon: '🎾' },
  { name: 'Basketball', icon: '🏀' },
  { name: 'Hockey', icon: '🏒' },
  { name: 'Rugby', icon: '🏉' }, // Added Rugby
  { name: 'Footy', icon: '🏈' }, // Added Australian Rules Football (Footy)
  { name: 'Golf', icon: '⛳' },
  { name: 'Baseball', icon: '⚾' },
  { name: 'Snooker', icon: '🎱' },
  { name: 'Volleyball', icon: '🏐' },
];

export const Header: React.FC<HeaderProps> = ({ toggleChatBot }) => {
  const { currentUser, switchUser, availableUsers } = useUser();

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchUser(e.target.value);
  };

  return (
    <header className="bg-gray-900 text-gray-100 shadow-lg py-3 px-4 sm:px-6 lg:px-8">
      {/* Top Row: Logo, Search, User Actions */}
      <div className="container mx-auto flex justify-between items-center mb-4 sm:mb-0">
        {/* Logo */}
        <Link to="/" className="flex items-center text-3xl font-bold text-gray-100 hover:text-emerald-400 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 mr-2 text-red-500 transform rotate-45"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M13.75 3.106c-.463-.263-1.037-.263-1.5 0L6.812 6.331a.999.999 0 00-.513.882l.447 4.757a1 1 0 001.018.88l3.414-.427a.999.999 0 00.988-.722l.534-3.56a1 1 0 011.976.296l-.99 6.6c-.147.98.665 1.83 1.646 1.684l3.52-.527a.999.999 0 00.932-.705l1.012-6.75A1 1 0 0022 9.073V7.27c0-.465-.262-.916-.725-1.179l-4.75-2.706zM9.5 13.5a.5.5 0 11-1 0 .5.5 0 011 0zM14.5 13.5a.5.5 0 11-1 0 .5.5 0 011 0z" />
          </svg>
          URScoreCard
        </Link>

        {/* Search Input - Centralized for desktop, might be hidden or icon-triggered for mobile */}
        <div className="hidden sm:flex items-center flex-grow justify-center px-4">
          <SearchInput />
        </div>

        {/* Right-side Icons (Search, Login, Menu, Chatbot, User Switcher) */}
        <div className="flex items-center space-x-4">
          {/* Mobile Search Icon (visible on small screens) */}
          <Link to="/search" className="sm:hidden p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-400" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          {/* User Switcher Dropdown */}
          <div className="relative">
            <select
              value={currentUser.id}
              onChange={handleUserChange}
              className="bg-gray-700 text-gray-100 border border-gray-600 rounded-full py-1 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 pr-8"
              aria-label="Switch User"
            >
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          {/* Login Placeholder (can be removed or integrated with actual user if developed) */}
          <button className="p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-400" aria-label="Login">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </button>
          {/* Menu / Hamburger Icon */}
          <button className="p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-400" aria-label="Open Menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Chatbot Toggle */}
          <button
            onClick={toggleChatBot}
            aria-label="Open Chatbot"
            className="p-2 rounded-full hover:bg-gray-700 transition-colors text-emerald-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Row: Sports Navigation and Favorites */}
      <nav className="container mx-auto flex overflow-x-auto whitespace-nowrap py-2 border-t border-gray-700 scrollbar-hide text-lg sm:text-base">
        <Link to="/watchlist" className="flex items-center flex-shrink-0 px-4 py-2 rounded-full bg-gray-700 text-yellow-400 hover:bg-gray-600 transition-colors mr-4 font-semibold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.817 2.033a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.817-2.033a1 1 0 00-1.175 0l-2.817 2.033c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          My Watchlist <span className="ml-1 text-xs px-2 py-0.5 bg-gray-800 rounded-full text-white">0</span> {/* Placeholder count */}
        </Link>
        <Link to="/scoreboard" className="flex items-center flex-shrink-0 px-4 py-2 rounded-full bg-gray-700 text-yellow-400 hover:bg-gray-600 transition-colors mr-4 font-semibold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0h.01M9 19H7a2 2 0 01-2-2v-6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2zm0 0v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm9 0v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0h.01M18 19H16a2 2 0 01-2-2v-6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2zm0 0v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
          </svg>
          My Scoreboard
        </Link>

        {/* Main sports categories */}
        {TEMPLATE_SPORTS.map(sport => (
          <Link
            key={sport.name}
            to={`/?sport=${encodeURIComponent(sport.name)}`} // Link to homepage with sport filter
            className="flex-shrink-0 px-4 py-2 rounded-full hover:bg-gray-700 transition-colors font-semibold text-gray-300 mr-2"
          >
            <span className="mr-2">{sport.icon}</span>{sport.name}
          </Link>
        ))}

        <button className="flex-shrink-0 px-4 py-2 rounded-full hover:bg-gray-700 transition-colors font-semibold text-gray-300">
          More <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </nav>
    </header>
  );
};
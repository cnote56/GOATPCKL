
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EXAMPLE_SPORTS } from '../constants';
import { SearchInput } from './SearchInput';
import { useUser } from '../context/UserContext';
import { getFavoriteTeams } from '../utils/favorites'; // Import to get favorite team count

interface HeaderProps {
  toggleChatBot: () => void;
  toggleSidebar: () => void; // New prop for sidebar
  toggleTheme: () => void; // New prop for theme toggle
  currentTheme: 'dark' | 'light'; // New prop for current theme
}

const TEMPLATE_SPORTS = [
  { name: 'Soccer', icon: '⚽' },
  { name: 'Tennis', icon: '🎾' },
  { name: 'Basketball', icon: '🏀' },
  { name: 'Hockey', icon: '🏒' },
  { name: 'Baseball', icon: '⚾' },
  { name: 'Rugby', icon: '🏉' },
  { name: 'Footy', icon: '🏈' },
  { name: 'Golf', icon: '⛳' },
  { name: 'Snooker', icon: '🎱' },
  { name: 'Volleyball', icon: '🏐' }
];

export const Header: React.FC<HeaderProps> = ({ toggleChatBot, toggleSidebar, toggleTheme, currentTheme }) => {
  const { currentUser, switchUser, availableUsers } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const favoriteTeamCount = getFavoriteTeams(currentUser.id).length;

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchUser(e.target.value);
  };

  const handleSportNavClick = (sportName: string) => {
    setSearchParams({ sport: sportName });
  };

  return (
    <header className="bg-tertiary text-primary shadow-lg sticky top-0 z-40">
      {/* Top Row: Logo, Search, User Actions */}
      <div className="container mx-auto flex justify-between items-center py-2 px-4 md:px-6">
        {/* Hamburger Menu (Mobile) */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-full hover-bg-secondary text-secondary transition-colors mr-2"
          aria-label="Toggle Sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center text-xl font-bold text-primary hover:text-accent transition-colors flex-shrink-0">
          <span className="text-accent text-3xl font-extrabold mr-1">UR</span>ScoreCard
        </Link>

        {/* Search Input (Desktop) */}
        <div className="hidden sm:flex items-center flex-grow justify-center px-4">
          <SearchInput />
        </div>

        {/* Right-side Icons */}
        <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
          {/* Mobile Search Icon */}
          <Link to="/search" className="sm:hidden p-2 rounded-full hover-bg-secondary text-secondary" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          {/* Users Link */}
          <Link to="/users" className="p-2 rounded-full hover-bg-secondary text-secondary" aria-label="Users">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354c.24-.263.63-.448 1.1-.448 1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2zM12 6a4 4 0 100 8c2.209 0 4-1.791 4-4s-1.791-4-4-4zM16 17v-.001a1.5 1.5 0 00-1.5-1.5h-1a.5.5 0 00-.5.5v2.5a.5.5 0 00.5.5h1a1.5 1.5 0 001.5-1.5zM8 17v-.001a1.5 1.5 0 01-1.5-1.5H6a.5.5 0 01-.5.5v2.5a.5.5 0 01.5.5h1a1.5 1.5 0 001.5-1.5zM12 14a6.5 6.5 0 00-6.5 6.5v1.5a.5.5 0 00.5.5h12a.5.5 0 00.5-.5v-1.5A6.5 6.5 0 0012 14z"/>
            </svg>
          </Link>

          {/* Chats Link */}
          <Link to="/chats" className="p-2 rounded-full hover-bg-secondary text-secondary" aria-label="Chats">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </Link>

          {/* User Switcher */}
          <div className="relative hidden md:block">
            <select
              value={currentUser.id}
              onChange={handleUserChange}
              className="bg-secondary text-primary border border-border rounded-full py-1 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent pr-8 transition-colors duration-200"
              aria-label="Switch User"
            >
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-secondary">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-full hover-bg-secondary text-secondary transition-colors"
          >
            {currentTheme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707.707M6.343 6.343l-.707-.707m12.728 0l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Chatbot Toggle */}
          <button
            onClick={toggleChatBot}
            aria-label="Open Chatbot"
            className="p-2 rounded-full hover-bg-secondary text-accent transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Row: Sports Navigation and Favorites */}
      <nav className="container mx-auto flex overflow-x-auto whitespace-nowrap py-2 border-t border-border scrollbar-hide text-sm sm:text-base">
        <Link to="/watchlist" className="flex items-center flex-shrink-0 px-3 py-1.5 rounded-full bg-secondary text-favorite hover-bg-secondary transition-colors mr-3 font-semibold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.817 2.033a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.817-2.033a1 1 0 00-1.175 0l-2.817 2.033c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Favorites <span className="ml-1 text-xs px-1.5 py-0.5 bg-tertiary rounded-full text-primary">{favoriteTeamCount}</span>
        </Link>
        <Link to="/scoreboard" className="flex items-center flex-shrink-0 px-3 py-1.5 rounded-full bg-secondary text-followed hover-bg-secondary transition-colors mr-3 font-semibold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0h.01M9 19H7a2 2 0 01-2-2v-6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2zm0 0v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm9 0v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0h.01M18 19H16a2 2 0 01-2-2v-6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2zm0 0v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
          </svg>
          My Scoreboard
        </Link>

        {TEMPLATE_SPORTS.map(sport => (
          <button
            key={sport.name}
            onClick={() => handleSportNavClick(sport.name)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full hover-bg-secondary transition-colors font-semibold mr-3
              ${searchParams.get('sport') === sport.name ? 'bg-secondary text-accent' : 'text-secondary'}`}
          >
            <span className="mr-1">{sport.icon}</span>{sport.name}
          </button>
        ))}
      </nav>
    </header>
  );
};
    
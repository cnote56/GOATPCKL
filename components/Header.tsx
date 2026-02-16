
import React from 'react';
import { Link } from 'react-router-dom';
import { EXAMPLE_SPORTS, EXAMPLE_FOOTBALL_TEAMS, EXAMPLE_FOOTBALL_PLAYERS, EXAMPLE_LEAGUES } from '../constants';
import { SearchInput } from './SearchInput'; // Import the new SearchInput component

interface HeaderProps {
  toggleChatBot: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleChatBot }) => {
  // Use first examples for quick navigation links
  const sampleSport = EXAMPLE_SPORTS[0];
  const samplePlayer = EXAMPLE_FOOTBALL_PLAYERS[0];
  const sampleTeam = EXAMPLE_FOOTBALL_TEAMS[0];
  const sampleLeague = EXAMPLE_LEAGUES[0];

  return (
    <header className="bg-gray-800 text-gray-100 shadow-md py-4 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <Link to="/" className="text-3xl font-bold text-emerald-400 hover:text-emerald-300 transition-colors mb-4 sm:mb-0">
          URScoreCard
        </Link>
        <div className="flex items-center space-x-4 flex-grow justify-end sm:justify-center order-first sm:order-none w-full sm:w-auto mb-4 sm:mb-0">
          <SearchInput />
        </div>
        <nav className="flex flex-wrap gap-4 sm:gap-6 text-lg">
          <Link to="/" className="hover:text-emerald-400 transition-colors">
            Home
          </Link>
          <Link to={`/player/${samplePlayer}`} className="hover:text-emerald-400 transition-colors">
            Players
          </Link>
          <Link to={`/team/${sampleTeam}`} className="hover:text-emerald-400 transition-colors">
            Teams
          </Link>
          <Link to={`/league/${sampleLeague}`} className="hover:text-emerald-400 transition-colors">
            Leagues
          </Link>
          <Link to="/watchlist" className="hover:text-emerald-400 transition-colors">
            Watchlist
          </Link>
          <button
            onClick={toggleChatBot}
            aria-label="Open Chatbot"
            className="p-2 rounded-full hover:bg-gray-700 transition-colors text-emerald-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
};
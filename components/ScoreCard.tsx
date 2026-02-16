
import React, { useState, useEffect } from 'react';
import { Score } from '../types';
import { Link } from 'react-router-dom';
import { EXAMPLE_FOOTBALL_TEAMS, EXAMPLE_BASKETBALL_TEAMS } from '../constants';
import { useUser } from '../context/UserContext';
import { addFavoriteTeam, removeFavoriteTeam, isFavoriteTeam } from '../utils/favorites';


interface ScoreCardProps {
  score?: Score; // Make score optional for loading state
  loading?: boolean; // New prop for loading state
}

const getTeamPageLink = (teamName: string, sport: string) => {
  // Simple heuristic for linking to team pages based on example data
  if (sport === 'Football' && EXAMPLE_FOOTBALL_TEAMS.includes(teamName)) {
    return `/team/${encodeURIComponent(teamName)}`;
  }
  if (sport === 'Basketball' && EXAMPLE_BASKETBALL_TEAMS.includes(teamName)) {
    return `/team/${encodeURIComponent(teamName)}`;
  }
  return '#'; // Fallback if no specific team page can be generated
};

export const ScoreCard: React.FC<ScoreCardProps> = ({ score, loading }) => {
  const { currentUser } = useUser();
  const [isHomeTeamFavorited, setIsHomeTeamFavorited] = useState(false);
  const [isAwayTeamFavorited, setIsAwayTeamFavorited] = useState(false);

  useEffect(() => {
    if (score?.homeTeam) {
      setIsHomeTeamFavorited(isFavoriteTeam(currentUser.id, score.homeTeam));
    }
    if (score?.awayTeam) {
      setIsAwayTeamFavorited(isFavoriteTeam(currentUser.id, score.awayTeam));
    }
  }, [score, currentUser.id]);

  const handleToggleHomeTeamFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking the star
    if (!score?.homeTeam) return;

    if (isHomeTeamFavorited) {
      removeFavoriteTeam(currentUser.id, score.homeTeam);
    } else {
      addFavoriteTeam(currentUser.id, score.homeTeam);
    }
    setIsHomeTeamFavorited(prev => !prev);
  };

  const handleToggleAwayTeamFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking the star
    if (!score?.awayTeam) return;

    if (isAwayTeamFavorited) {
      removeFavoriteTeam(currentUser.id, score.awayTeam);
    } else {
      addFavoriteTeam(currentUser.id, score.awayTeam);
    }
    setIsAwayTeamFavorited(prev => !prev);
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-4 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-start text-xs text-gray-400 mb-2">
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/6"></div>
        </div>

        {/* Home Team Skeleton */}
        <div className="flex items-center justify-between text-lg md:text-xl font-bold mb-3">
          <div className="flex items-center flex-grow min-w-0 pr-2">
            <div className="w-8 h-8 rounded-full bg-gray-700 mr-3 flex-shrink-0"></div>
            <div className="h-6 bg-gray-700 rounded w-3/5"></div>
          </div>
          <div className="h-8 bg-gray-700 rounded w-1/12 mx-2"></div>
        </div>

        {/* Away Team Skeleton */}
        <div className="flex items-center justify-between text-lg md:text-xl font-bold mb-3">
          <div className="flex items-center flex-grow min-w-0 pr-2">
            <div className="w-8 h-8 rounded-full bg-gray-700 mr-3 flex-shrink-0"></div>
            <div className="h-6 bg-gray-700 rounded w-3/5"></div>
          </div>
          <div className="h-8 bg-gray-700 rounded w-1/12 mx-2"></div>
        </div>

        {/* Footer Skeleton */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-700 text-sm font-medium">
          <div className="h-6 bg-gray-700 rounded-full w-1/5"></div>
          <div className="h-6 bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  // If not loading and score is undefined, return null or a placeholder if desired
  if (!score) {
    return null; // Or <ErrorDisplay message="Score data not available" />
  }

  const isLive = score.gameState === 'Live';
  const isFinished = score.gameState === 'Fulltime';
  const isUpcoming = score.gameState === 'Upcoming';

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-4 transform hover:scale-102 transition-all duration-300 ease-in-out cursor-pointer">
      <div className="flex justify-between items-start text-xs text-gray-400 mb-2">
        <span className="font-semibold text-emerald-400 uppercase">{score.sport}</span>
        <span className="font-medium">{score.league}</span>
      </div>

      <div className="flex items-center justify-between text-lg md:text-xl font-bold mb-3">
        {/* Home Team */}
        <Link to={getTeamPageLink(score.homeTeam, score.sport)} className="flex items-center flex-grow min-w-0 pr-2 group">
          <img
            src={`https://picsum.photos/seed/${encodeURIComponent(score.homeTeam)}/30/30`}
            alt={`${score.homeTeam} logo`}
            className="w-8 h-8 rounded-full mr-3 border border-gray-600 bg-gray-900 flex-shrink-0"
          />
          <span className="truncate text-gray-100 group-hover:underline" title={score.homeTeam}>{score.homeTeam}</span>
        </Link>
        <button
          onClick={handleToggleHomeTeamFavorite}
          aria-label={isHomeTeamFavorited ? "Remove home team from favorites" : "Add home team to favorites"}
          className="p-1 rounded-full hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${isHomeTeamFavorited ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.817 2.033a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.817-2.033a1 1 0 00-1.175 0l-2.817 2.033c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
        <span className="ml-2 text-3xl font-extrabold text-emerald-200">{score.homeScore}</span>
      </div>

      <div className="flex items-center justify-between text-lg md:text-xl font-bold mb-3">
        {/* Away Team */}
        <Link to={getTeamPageLink(score.awayTeam, score.sport)} className="flex items-center flex-grow min-w-0 pr-2 group">
          <img
            src={`https://picsum.photos/seed/${encodeURIComponent(score.awayTeam)}/30/30`}
            alt={`${score.awayTeam} logo`}
            className="w-8 h-8 rounded-full mr-3 border border-gray-600 bg-gray-900 flex-shrink-0"
          />
          <span className="truncate text-gray-100 group-hover:underline" title={score.awayTeam}>{score.awayTeam}</span>
        </Link>
        <button
          onClick={handleToggleAwayTeamFavorite}
          aria-label={isAwayTeamFavorited ? "Remove away team from favorites" : "Add away team to favorites"}
          className="p-1 rounded-full hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${isAwayTeamFavorited ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.817 2.033a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.817-2.033a1 1 0 00-1.175 0l-2.817 2.033c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
        <span className="ml-2 text-3xl font-extrabold text-emerald-200">{score.awayScore}</span>
      </div>

      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-700 text-sm font-medium">
        <span className={`px-3 py-1 rounded-full text-white font-semibold ${
          isLive ? 'bg-red-600' : isFinished ? 'bg-green-600' : isUpcoming ? 'bg-blue-600' : 'bg-gray-600'
        }`}>
          {score.gameState}
        </span>
        <span className="text-gray-300">{score.gameTime}</span>
      </div>
    </div>
  );
};

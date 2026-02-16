
import React, { useState, useEffect } from 'react';
import { Score } from '../types';
import { Link } from 'react-router-dom';
import { EXAMPLE_FOOTBALL_TEAMS, EXAMPLE_BASKETBALL_TEAMS } from '../constants';
import { useUser } from '../context/UserContext';
import {
  addFavoriteTeam,
  removeFavoriteTeam,
  isFavoriteTeam,
  addFollowedGame, // Import new functions
  removeFollowedGame, // Import new functions
  isFollowedGame, // Import new functions
} from '../utils/favorites';
import { geminiService } from '../services/geminiService'; // Import geminiService for polling

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
  const [isGameFollowed, setIsGameFollowed] = useState(false); // New state for game follow status
  const [currentScore, setCurrentScore] = useState<Score | undefined>(score); // Mutable score state for updates
  const [isUpdating, setIsUpdating] = useState(false); // State for visual update cue

  useEffect(() => {
    setCurrentScore(score); // Initialize currentScore with the prop
  }, [score]);

  useEffect(() => {
    if (currentScore?.homeTeam) {
      setIsHomeTeamFavorited(isFavoriteTeam(currentUser.id, currentScore.homeTeam));
    }
    if (currentScore?.awayTeam) {
      setIsAwayTeamFavorited(isFavoriteTeam(currentUser.id, currentScore.awayTeam));
    }
    if (currentScore?.gameId) { // Check gameId for game follow status
      setIsGameFollowed(isFollowedGame(currentUser.id, currentScore.gameId));
    }
  }, [currentScore, currentUser.id]);


  // Simulate real-time updates for the current game
  useEffect(() => {
    if (!currentScore?.gameId || currentScore.gameState === 'Fulltime' || loading) {
      return; // Only update active games
    }

    const updateInterval = setInterval(async () => {
      try {
        // Request an update for this specific game ID
        const updatedScores = await geminiService.getLiveScores(
          undefined, // sport
          undefined, // teamName
          undefined, // playerName
          currentScore.gameId // gameId to specifically request for
        );
        const updatedGame = updatedScores.find(s => s.gameId === currentScore.gameId);

        if (updatedGame) {
          // Only update if scores or game state have actually changed
          if (
            updatedGame.homeScore !== currentScore.homeScore ||
            updatedGame.awayScore !== currentScore.awayScore ||
            updatedGame.gameState !== currentScore.gameState ||
            updatedGame.gameTime !== currentScore.gameTime
          ) {
            setCurrentScore(updatedGame);
            setIsUpdating(true); // Trigger visual cue
            setTimeout(() => setIsUpdating(false), 500); // Reset after a short delay
          }
        }
      } catch (error) {
        console.error(`Error fetching real-time update for game ${currentScore.gameId}:`, error);
      }
    }, 15000); // Poll every 15 seconds

    return () => clearInterval(updateInterval); // Clean up interval on unmount or score/loading changes
  }, [currentScore, loading]); // Depend on currentScore to restart interval if game changes

  const handleToggleHomeTeamFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking the star
    if (!currentScore?.homeTeam) return;

    if (isHomeTeamFavorited) {
      removeFavoriteTeam(currentUser.id, currentScore.homeTeam);
    } else {
      addFavoriteTeam(currentUser.id, currentScore.homeTeam);
    }
    setIsHomeTeamFavorited(prev => !prev);
  };

  const handleToggleAwayTeamFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking the star
    if (!currentScore?.awayTeam) return;

    if (isAwayTeamFavorited) {
      removeFavoriteTeam(currentUser.id, currentScore.awayTeam);
    } else {
      addFavoriteTeam(currentUser.id, currentScore.awayTeam);
    }
    setIsAwayTeamFavorited(prev => !prev);
  };

  const handleToggleGameFollow = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    if (!currentScore?.gameId) return;

    if (isGameFollowed) {
      removeFollowedGame(currentUser.id, currentScore.gameId);
    } else {
      addFollowedGame(currentUser.id, currentScore.gameId);
    }
    setIsGameFollowed(prev => !prev);
  };

  if (loading || !currentScore) { // Use currentScore in loading check
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
  // This block is implicitly covered by the initial !currentScore check if loading is false.
  // if (!currentScore) {
  //   return null; // Or <ErrorDisplay message="Score data not available" />
  // }

  const isLive = currentScore.gameState === 'Live';
  const isFinished = currentScore.gameState === 'Fulltime';
  const isUpcoming = currentScore.gameState === 'Upcoming';

  return (
    <div className={`bg-gray-800 rounded-lg shadow-lg p-4 mb-4 transform hover:scale-102 transition-all duration-300 ease-in-out cursor-pointer relative overflow-hidden
      ${isUpdating ? 'animate-score-update' : ''}`}>
      <div className="flex justify-between items-start text-xs text-gray-400 mb-2">
        <span className="font-semibold text-emerald-400 uppercase">{currentScore.sport}</span>
        <span className="font-medium">{currentScore.league}</span>
      </div>

      <div className="flex items-center justify-between text-lg md:text-xl font-bold mb-3">
        {/* Home Team */}
        <Link to={getTeamPageLink(currentScore.homeTeam, currentScore.sport)} className="flex items-center flex-grow min-w-0 pr-2 group">
          <img
            src={`https://picsum.photos/seed/${encodeURIComponent(currentScore.homeTeam)}/30/30`}
            alt={`${currentScore.homeTeam} logo`}
            className="w-8 h-8 rounded-full mr-3 border border-gray-600 bg-gray-900 flex-shrink-0"
          />
          <span className="truncate text-gray-100 group-hover:underline" title={currentScore.homeTeam}>{currentScore.homeTeam}</span>
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
        <span className="ml-2 text-3xl font-extrabold text-emerald-200">{currentScore.homeScore}</span>
      </div>

      <div className="flex items-center justify-between text-lg md:text-xl font-bold mb-3">
        {/* Away Team */}
        <Link to={getTeamPageLink(currentScore.awayTeam, currentScore.sport)} className="flex items-center flex-grow min-w-0 pr-2 group">
          <img
            src={`https://picsum.photos/seed/${encodeURIComponent(currentScore.awayTeam)}/30/30`}
            alt={`${currentScore.awayTeam} logo`}
            className="w-8 h-8 rounded-full mr-3 border border-gray-600 bg-gray-900 flex-shrink-0"
          />
          <span className="truncate text-gray-100 group-hover:underline" title={currentScore.awayTeam}>{currentScore.awayTeam}</span>
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
        <span className="ml-2 text-3xl font-extrabold text-emerald-200">{currentScore.awayScore}</span>
      </div>

      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-700 text-sm font-medium">
        <span className={`px-3 py-1 rounded-full text-white font-semibold ${
          isLive ? 'bg-red-600' : isFinished ? 'bg-green-600' : isUpcoming ? 'bg-blue-600' : 'bg-gray-600'
        }`}>
          {currentScore.gameState}
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-gray-300">{currentScore.gameTime}</span>
          {currentScore.gameId && (
            <button
              onClick={handleToggleGameFollow}
              aria-label={isGameFollowed ? "Remove game from scoreboard" : "Add game to scoreboard"}
              className="p-1 rounded-full hover:bg-gray-700 transition-colors flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${isGameFollowed ? 'text-blue-400 fill-current' : 'text-gray-400'}`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M5 21a2 2 0 002 2h10a2 2 0 002-2V7l-5-5H7a2 2 0 00-2 2v17zm7-14h5l-5-5v5z" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <style>{`
        @keyframes scoreUpdateFlash {
          0% { background-color: #374151; } /* gray-700 */
          50% { background-color: #059669; } /* emerald-600 */
          100% { background-color: #374151; } /* gray-700 */
        }
        .animate-score-update {
          animation: scoreUpdateFlash 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

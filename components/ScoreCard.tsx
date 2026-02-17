
import React, { useState, useEffect } from 'react';
import { Score } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { EXAMPLE_FOOTBALL_TEAMS, EXAMPLE_BASKETBALL_TEAMS } from '../constants';
import { useUser } from '../context/UserContext';
import {
  addFavoriteTeam,
  removeFavoriteTeam,
  isFavoriteTeam,
  addFollowedGame,
  removeFollowedGame,
  isFollowedGame,
} from '../utils/favorites';
import { geminiService } from '../services/geminiService';

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
  const navigate = useNavigate();
  const [isHomeTeamFavorited, setIsHomeTeamFavorited] = useState(false);
  const [isAwayTeamFavorited, setIsAwayTeamFavorited] = useState(false);
  const [isGameFollowed, setIsGameFollowed] = useState(false);
  const [currentScore, setCurrentScore] = useState<Score | undefined>(score);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setCurrentScore(score);
  }, [score]);

  useEffect(() => {
    if (currentScore?.homeTeam) {
      setIsHomeTeamFavorited(isFavoriteTeam(currentUser.id, currentScore.homeTeam));
    }
    if (currentScore?.awayTeam) {
      setIsAwayTeamFavorited(isFavoriteTeam(currentUser.id, currentScore.awayTeam));
    }
    if (currentScore?.gameId) {
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
        const updatedScores = await geminiService.getLiveScores(
          undefined,
          undefined,
          undefined,
          currentScore.gameId
        );
        const updatedGame = updatedScores.find(s => s.gameId === currentScore.gameId);

        if (updatedGame) {
          if (
            updatedGame.homeScore !== currentScore.homeScore ||
            updatedGame.awayScore !== currentScore.awayScore ||
            updatedGame.gameState !== currentScore.gameState ||
            updatedGame.gameTime !== currentScore.gameTime
          ) {
            setCurrentScore(updatedGame);
            setIsUpdating(true);
            setTimeout(() => setIsUpdating(false), 500);
          }
        }
      } catch (error) {
        console.error(`Error fetching real-time update for game ${currentScore.gameId}:`, error);
      }
    }, 15000);

    return () => clearInterval(updateInterval);
  }, [currentScore, loading]);

  const handleToggleHomeTeamFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentScore?.homeTeam) return;

    if (isHomeTeamFavorited) {
      removeFavoriteTeam(currentUser.id, currentScore.homeTeam);
    } else {
      addFavoriteTeam(currentUser.id, currentScore.homeTeam);
    }
    setIsHomeTeamFavorited(prev => !prev);
  };

  const handleToggleAwayTeamFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentScore?.awayTeam) return;

    if (isAwayTeamFavorited) {
      removeFavoriteTeam(currentUser.id, currentScore.awayTeam);
    } else {
      addFavoriteTeam(currentUser.id, currentScore.awayTeam);
    }
    setIsAwayTeamFavorited(prev => !prev);
  };

  const handleToggleGameFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentScore?.gameId) return;

    if (isGameFollowed) {
      removeFollowedGame(currentUser.id, currentScore.gameId);
    } else {
      addFollowedGame(currentUser.id, currentScore.gameId);
    }
    setIsGameFollowed(prev => !prev);
  };

  const handleStartWatchParty = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentScore?.gameId) {
      navigate(`/game/${currentScore.gameId}/watchparty`);
    }
  };

  if (loading || !currentScore) {
    return (
      <div className="bg-secondary rounded-lg shadow-md p-3 mb-3 animate-pulse">
        <div className="flex justify-between items-center text-xs text-secondary mb-2">
          <div className="h-3 bg-tertiary rounded w-1/4"></div>
          <div className="h-3 bg-tertiary rounded w-1/6"></div>
        </div>
        <div className="flex items-center justify-between text-base font-bold mb-2">
          <div className="flex items-center flex-grow min-w-0 pr-2">
            <div className="w-6 h-6 rounded-full bg-tertiary mr-2 flex-shrink-0"></div>
            <div className="h-4 bg-tertiary rounded w-3/5"></div>
          </div>
          <div className="h-6 bg-tertiary rounded w-1/12 mx-1"></div>
        </div>
        <div className="flex items-center justify-between text-base font-bold mb-2">
          <div className="flex items-center flex-grow min-w-0 pr-2">
            <div className="w-6 h-6 rounded-full bg-tertiary mr-2 flex-shrink-0"></div>
            <div className="h-4 bg-tertiary rounded w-3/5"></div>
          </div>
          <div className="h-6 bg-tertiary rounded w-1/12 mx-1"></div>
        </div>
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-border text-xs font-medium">
          <div className="h-4 bg-tertiary rounded-full w-1/5"></div>
          <div className="h-4 bg-tertiary rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  const isLive = currentScore.gameState === 'Live';
  const isFinished = currentScore.gameState === 'Fulltime';
  const isUpcoming = currentScore.gameState === 'Upcoming';

  return (
    <div className={`bg-secondary rounded-lg shadow-md p-3 mb-3 hover-bg-secondary transition-all duration-300 ease-in-out cursor-pointer relative overflow-hidden
      ${isUpdating ? 'animate-score-update' : ''}`}>
      <div className="flex justify-between items-start text-xs text-secondary mb-2">
        <span className="font-semibold text-accent uppercase">{currentScore.sport}</span>
        <span className="font-medium">{currentScore.league}</span>
      </div>

      <div className="flex items-center justify-between text-base font-bold mb-1">
        <Link to={getTeamPageLink(currentScore.homeTeam, currentScore.sport)} className="flex items-center flex-grow min-w-0 pr-2 group text-primary">
          <img
            src={`https://picsum.photos/seed/${encodeURIComponent(currentScore.homeTeam)}/25/25`}
            alt={`${currentScore.homeTeam} logo`}
            className="w-6 h-6 rounded-full mr-2 border border-border bg-tertiary flex-shrink-0"
          />
          <span className="truncate group-hover:underline" title={currentScore.homeTeam}>{currentScore.homeTeam}</span>
        </Link>
        <button
          onClick={handleToggleHomeTeamFavorite}
          aria-label={isHomeTeamFavorited ? "Remove home team from favorites" : "Add home team to favorites"}
          className="p-1 rounded-full text-secondary hover:text-favorite transition-colors flex-shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 ${isHomeTeamFavorited ? 'text-favorite fill-current' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.817 2.033a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.817-2.033a1 1 0 00-1.175 0l-2.817 2.033c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
        <span className="ml-2 text-xl font-extrabold text-primary">{currentScore.homeScore}</span>
      </div>

      <div className="flex items-center justify-between text-base font-bold mb-1">
        <Link to={getTeamPageLink(currentScore.awayTeam, currentScore.sport)} className="flex items-center flex-grow min-w-0 pr-2 group text-primary">
          <img
            src={`https://picsum.photos/seed/${encodeURIComponent(currentScore.awayTeam)}/25/25`}
            alt={`${currentScore.awayTeam} logo`}
            className="w-6 h-6 rounded-full mr-2 border border-border bg-tertiary flex-shrink-0"
          />
          <span className="truncate group-hover:underline" title={currentScore.awayTeam}>{currentScore.awayTeam}</span>
        </Link>
        <button
          onClick={handleToggleAwayTeamFavorite}
          aria-label={isAwayTeamFavorited ? "Remove away team from favorites" : "Add away team to favorites"}
          className="p-1 rounded-full text-secondary hover:text-favorite transition-colors flex-shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 ${isAwayTeamFavorited ? 'text-favorite fill-current' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.817 2.033a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.817-2.033a1 1 0 00-1.175 0l-2.817 2.033c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
        <span className="ml-2 text-xl font-extrabold text-primary">{currentScore.awayScore}</span>
      </div>

      <div className="flex justify-between items-center mt-3 pt-2 border-t border-border text-xs font-medium">
        <span className={`px-2 py-1 rounded-full text-primary font-semibold ${
          isLive ? 'bg-live' : isFinished ? 'bg-emerald-600' : isUpcoming ? 'bg-blue-600' : 'bg-secondary'
        }`}>
          {currentScore.gameState}
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-secondary">{currentScore.gameTime}</span>
          {currentScore.gameId && (
            <button
              onClick={handleToggleGameFollow}
              aria-label={isGameFollowed ? "Remove game from scoreboard" : "Add game to scoreboard"}
              className="p-1 rounded-full text-secondary hover:text-followed transition-colors flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 ${isGameFollowed ? 'text-followed fill-current' : ''}`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M5 21a2 2 0 002 2h10a2 2 0 002-2V7l-5-5H7a2 2 0 00-2 2v17zm7-14h5l-5-5v5z" />
              </svg>
            </button>
          )}
          {currentScore.gameId && isLive && ( // Only show watch party for live games
            <button
              onClick={handleStartWatchParty}
              aria-label="Start Watch Party"
              className="p-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors flex-shrink-0 ml-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <style>{`
        @keyframes scoreUpdateFlash {
          0% { background-color: var(--color-bg-secondary); }
          50% { background-color: var(--color-text-accent); }
          100% { background-color: var(--color-bg-secondary); }
        }
        .animate-score-update {
          animation: scoreUpdateFlash 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};
    
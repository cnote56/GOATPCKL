
import React, { useState, useEffect, useCallback } from 'react';
import { getFollowedGames, removeFollowedGame } from '../utils/favorites';
import { geminiService } from '../services/geminiService';
import { Score, Odds, QueryStatus } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { useUser } from '../context/UserContext';
import { ScoreCard } from '../components/ScoreCard';

interface FollowedGameData {
  score: Score;
  odds?: Odds;
  status: QueryStatus;
  error: string | null;
}

// Helper to format odds for display
const formatOdds = (odds?: Odds) => {
  if (!odds) return 'Odds N/A';
  return (
    <div className="text-xs text-secondary mt-1 space-y-0.5">
      <p>O/U: <span className="text-primary font-semibold">{odds.overUnder}</span></p>
      <p>Spread: {odds.spread > 0 ? '+' : ''}<span className="text-primary font-semibold">{odds.spread}</span></p>
      <p>ML Home: <span className="text-primary font-semibold">{odds.moneylineHome > 0 ? '+' : ''}{odds.moneylineHome}</span></p>
      <p>ML Away: <span className="text-primary font-semibold">{odds.moneylineAway > 0 ? '+' : ''}{odds.moneylineAway}</span></p>
      {odds.moneylineDraw && <p>ML Draw: <span className="text-primary font-semibold">{odds.moneylineDraw > 0 ? '+' : ''}{odds.moneylineDraw}</span></p>}
      <p className="text-secondary text-[10px]">Updated: {new Date(odds.lastUpdated).toLocaleTimeString()}</p>
    </div>
  );
};

interface FollowedGameCardProps {
  gameData: FollowedGameData;
  onRemove: (gameId: string) => void;
  isLoading: boolean;
}

const FollowedGameCard: React.FC<FollowedGameCardProps> = ({ gameData, onRemove, isLoading }) => {
  if (isLoading) {
    return <ScoreCard loading={true} />; // Use existing skeleton for loading
  }

  const { score, odds, error } = gameData;

  return (
    <div className="bg-secondary rounded-lg shadow-md p-3 mb-3 flex flex-col justify-between h-full hover-bg-secondary">
      {error ? (
        <div className="flex flex-col items-center justify-center h-full text-red-400 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">{error}</p>
          <button onClick={() => onRemove(score.gameId || '')} className="mt-2 text-xs text-red-500 hover:underline">
            Remove
          </button>
        </div>
      ) : (
        <>
          <ScoreCard score={score} />
          <div className="mt-3 pt-2 border-t border-border flex justify-between items-end">
            <div>
              <h3 className="text-base font-semibold text-accent mb-1">Odds:</h3>
              {formatOdds(odds)}
            </div>
            <button
              onClick={() => onRemove(score.gameId || '')}
              aria-label={`Remove ${score.homeTeam} vs ${score.awayTeam} from scoreboard`}
              className="p-1 rounded-full hover:bg-red-700 text-red-400 hover:text-white transition-colors self-end"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};


export const MyScoreboardPage: React.FC = () => {
  const { currentUser } = useUser();
  const [followedGames, setFollowedGames] = useState<Record<string, FollowedGameData>>({});
  const [overallStatus, setOverallStatus] = useState<QueryStatus>('idle');

  const fetchFollowedGameData = useCallback(async () => {
    setOverallStatus('loading');
    const gameIds = getFollowedGames(currentUser.id);
    if (gameIds.length === 0) {
      setFollowedGames({});
      setOverallStatus('success');
      return;
    }

    const fetchedData: Record<string, FollowedGameData> = {};
    let hasErrors = false;

    for (const gameId of gameIds) {
      fetchedData[gameId] = { score: {}, odds: undefined, status: 'loading', error: null };
      try {
        const scores = await geminiService.getLiveScores(undefined, undefined, undefined, gameId);
        const score = scores.find(s => s.gameId === gameId);

        if (!score) {
          throw new Error(`Game details not found for ID: ${gameId}`);
        }

        const odds = await geminiService.getGameOdds(gameId, score.homeTeam || 'Home Team', score.awayTeam || 'Away Team');

        fetchedData[gameId] = {
          score,
          odds,
          status: 'success',
          error: null,
        };
      } catch (err: any) {
        console.error(`Failed to fetch data for followed game ${gameId}:`, err);
        hasErrors = true;
        fetchedData[gameId] = {
          score: { gameId },
          odds: undefined,
          status: 'error',
          error: err.message || `Failed to load data for game ${gameId}`,
        };
      }
    }
    setFollowedGames(fetchedData);
    setOverallStatus(hasErrors ? 'error' : 'success');
  }, [currentUser.id]);

  useEffect(() => {
    fetchFollowedGameData();
  }, [fetchFollowedGameData]);

  const handleRemoveGame = (gameId: string) => {
    removeFollowedGame(currentUser.id, gameId);
    setFollowedGames(prev => {
      const newState = { ...prev };
      delete newState[gameId];
      return newState;
    });
  };

  const gameIds = Object.keys(followedGames);
  const isLoading = overallStatus === 'loading';
  const noFollowedGames = !isLoading && gameIds.length === 0;

  return (
    <div className="p-4 bg-secondary rounded-lg shadow-xl">
      <h1 className="text-2xl font-extrabold text-center text-accent mb-6">My Scoreboard</h1>

      {isLoading && gameIds.length === 0 && <LoadingSpinner />}
      {noFollowedGames && (
        <p className="text-center text-secondary text-xl py-10">
          You aren't following any games yet.
          <br />
          Ask the chatbot about a game and add it to your scoreboard!
        </p>
      )}

      {gameIds.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {gameIds.map(gameId => (
            <FollowedGameCard
              key={gameId}
              gameData={followedGames[gameId]}
              onRemove={handleRemoveGame}
              isLoading={followedGames[gameId]?.status === 'loading'}
            />
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-tertiary rounded-lg shadow-md text-center border-t border-border">
        <h2 className="text-xl font-bold text-accent mb-3">Parlays & Betting Lines</h2>
        <p className="text-secondary mb-3">
          The individual game odds are displayed above. For combining multiple bets (parlays) and more advanced lines,
          please refer to a dedicated sports betting platform. URScoreCard aims to provide score and odds information,
          but does not facilitate betting directly.
        </p>
        <p className="text-xs text-secondary">
          This feature is for informational purposes only. Betting involves risk. Please bet responsibly.
        </p>
      </div>
    </div>
  );
};
    
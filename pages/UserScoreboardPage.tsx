
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getFollowedGames } from '../utils/favorites'; // Only reading here
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
  isLoading: boolean;
}

const FollowedGameCard: React.FC<FollowedGameCardProps> = ({ gameData, isLoading }) => {
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
        </div>
      ) : (
        <>
          <ScoreCard score={score} />
          <div className="mt-3 pt-2 border-t border-border flex justify-between items-end">
            <div>
              <h3 className="text-base font-semibold text-accent mb-1">Odds:</h3>
              {formatOdds(odds)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};


export const UserScoreboardPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { availableUsers, currentUser } = useUser();
  const targetUser = availableUsers.find(u => u.id === userId);

  const [followedGames, setFollowedGames] = useState<Record<string, FollowedGameData>>({});
  const [overallStatus, setOverallStatus] = useState<QueryStatus>('idle');

  const fetchFollowedGameData = useCallback(async (targetUserId: string) => {
    setOverallStatus('loading');
    const gameIds = getFollowedGames(targetUserId);
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

        // Only fetch odds if the game is upcoming or live
        let odds;
        if (score.gameState !== 'Fulltime') {
            odds = await geminiService.getGameOdds(gameId, score.homeTeam || 'Home Team', score.awayTeam || 'Away Team');
        }


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
  }, []);

  useEffect(() => {
    if (userId) {
      fetchFollowedGameData(userId);
    }
  }, [userId, fetchFollowedGameData]);

  const handleRetry = () => {
    if (userId) {
      fetchFollowedGameData(userId);
    }
  };

  if (!targetUser) {
    return <ErrorDisplay message="User not found." />;
  }

  const gameIds = Object.keys(followedGames);
  const isLoading = overallStatus === 'loading';
  const noFollowedGames = !isLoading && gameIds.length === 0;

  return (
    <div className="p-4 bg-secondary rounded-lg shadow-xl">
      <h1 className="text-2xl font-extrabold text-center text-accent mb-6">
        {targetUser.id === currentUser.id ? "My Scoreboard" : `${targetUser.name}'s Scoreboard`}
      </h1>

      {isLoading && gameIds.length === 0 && <LoadingSpinner />}
      {noFollowedGames && (
        <p className="text-center text-secondary text-xl py-10">
          {targetUser.id === currentUser.id
            ? "You aren't following any games yet."
            : `${targetUser.name} isn't following any games yet.`}
        </p>
      )}

      {gameIds.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {gameIds.map(gameId => (
            <FollowedGameCard
              key={gameId}
              gameData={followedGames[gameId]}
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
    
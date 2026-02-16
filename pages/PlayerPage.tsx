
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { PlayerDetail } from '../components/PlayerDetail';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { geminiService } from '../services/geminiService';
import { PlayerProfile, QueryStatus } from '../types';

export const PlayerPage: React.FC = () => {
  const { playerName } = useParams<{ playerName: string }>();
  const [player, setPlayer] = useState<PlayerProfile | undefined>(undefined);
  const [status, setStatus] = useState<QueryStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchPlayerProfile = useCallback(async (name: string) => {
    setStatus('loading');
    setError(null);
    try {
      const fetchedPlayer = await geminiService.getPlayerProfile(name);
      if (fetchedPlayer) {
        setPlayer(fetchedPlayer);
        setStatus('success');
      } else {
        setError(`Player '${name}' not found or could not be generated.`);
        setStatus('error');
      }
    } catch (err) {
      console.error("Failed to fetch player profile:", err);
      setError("Failed to load player profile. Please try again later.");
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (playerName) {
      fetchPlayerProfile(decodeURIComponent(playerName));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerName]);

  const handleRetry = () => {
    if (playerName) {
      fetchPlayerProfile(decodeURIComponent(playerName));
    }
  };

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'error') {
    return <ErrorDisplay message={error || "Unknown error"} onRetry={handleRetry} />;
  }

  if (!player) {
    return (
      <ErrorDisplay
        message={`No player found for: ${playerName}. Please check the name or try another.`}
        onRetry={handleRetry}
      />
    );
  }

  return <PlayerDetail player={player} />;
};

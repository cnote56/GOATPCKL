
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { LeagueDetail } from '../components/LeagueDetail';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { geminiService } from '../services/geminiService';
import { LeagueProfile, QueryStatus } from '../types';

export const LeaguePage: React.FC = () => {
  const { leagueName } = useParams<{ leagueName: string }>();
  const [league, setLeague] = useState<LeagueProfile | undefined>(undefined);
  const [status, setStatus] = useState<QueryStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchLeagueProfile = useCallback(async (name: string) => {
    setStatus('loading');
    setError(null);
    try {
      const fetchedLeague = await geminiService.getLeagueProfile(name);
      if (fetchedLeague) {
        setLeague(fetchedLeague);
        setStatus('success');
      } else {
        setError(`League '${name}' not found or could not be generated.`);
        setStatus('error');
      }
    } catch (err) {
      console.error("Failed to fetch league profile:", err);
      setError("Failed to load league profile. Please try again later.");
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (leagueName) {
      fetchLeagueProfile(decodeURIComponent(leagueName));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueName]);

  const handleRetry = () => {
    if (leagueName) {
      fetchLeagueProfile(decodeURIComponent(leagueName));
    }
  };

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'error') {
    return <ErrorDisplay message={error || "Unknown error"} onRetry={handleRetry} />;
  }

  if (!league) {
    return (
      <ErrorDisplay
        message={`No league found for: ${leagueName}. Please check the name or try another.`}
        onRetry={handleRetry}
      />
    );
  }

  return <LeagueDetail league={league} />;
};

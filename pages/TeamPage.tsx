
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { TeamDetail } from '../components/TeamDetail';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { geminiService } from '../services/geminiService';
import { TeamProfile, QueryStatus } from '../types';

export const TeamPage: React.FC = () => {
  const { teamName } = useParams<{ teamName: string }>();
  const [team, setTeam] = useState<TeamProfile | undefined>(undefined);
  const [status, setStatus] = useState<QueryStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchTeamProfile = useCallback(async (name: string) => {
    setStatus('loading');
    setError(null);
    try {
      const fetchedTeam = await geminiService.getTeamProfile(name);
      if (fetchedTeam) {
        setTeam(fetchedTeam);
        setStatus('success');
      } else {
        setError(`Team '${name}' not found or could not be generated.`);
        setStatus('error');
      }
    } catch (err) {
      console.error("Failed to fetch team profile:", err);
      setError("Failed to load team profile. Please try again later.");
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (teamName) {
      fetchTeamProfile(decodeURIComponent(teamName));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamName]);

  const handleRetry = () => {
    if (teamName) {
      fetchTeamProfile(decodeURIComponent(teamName));
    }
  };

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'error') {
    return <ErrorDisplay message={error || "Unknown error"} onRetry={handleRetry} />;
  }

  if (!team) {
    return (
      <ErrorDisplay
        message={`No team found for: ${teamName}. Please check the name or try another.`}
        onRetry={handleRetry}
      />
    );
  }

  return <TeamDetail team={team} />;
};

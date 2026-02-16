
import React, { useState, useEffect, useCallback } from 'react';
import { ScoreCard } from '../components/ScoreCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { geminiService } from '../services/geminiService';
import { Score, Sport, QueryStatus } from '../types';
import { useSearchParams } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const [scores, setScores] = useState<Score[]>([]);
  const [status, setStatus] = useState<QueryStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  // Get the sport from the URL, default to 'All' if not present
  const urlSport = searchParams.get('sport');
  const selectedSport = (urlSport || 'All') as Sport | 'All';

  const fetchScores = useCallback(async (sport?: Sport) => {
    setStatus('loading');
    setError(null);
    try {
      const fetchedScores = await geminiService.getLiveScores(sport);
      setScores(fetchedScores);
      setStatus('success');
    } catch (err) {
      console.error("Failed to fetch scores:", err);
      setError("Failed to load scores. Please try again later.");
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchScores(selectedSport === 'All' ? undefined : selectedSport);
  }, [selectedSport, fetchScores]);

  const handleRetry = () => {
    fetchScores(selectedSport === 'All' ? undefined : selectedSport);
  };

  // Group scores by date for better readability
  const groupedScores = scores.reduce((acc, score) => {
    const date = score.date || 'Unknown Date';
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(score);
    return acc;
  }, {} as Record<string, Score[]>);

  const sortedDates = Object.keys(groupedScores).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());


  return (
    <div className="p-2">
      <h1 className="text-2xl font-extrabold text-center text-accent mb-6">
        {selectedSport === 'All' ? 'Live Scores & Upcoming Games' : `${selectedSport} Scores`}
      </h1>

      {status === 'loading' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, index) => (
            <ScoreCard key={index} loading={true} />
          ))}
        </div>
      )}
      {status === 'error' && <ErrorDisplay message={error || "Unknown error"} onRetry={handleRetry} />}
      {status === 'success' && scores.length === 0 && (
        <p className="text-center text-secondary text-xl">No scores available for selected sport.</p>
      )}

      {status === 'success' && scores.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedDates.map(date => (
            <React.Fragment key={date}>
              <div className="col-span-full">
                <h2 className="text-lg font-bold text-accent mb-2 border-b border-border pb-1">
                  {date === new Date().toISOString().slice(0, 10) ? 'Today' : date}
                </h2>
              </div>
              {groupedScores[date].map((score) => (
                <ScoreCard key={score.gameId} score={score} />
              ))}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
    
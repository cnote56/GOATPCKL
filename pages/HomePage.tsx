
import React, { useState, useEffect, useCallback } from 'react';
import { ScoreCard } from '../components/ScoreCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { geminiService } from '../services/geminiService';
import { Score, Sport, QueryStatus } from '../types';
import { EXAMPLE_SPORTS } from '../constants';

export const HomePage: React.FC = () => {
  const [scores, setScores] = useState<Score[]>([]);
  const [status, setStatus] = useState<QueryStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<Sport | 'All'>('All');

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSport]); // Refetch when selectedSport changes

  const handleSportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSport(e.target.value as Sport | 'All');
  };

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
    <div className="p-4">
      <h1 className="text-4xl font-extrabold text-center text-emerald-400 mb-8">Live Scores & Upcoming Games</h1>

      <div className="flex justify-center mb-8">
        <select
          value={selectedSport}
          onChange={handleSportChange}
          className="bg-gray-700 text-gray-100 border border-gray-600 rounded-lg p-3 text-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
        >
          <option value="All">All Sports</option>
          {EXAMPLE_SPORTS.map((sport) => (
            <option key={sport} value={sport}>
              {sport}
            </option>
          ))}
        </select>
      </div>

      {status === 'loading' && <LoadingSpinner />}
      {status === 'error' && <ErrorDisplay message={error || "Unknown error"} onRetry={handleRetry} />}
      {status === 'success' && scores.length === 0 && (
        <p className="text-center text-gray-400 text-xl">No scores available for selected sport.</p>
      )}

      {status === 'success' && scores.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedDates.map(date => (
            <div key={date} className="md:col-span-full">
              <h2 className="text-2xl font-bold text-emerald-300 mb-4 border-b border-gray-700 pb-2">
                {date === new Date().toISOString().slice(0, 10) ? 'Today' : date}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedScores[date].map((score) => (
                  <ScoreCard key={score.gameId} score={score} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

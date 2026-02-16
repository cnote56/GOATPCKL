
import React, { useState, useEffect, useCallback } from 'react';
import { ScoreCard } from '../components/ScoreCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { geminiService } from '../services/geminiService';
import { Score, Sport, QueryStatus } from '../types';
import { EXAMPLE_SPORTS } from '../constants';
import { useSearchParams } from 'react-router-dom'; // Import useSearchParams

export const HomePage: React.FC = () => {
  const [scores, setScores] = useState<Score[]>([]);
  const [status, setStatus] = useState<QueryStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams(); // Initialize useSearchParams

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
    // Fetch scores based on the sport from the URL
    fetchScores(selectedSport === 'All' ? undefined : selectedSport);
  }, [selectedSport, fetchScores]); // Re-fetch when selectedSport (derived from URL) changes

  const handleSportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSport = e.target.value as Sport | 'All';
    if (newSport === 'All') {
      setSearchParams({}); // Remove sport parameter from URL
    } else {
      setSearchParams({ sport: newSport }); // Set sport parameter in URL
    }
    // The useEffect above will handle re-fetching based on the URL change
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
          value={selectedSport} // Control dropdown with state derived from URL
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

      {status === 'loading' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Render multiple skeleton cards for a better loading experience */}
          {[...Array(6)].map((_, index) => (
            <ScoreCard key={index} loading={true} />
          ))}
        </div>
      )}
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
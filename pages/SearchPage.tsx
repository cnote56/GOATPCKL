
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { geminiService } from '../services/geminiService';
import { SearchResult, QueryStatus, Score } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { ScoreCard } from '../components/ScoreCard';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');
  const [searchResult, setSearchResult] = useState<SearchResult | undefined>(undefined);
  const [scores, setScores] = useState<Score[]>([]);
  const [isScoresResult, setIsScoresResult] = useState(false);
  const [status, setStatus] = useState<QueryStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchSearchResult = useCallback(async (searchQuery: string) => {
    setStatus('loading');
    setError(null);
    setSearchResult(undefined);
    setScores([]);
    setIsScoresResult(false);

    try {
      // First, try to get scores for the query as a team name
      const fetchedScores = await geminiService.getLiveScores(undefined, searchQuery);
      if (fetchedScores && fetchedScores.length > 0) {
        setScores(fetchedScores);
        setIsScoresResult(true);
        setStatus('success');
      } else {
        // If no scores found for the team, or if the query wasn't a team,
        // fall back to a general search.
        const result = await geminiService.searchSportsData(searchQuery);
        if (result) {
          setSearchResult(result);
          setIsScoresResult(false);
          setStatus('success');
        } else {
          setError("Could not retrieve any results for your query.");
          setStatus('error');
        }
      }
    } catch (err) {
      console.error("Failed to perform specific or general search:", err);
      try {
        const result = await geminiService.searchSportsData(searchQuery);
        if (result) {
          setSearchResult(result);
          setIsScoresResult(false);
          setStatus('success');
        } else {
          setError("Failed to perform search. Please try again later.");
          setStatus('error');
        }
      } catch (generalErr) {
        console.error("Failed during general search fallback:", generalErr);
        setError("Failed to perform search. Please try again later.");
        setStatus('error');
      }
    }
  }, []);

  useEffect(() => {
    if (query) {
      fetchSearchResult(decodeURIComponent(query));
    } else {
      setError("No search query provided.");
      setStatus('error');
    }
  }, [query, fetchSearchResult]);

  const handleRetry = () => {
    if (query) {
      fetchSearchResult(decodeURIComponent(query));
    }
  };

  // Group scores by date for better readability (similar to HomePage)
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
    <div className="p-4 bg-secondary rounded-lg shadow-xl">
      <h1 className="text-2xl font-extrabold text-center text-accent mb-6">Search Results</h1>
      <p className="text-lg text-center text-secondary mb-6">
        Query: <span className="font-semibold text-primary">"{query}"</span>
      </p>

      {status === 'loading' && <LoadingSpinner />}

      {status === 'error' && <ErrorDisplay message={error || "Unknown error during search."} onRetry={handleRetry} />}

      {status === 'success' && isScoresResult && scores.length > 0 && (
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-accent mb-4 text-center">Live Scores & Upcoming Games for "{query}"</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedDates.map(date => (
              <React.Fragment key={date}>
                {groupedScores[date].length > 0 && (
                  <div className="col-span-full">
                    <h3 className="text-lg font-bold text-accent mb-2 border-b border-border pb-1">
                      {date === new Date().toISOString().slice(0, 10) ? 'Today' : date}
                    </h3>
                  </div>
                )}
                {groupedScores[date].map((score) => (
                  <ScoreCard key={score.gameId} score={score} />
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {status === 'success' && !isScoresResult && searchResult && (
        <div className="bg-tertiary rounded-lg shadow-md p-6 md:p-8 max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-accent mb-4">Answer:</h2>
          <p className="text-primary leading-relaxed mb-6">{searchResult.answer}</p>

          {searchResult.groundingLinks && searchResult.groundingLinks.length > 0 && (
            <div className="mt-6 border-t border-border pt-6">
              <h3 className="text-lg font-bold text-accent mb-3">Sources:</h3>
              <ul className="list-disc list-inside space-y-2">
                {searchResult.groundingLinks.map((link, index) => (
                  <li key={index} className="text-secondary">
                    <a
                      href={link.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link hover:underline transition-colors duration-200"
                    >
                      {link.title || link.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {status === 'success' && !isScoresResult && !searchResult && (
        <p className="text-center text-secondary text-xl">No general information found for your query.</p>
      )}
      {status === 'success' && isScoresResult && scores.length === 0 && (
         <p className="text-center text-secondary text-xl">No scores available for "{query}".</p>
      )}
    </div>
  );
};
    
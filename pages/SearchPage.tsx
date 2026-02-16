
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { geminiService } from '../services/geminiService';
import { SearchResult, QueryStatus } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');
  const [searchResult, setSearchResult] = useState<SearchResult | undefined>(undefined);
  const [status, setStatus] = useState<QueryStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchSearchResult = useCallback(async (searchQuery: string) => {
    setStatus('loading');
    setError(null);
    setSearchResult(undefined); // Clear previous results
    try {
      const result = await geminiService.searchSportsData(searchQuery);
      if (result) {
        setSearchResult(result);
        setStatus('success');
      } else {
        setError("Could not retrieve search results.");
        setStatus('error');
      }
    } catch (err) {
      console.error("Failed to fetch search result:", err);
      setError("Failed to perform search. Please try again later.");
      setStatus('error');
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

  return (
    <div className="p-4">
      <h1 className="text-4xl font-extrabold text-center text-emerald-400 mb-8">Search Results</h1>
      <p className="text-xl text-center text-gray-300 mb-6">
        Query: <span className="font-semibold text-emerald-300">"{query}"</span>
      </p>

      {status === 'loading' && <LoadingSpinner />}

      {status === 'error' && <ErrorDisplay message={error || "Unknown error during search."} onRetry={handleRetry} />}

      {status === 'success' && searchResult && (
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-emerald-300 mb-4">Answer:</h2>
          <p className="text-gray-200 leading-relaxed mb-6">{searchResult.answer}</p>

          {searchResult.groundingLinks && searchResult.groundingLinks.length > 0 && (
            <div className="mt-6 border-t border-gray-700 pt-6">
              <h3 className="text-xl font-bold text-emerald-400 mb-3">Sources:</h3>
              <ul className="list-disc list-inside space-y-2">
                {searchResult.groundingLinks.map((link, index) => (
                  <li key={index} className="text-gray-300">
                    <a
                      href={link.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline transition-colors duration-200"
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
    </div>
  );
};

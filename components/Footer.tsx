
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-400 text-sm py-4 px-4 sm:px-6 lg:px-8 mt-8">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <p>&copy; {new Date().getFullYear()} URScoreCard Frontend. All rights reserved.</p>
        <p className="mt-2 sm:mt-0">
          Powered by{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline"
          >
            Gemini API
          </a>
        </p>
      </div>
    </footer>
  );
};

import React from 'react';
import { Score } from '../types';
import { Link } from 'react-router-dom';
import { EXAMPLE_FOOTBALL_TEAMS, EXAMPLE_BASKETBALL_TEAMS } from '../constants';

interface ScoreCardProps {
  score: Score;
}

const getTeamPageLink = (teamName: string, sport: string) => {
  // Simple heuristic for linking to team pages based on example data
  if (sport === 'Football' && EXAMPLE_FOOTBALL_TEAMS.includes(teamName)) {
    return `/team/${encodeURIComponent(teamName)}`;
  }
  if (sport === 'Basketball' && EXAMPLE_BASKETBALL_TEAMS.includes(teamName)) {
    return `/team/${encodeURIComponent(teamName)}`;
  }
  return '#'; // Fallback if no specific team page can be generated
};

export const ScoreCard: React.FC<ScoreCardProps> = ({ score }) => {
  const isLive = score.gameState === 'Live';
  const isFinished = score.gameState === 'Fulltime';
  const isUpcoming = score.gameState === 'Upcoming';

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-4 transform hover:scale-102 transition-all duration-300 ease-in-out cursor-pointer">
      <div className="flex justify-between items-start text-xs text-gray-400 mb-2">
        <span className="font-semibold text-emerald-400 uppercase">{score.sport}</span>
        <span className="font-medium">{score.league}</span>
      </div>

      <div className="flex items-center justify-between text-lg md:text-xl font-bold mb-3">
        {/* Home Team */}
        <Link to={getTeamPageLink(score.homeTeam, score.sport)} className="flex items-center flex-grow min-w-0 pr-2 group">
          <img
            src={`https://picsum.photos/30/30?random=${score.homeTeam.charCodeAt(0)}`}
            alt={`${score.homeTeam} logo`}
            className="w-8 h-8 rounded-full mr-3 border border-gray-600 bg-gray-900 flex-shrink-0"
          />
          <span className="truncate text-gray-100 group-hover:underline" title={score.homeTeam}>{score.homeTeam}</span>
        </Link>
        <span className="mx-2 text-3xl font-extrabold text-emerald-200">{score.homeScore}</span>
      </div>

      <div className="flex items-center justify-between text-lg md:text-xl font-bold mb-3">
        {/* Away Team */}
        <Link to={getTeamPageLink(score.awayTeam, score.sport)} className="flex items-center flex-grow min-w-0 pr-2 group">
          <img
            src={`https://picsum.photos/30/30?random=${score.awayTeam.charCodeAt(0) + 1}`}
            alt={`${score.awayTeam} logo`}
            className="w-8 h-8 rounded-full mr-3 border border-gray-600 bg-gray-900 flex-shrink-0"
          />
          <span className="truncate text-gray-100 group-hover:underline" title={score.awayTeam}>{score.awayTeam}</span>
        </Link>
        <span className="mx-2 text-3xl font-extrabold text-emerald-200">{score.awayScore}</span>
      </div>

      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-700 text-sm font-medium">
        <span className={`px-3 py-1 rounded-full text-white font-semibold ${
          isLive ? 'bg-red-600' : isFinished ? 'bg-green-600' : isUpcoming ? 'bg-blue-600' : 'bg-gray-600'
        }`}>
          {score.gameState}
        </span>
        <span className="text-gray-300">{score.gameTime}</span>
      </div>
    </div>
  );
};

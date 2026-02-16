
import React from 'react';
import { LeagueProfile } from '../types';
import { Link } from 'react-router-dom';
import { EXAMPLE_FOOTBALL_TEAMS, EXAMPLE_BASKETBALL_TEAMS } from '../constants';

interface LeagueDetailProps {
  league: LeagueProfile;
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

export const LeagueDetail: React.FC<LeagueDetailProps> = ({ league }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 mb-8">
        <img
          src={league.logoUrl || `https://picsum.photos/150/150?random=${league.id}`}
          alt={`${league.name} logo`}
          className="w-36 h-36 object-contain rounded-full border-4 border-emerald-500 bg-gray-900 p-2 mb-6 md:mb-0 shadow-md"
        />
        <div className="text-center md:text-left flex-grow">
          <h1 className="text-4xl font-extrabold text-emerald-400 mb-2">{league.name}</h1>
          <p className="text-xl text-gray-300 mb-4">
            {league.sport} • {league.country} • Current Season: {league.currentSeason}
          </p>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-700 pt-8">
        <h2 className="text-3xl font-bold text-emerald-400 mb-6 text-center">Teams</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-10">
          {league.teams.map((team) => (
            <Link to={getTeamPageLink(team.name, league.sport)} key={team.id} className="block">
              <div className="bg-gray-900 rounded-lg p-3 flex flex-col items-center space-y-2 hover:bg-gray-700 transition-colors duration-200">
                <img
                  src={team.logoUrl || `https://picsum.photos/60/60?random=${team.id.charCodeAt(0)}`}
                  alt={`${team.name} logo`}
                  className="w-14 h-14 object-contain rounded-full border border-emerald-600 bg-gray-800"
                />
                <p className="text-lg font-medium text-gray-100 text-center truncate w-full">{team.name}</p>
              </div>
            </Link>
          ))}
        </div>

        <h2 className="text-3xl font-bold text-emerald-400 mb-6 text-center">Current Standings</h2>
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-700">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Team
                </th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  W
                </th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  L
                </th>
                {league.standings[0]?.draws !== undefined && (
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    D
                  </th>
                )}
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Pts
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {league.standings.map((standing) => (
                <tr key={standing.team} className="hover:bg-gray-700">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                    {standing.rank}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200">
                    <Link to={getTeamPageLink(standing.team, league.sport)} className="hover:underline text-emerald-300">
                      {standing.team}
                    </Link>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-300">
                    {standing.wins}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-300">
                    {standing.losses}
                  </td>
                  {standing.draws !== undefined && (
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-300">
                      {standing.draws}
                    </td>
                  )}
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-center font-bold text-emerald-400">
                    {standing.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

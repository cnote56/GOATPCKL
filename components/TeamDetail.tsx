
import React, { useState, useEffect } from 'react';
import { TeamProfile } from '../types';
import { Link } from 'react-router-dom';
import { EXAMPLE_FOOTBALL_PLAYERS, EXAMPLE_BASKETBALL_PLAYERS } from '../constants';
import { addFavoriteTeam, removeFavoriteTeam, isFavoriteTeam } from '../utils/favorites';
import { useUser } from '../context/UserContext'; // Import useUser

interface TeamDetailProps {
  team: TeamProfile;
}

const getPlayerPageLink = (playerName: string, sport: string) => {
  if (sport === 'Football' && EXAMPLE_FOOTBALL_PLAYERS.includes(playerName)) {
    return `/player/${encodeURIComponent(playerName)}`;
  }
  if (sport === 'Basketball' && EXAMPLE_BASKETBALL_PLAYERS.includes(playerName)) {
    return `/player/${encodeURIComponent(playerName)}`;
  }
  return '#';
};

export const TeamDetail: React.FC<TeamDetailProps> = ({ team }) => {
  const { currentUser } = useUser(); // Get the current user
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    // Check if team is favorited for the current user
    setIsFavorited(isFavoriteTeam(currentUser.id, team.id));
  }, [team.id, currentUser.id]);

  const handleToggleFavorite = () => {
    if (isFavorited) {
      removeFavoriteTeam(currentUser.id, team.id);
    } else {
      addFavoriteTeam(currentUser.id, team.id);
    }
    setIsFavorited(!isFavorited);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 mb-8">
        <img
          src={team.logoUrl || `https://picsum.photos/150/150?random=${team.id}`}
          alt={`${team.name} logo`}
          className="w-36 h-36 object-contain rounded-full border-4 border-emerald-500 bg-gray-900 p-2 mb-6 md:mb-0 shadow-md"
        />
        <div className="text-center md:text-left flex-grow">
          <div className="flex items-center justify-center md:justify-start mb-2">
            <h1 className="text-4xl font-extrabold text-emerald-400 mr-4">{team.name}</h1>
            <button
              onClick={handleToggleFavorite}
              aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-8 w-8 ${isFavorited ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.817 2.033a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.817-2.033a1 1 0 00-1.175 0l-2.817 2.033c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          </div>
          <p className="text-xl text-gray-300 mb-4">
            {team.sport} •{' '}
            <Link to={`/league/${encodeURIComponent(team.league)}`} className="hover:underline text-emerald-300">
              {team.league}
            </Link>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-gray-400 mb-6">
            <div>
              <span className="block font-semibold">Wins:</span>
              <span className="text-lg">{team.wins}</span>
            </div>
            <div>
              <span className="block font-semibold">Losses:</span>
              <span className="text-lg">{team.losses}</span>
            </div>
            {team.draws !== undefined && (
              <div>
                <span className="block font-semibold">Draws:</span>
                <span className="text-lg">{team.draws}</span>
              </div>
            )}
            <div>
              <span className="block font-semibold">Points:</span>
              <span className="text-lg">{team.points}</span>
            </div>
          </div>
          <p className="text-gray-300 leading-relaxed">
            <span className="font-semibold">Coach:</span> {team.coach} <br />
            <span className="font-semibold">Stadium:</span> {team.stadium}
          </p>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-700 pt-8">
        <h2 className="text-3xl font-bold text-emerald-400 mb-6 text-center">Key Players</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.members.map((member) => (
            <Link to={getPlayerPageLink(member.name, team.sport)} key={member.id} className="block">
              <div className="bg-gray-900 rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-700 transition-colors duration-200">
                <img
                  src={`https://picsum.photos/60/60?random=${member.id.charCodeAt(0)}`}
                  alt={`${member.name}`}
                  className="w-16 h-16 object-cover rounded-full border-2 border-emerald-500"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-100">{member.name}</h3>
                  <p className="text-gray-400 text-sm">
                    {member.position} {member.jerseyNumber ? `(#${member.jerseyNumber})` : ''}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};


import React, { useState, useEffect, useCallback } from 'react';
import { getFavoritePlayers, getFavoriteTeams } from '../utils/favorites';
import { geminiService } from '../services/geminiService';
import { PlayerProfile, TeamProfile, QueryStatus } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { Link } from 'react-router-dom';
import { removeFavoritePlayer, removeFavoriteTeam } from '../utils/favorites';
import { useUser } from '../context/UserContext';

export const MyWatchlistPage: React.FC = () => {
  const { currentUser } = useUser();
  const [favoritePlayers, setFavoritePlayers] = useState<PlayerProfile[]>([]);
  const [favoriteTeams, setFavoriteTeams] = useState<TeamProfile[]>([]);
  const [playerStatus, setPlayerStatus] = useState<QueryStatus>('idle');
  const [teamStatus, setTeamStatus] = useState<QueryStatus>('idle');
  const [playerErrors, setPlayerErrors] = useState<Record<string, string | null>>({});
  const [teamErrors, setTeamErrors] = useState<Record<string, string | null>>({});

  const fetchFavorites = useCallback(async () => {
    // Fetch Favorite Players
    setPlayerStatus('loading');
    const playerIds = getFavoritePlayers(currentUser.id);
    const playerPromises = playerIds.map(async (id) => {
      try {
        const playerProfile = await geminiService.getPlayerProfile(id);
        setPlayerErrors(prev => ({ ...prev, [id]: null }));
        return playerProfile;
      } catch (err) {
        console.error(`Failed to fetch player profile for ID ${id}:`, err);
        setPlayerErrors(prev => ({ ...prev, [id]: `Failed to load ${id}` }));
        return null;
      }
    });
    const fetchedPlayers = (await Promise.all(playerPromises)).filter((p): p is PlayerProfile => p !== null);
    setFavoritePlayers(fetchedPlayers);
    setPlayerStatus('success');

    // Fetch Favorite Teams
    setTeamStatus('loading');
    const teamIds = getFavoriteTeams(currentUser.id);
    const teamPromises = teamIds.map(async (id) => {
      try {
        const teamProfile = await geminiService.getTeamProfile(id);
        setTeamErrors(prev => ({ ...prev, [id]: null }));
        return teamProfile;
      } catch (err) {
        console.error(`Failed to fetch team profile for ID ${id}:`, err);
        setTeamErrors(prev => ({ ...prev, [id]: `Failed to load ${id}` }));
        return null;
      }
    });
    const fetchedTeams = (await Promise.all(teamPromises)).filter((t): t is TeamProfile => t !== null);
    setFavoriteTeams(fetchedTeams);
    setTeamStatus('success');
  }, [currentUser.id]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemovePlayer = (id: string) => {
    removeFavoritePlayer(currentUser.id, id);
    setFavoritePlayers(prev => prev.filter(p => p.id !== id));
    setPlayerErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleRemoveTeam = (id: string) => {
    removeFavoriteTeam(currentUser.id, id);
    setFavoriteTeams(prev => prev.filter(t => t.id !== id));
    setTeamErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const isLoading = playerStatus === 'loading' || teamStatus === 'loading';
  const hasErrors = Object.keys(playerErrors).some(key => playerErrors[key] !== null) || Object.keys(teamErrors).some(key => teamErrors[key] !== null);
  const noFavorites = !isLoading && favoritePlayers.length === 0 && favoriteTeams.length === 0 && !hasErrors;

  return (
    <div className="p-4 bg-secondary rounded-lg shadow-xl">
      <h1 className="text-2xl font-extrabold text-center text-accent mb-6">My Watchlist</h1>

      {isLoading && <LoadingSpinner />}

      {noFavorites && (
        <p className="text-center text-secondary text-xl py-10">
          You haven't added any favorite players or teams yet.
          <br />
          Visit player or team pages to add them to your watchlist!
        </p>
      )}

      {hasErrors && (
        <div className="mb-8">
          <ErrorDisplay message="Some favorites could not be loaded." onRetry={fetchFavorites} />
        </div>
      )}

      {favoritePlayers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-accent mb-4 border-b border-border pb-2">Favorite Players</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoritePlayers.map(player => (
              <div key={player.id} className="bg-tertiary rounded-lg shadow-md p-3 flex items-center space-x-3 hover-bg-secondary">
                <Link to={`/player/${encodeURIComponent(player.name)}`} className="flex items-center space-x-3 flex-grow">
                  <img
                    src={player.imageUrl || `https://picsum.photos/50/50?random=${player.id}`}
                    alt={`${player.name}`}
                    className="w-12 h-12 object-cover rounded-full border-2 border-accent"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-primary">{player.name}</h3>
                    <p className="text-secondary text-sm">{player.team} • {player.sport}</p>
                  </div>
                </Link>
                <button
                  onClick={() => handleRemovePlayer(player.id)}
                  aria-label={`Remove ${player.name} from favorites`}
                  className="p-2 rounded-full hover:bg-red-700 text-red-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {favoriteTeams.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-accent mb-4 border-b border-border pb-2">Favorite Teams</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteTeams.map(team => (
              <div key={team.id} className="bg-tertiary rounded-lg shadow-md p-3 flex items-center space-x-3 hover-bg-secondary">
                <Link to={`/team/${encodeURIComponent(team.name)}`} className="flex items-center space-x-3 flex-grow">
                  <img
                    src={team.logoUrl || `https://picsum.photos/50/50?random=${team.id}`}
                    alt={`${team.name} logo`}
                    className="w-12 h-12 object-contain rounded-full border-2 border-accent bg-secondary"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-primary">{team.name}</h3>
                    <p className="text-secondary text-sm">{team.sport} • {team.league}</p>
                  </div>
                </Link>
                <button
                  onClick={() => handleRemoveTeam(team.id)}
                  aria-label={`Remove ${team.name} from favorites`}
                  className="p-2 rounded-full hover:bg-red-700 text-red-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
    
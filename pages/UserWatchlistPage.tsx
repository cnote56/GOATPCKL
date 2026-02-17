
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFavoritePlayers, getFavoriteTeams } from '../utils/favorites';
import { geminiService } from '../services/geminiService';
import { PlayerProfile, TeamProfile, QueryStatus } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { useUser } from '../context/UserContext';

export const UserWatchlistPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { availableUsers, currentUser } = useUser();
  const targetUser = availableUsers.find(u => u.id === userId);

  const [favoritePlayers, setFavoritePlayers] = useState<PlayerProfile[]>([]);
  const [favoriteTeams, setFavoriteTeams] = useState<TeamProfile[]>([]);
  const [playerStatus, setPlayerStatus] = useState<QueryStatus>('idle');
  const [teamStatus, setTeamStatus] = useState<QueryStatus>('idle');
  const [playerErrors, setPlayerErrors] = useState<Record<string, string | null>>({});
  const [teamErrors, setTeamErrors] = useState<Record<string, string | null>>({});

  const fetchFavorites = useCallback(async (targetUserId: string) => {
    // Fetch Favorite Players
    setPlayerStatus('loading');
    const playerIds = getFavoritePlayers(targetUserId);
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
    const teamIds = getFavoriteTeams(targetUserId);
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
  }, []);

  useEffect(() => {
    if (userId) {
      fetchFavorites(userId);
    }
  }, [userId, fetchFavorites]);

  const handleRetry = () => {
    if (userId) {
      fetchFavorites(userId);
    }
  };

  if (!targetUser) {
    return <ErrorDisplay message="User not found." />;
  }

  const isLoading = playerStatus === 'loading' || teamStatus === 'loading';
  const hasErrors = Object.keys(playerErrors).some(key => playerErrors[key] !== null) || Object.keys(teamErrors).some(key => teamErrors[key] !== null);
  const noFavorites = !isLoading && favoritePlayers.length === 0 && favoriteTeams.length === 0 && !hasErrors;

  return (
    <div className="p-4 bg-secondary rounded-lg shadow-xl">
      <h1 className="text-2xl font-extrabold text-center text-accent mb-6">
        {targetUser.id === currentUser.id ? "My Watchlist" : `${targetUser.name}'s Watchlist`}
      </h1>

      {isLoading && <LoadingSpinner />}

      {noFavorites && (
        <p className="text-center text-secondary text-xl py-10">
          {targetUser.id === currentUser.id
            ? "You haven't added any favorite players or teams yet."
            : `${targetUser.name} hasn't added any favorite players or teams yet.`}
        </p>
      )}

      {hasErrors && (
        <div className="mb-8">
          <ErrorDisplay message="Some favorites could not be loaded." onRetry={handleRetry} />
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
    
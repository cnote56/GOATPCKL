
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getFollowing, addFollowing, removeFollowing, isFollowing, getFollowers } from '../utils/social';
import { getFavoritePlayers, getFavoriteTeams, getFollowedGames } from '../utils/favorites';
import { PlayerProfile, TeamProfile, Score, QueryStatus } from '../types';
import { geminiService } from '../services/geminiService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';

export const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { currentUser, availableUsers, switchUser } = useUser();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(currentUser);
  const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(true);
  const [isFollowingUser, setIsFollowingUser] = useState(false);

  const [favoritePlayers, setFavoritePlayers] = useState<PlayerProfile[]>([]);
  const [favoriteTeams, setFavoriteTeams] = useState<TeamProfile[]>([]);
  const [followedGames, setFollowedGames] = useState<Score[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [dataStatus, setDataStatus] = useState<QueryStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Determine which user's profile to display
  useEffect(() => {
    if (userId && userId !== currentUser.id) {
      const targetUser = availableUsers.find(u => u.id === userId);
      if (targetUser) {
        setProfileUser(targetUser);
        setIsCurrentUserProfile(false);
      } else {
        setError("User not found.");
        setDataStatus('error');
        setProfileUser(currentUser); // Fallback to current user
        setIsCurrentUserProfile(true);
      }
    } else {
      setProfileUser(currentUser);
      setIsCurrentUserProfile(true);
    }
  }, [userId, currentUser, availableUsers]);

  // Fetch social and favorite data
  const fetchProfileData = useCallback(async (targetUserId: string) => {
    setDataStatus('loading');
    setError(null);

    try {
      // Social counts
      setFollowersCount(getFollowers(targetUserId).length);
      setFollowingCount(getFollowing(targetUserId).length);
      setIsFollowingUser(isFollowing(currentUser.id, targetUserId));

      // Favorites (Player & Team)
      const playerIds = getFavoritePlayers(targetUserId);
      const teamIds = getFavoriteTeams(targetUserId);
      const gameIds = getFollowedGames(targetUserId);

      const [fetchedPlayers, fetchedTeams, fetchedGames] = await Promise.all([
        Promise.all(playerIds.map(async (id) => {
          try { return await geminiService.getPlayerProfile(id); } catch { return null; }
        })),
        Promise.all(teamIds.map(async (id) => {
          try { return await geminiService.getTeamProfile(id); } catch { return null; }
        })),
        Promise.all(gameIds.map(async (id) => {
            try {
                const scores = await geminiService.getLiveScores(undefined, undefined, undefined, id);
                return scores.find(s => s.gameId === id);
            } catch {
                return null;
            }
        }))
      ]);

      setFavoritePlayers(fetchedPlayers.filter((p): p is PlayerProfile => p !== null));
      setFavoriteTeams(fetchedTeams.filter((t): t is TeamProfile => t !== null));
      setFollowedGames(fetchedGames.filter((g): g is Score => g !== null));

      setDataStatus('success');
    } catch (err) {
      console.error("Failed to fetch user profile data:", err);
      setError("Failed to load user data. Please try again.");
      setDataStatus('error');
    }
  }, [currentUser.id]);

  useEffect(() => {
    if (profileUser) {
      fetchProfileData(profileUser.id);
    }
  }, [profileUser, fetchProfileData]);

  const handleToggleFollow = () => {
    if (!profileUser) return;
    if (isFollowingUser) {
      removeFollowing(currentUser.id, profileUser.id);
    } else {
      addFollowing(currentUser.id, profileUser.id);
    }
    setIsFollowingUser(prev => !prev);
    // Optimistically update followers count for the followed user
    setFollowersCount(prev => isFollowingUser ? prev - 1 : prev + 1);
  };

  const handleRetry = () => {
    if (profileUser) {
      fetchProfileData(profileUser.id);
    }
  };

  if (dataStatus === 'loading') {
    return <LoadingSpinner />;
  }

  if (dataStatus === 'error') {
    return <ErrorDisplay message={error || "Could not load profile."} onRetry={handleRetry} />;
  }

  if (!profileUser) {
    return <ErrorDisplay message="No user profile to display." />;
  }

  return (
    <div className="p-4 bg-secondary rounded-lg shadow-xl">
      <div className="flex flex-col items-center md:flex-row md:items-start md:space-x-8 mb-8 pb-8 border-b border-border">
        <img
          src={`https://picsum.photos/150/150?random=${profileUser.id.charCodeAt(0)}`}
          alt={`${profileUser.name}'s avatar`}
          className="w-36 h-36 object-cover rounded-full border-4 border-accent mb-6 md:mb-0 shadow-md"
        />
        <div className="text-center md:text-left flex-grow">
          <h1 className="text-3xl font-extrabold text-accent mb-2">{profileUser.name}</h1>
          <p className="text-lg text-secondary mb-4">@{profileUser.id}</p>
          <div className="flex justify-center md:justify-start space-x-6 text-primary mb-6">
            <div>
              <span className="block font-semibold text-xl">{followersCount}</span>
              <span className="text-sm text-secondary">Followers</span>
            </div>
            <div>
              <span className="block font-semibold text-xl">{followingCount}</span>
              <span className="text-sm text-secondary">Following</span>
            </div>
          </div>
          {!isCurrentUserProfile && (
            <button
              onClick={handleToggleFollow}
              className={`px-6 py-2 rounded-full font-bold transition-colors duration-200
                ${isFollowingUser ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-accent hover:bg-emerald-700 text-primary'}`}
            >
              {isFollowingUser ? 'Unfollow' : 'Follow'}
            </button>
          )}
          {isCurrentUserProfile && (
            <button
              onClick={() => console.log('Edit Profile')} // Placeholder for future edit profile functionality
              className="px-6 py-2 rounded-full font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div>
          <h2 className="text-2xl font-bold text-accent mb-4 border-b border-border pb-2">
            Favorite Teams
            {!isCurrentUserProfile && (
                <Link to={`/users/${profileUser.id}/watchlist`} className="ml-2 text-sm text-link hover:underline">
                    (View all)
                </Link>
            )}
          </h2>
          {favoriteTeams.length === 0 ? (
            <p className="text-secondary italic">No favorite teams.</p>
          ) : (
            <ul className="space-y-3">
              {favoriteTeams.slice(0, 3).map(team => ( // Show top 3
                <li key={team.id} className="flex items-center space-x-3 bg-tertiary p-3 rounded-lg hover-bg-secondary">
                  <img
                    src={team.logoUrl || `https://picsum.photos/40/40?random=${team.id.charCodeAt(0)}`}
                    alt={`${team.name} logo`}
                    className="w-8 h-8 object-contain rounded-full border border-border"
                  />
                  <Link to={`/team/${encodeURIComponent(team.name)}`} className="text-primary font-medium hover:underline">
                    {team.name} ({team.sport})
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-accent mb-4 border-b border-border pb-2">
            Favorite Players
            {!isCurrentUserProfile && (
                <Link to={`/users/${profileUser.id}/watchlist`} className="ml-2 text-sm text-link hover:underline">
                    (View all)
                </Link>
            )}
          </h2>
          {favoritePlayers.length === 0 ? (
            <p className="text-secondary italic">No favorite players.</p>
          ) : (
            <ul className="space-y-3">
              {favoritePlayers.slice(0, 3).map(player => ( // Show top 3
                <li key={player.id} className="flex items-center space-x-3 bg-tertiary p-3 rounded-lg hover-bg-secondary">
                  <img
                    src={player.imageUrl || `https://picsum.photos/40/40?random=${player.id.charCodeAt(0)}`}
                    alt={`${player.name} avatar`}
                    className="w-8 h-8 object-cover rounded-full border border-border"
                  />
                  <Link to={`/player/${encodeURIComponent(player.name)}`} className="text-primary font-medium hover:underline">
                    {player.name} ({player.team})
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-accent mb-4 border-b border-border pb-2">
            Followed Games
            {!isCurrentUserProfile && (
                <Link to={`/users/${profileUser.id}/scoreboard`} className="ml-2 text-sm text-link hover:underline">
                    (View all)
                </Link>
            )}
        </h2>
        {followedGames.length === 0 ? (
          <p className="text-secondary italic">No games followed.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {followedGames.slice(0, 3).map(game => ( // Show top 3
                <div key={game.gameId} className="bg-tertiary rounded-lg p-3">
                    <p className="text-primary font-semibold">{game.homeTeam} vs {game.awayTeam}</p>
                    <p className="text-secondary text-sm">{game.league} - {game.gameState}</p>
                    <p className="text-secondary text-xs">{game.date} {game.gameTime}</p>
                </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
    
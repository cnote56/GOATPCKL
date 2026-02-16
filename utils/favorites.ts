
// Keys for localStorage
const getPlayerKey = (userId: string) => `urscorecard_user_${userId}_favorite_players`;
const getTeamKey = (userId: string) => `urscorecard_user_${userId}_favorite_teams`;
const getFollowedGamesKey = (userId: string) => `urscorecard_user_${userId}_followed_games`; // New key for followed games

// --- Player Favorites ---

export const getFavoritePlayers = (userId: string): string[] => {
  try {
    const players = localStorage.getItem(getPlayerKey(userId));
    return players ? JSON.parse(players) : [];
  } catch (error) {
    console.error(`Error reading favorite players for user ${userId} from localStorage:`, error);
    return [];
  }
};

export const addFavoritePlayer = (userId: string, playerId: string): void => {
  try {
    const players = getFavoritePlayers(userId);
    if (!players.includes(playerId)) {
      localStorage.setItem(getPlayerKey(userId), JSON.stringify([...players, playerId]));
    }
  } catch (error) {
    console.error(`Error adding favorite player for user ${userId} to localStorage:`, error);
  }
};

export const removeFavoritePlayer = (userId: string, playerId: string): void => {
  try {
    const players = getFavoritePlayers(userId);
    const updatedPlayers = players.filter(id => id !== playerId);
    localStorage.setItem(getPlayerKey(userId), JSON.stringify(updatedPlayers));
  } catch (error) {
    console.error(`Error removing favorite player for user ${userId} from localStorage:`, error);
  }
};

export const isFavoritePlayer = (userId: string, playerId: string): boolean => {
  const players = getFavoritePlayers(userId);
  return players.includes(playerId);
};

// --- Team Favorites ---

export const getFavoriteTeams = (userId: string): string[] => {
  try {
    const teams = localStorage.getItem(getTeamKey(userId));
    return teams ? JSON.parse(teams) : [];
  } catch (error) {
    console.error(`Error reading favorite teams for user ${userId} from localStorage:`, error);
    return [];
  }
};

export const addFavoriteTeam = (userId: string, teamId: string): void => {
  try {
    const teams = getFavoriteTeams(userId);
    if (!teams.includes(teamId)) {
      localStorage.setItem(getTeamKey(userId), JSON.stringify([...teams, teamId]));
    }
  } catch (error) {
    console.error(`Error adding favorite team for user ${userId} to localStorage:`, error);
  }
};

export const removeFavoriteTeam = (userId: string, teamId: string): void => {
  try {
    const teams = getFavoriteTeams(userId);
    const updatedTeams = teams.filter(id => id !== teamId);
    localStorage.setItem(getTeamKey(userId), JSON.stringify(updatedTeams));
  } catch (error) {
    console.error(`Error removing favorite team for user ${userId} from localStorage:`, error);
  }
};

export const isFavoriteTeam = (userId: string, teamId: string): boolean => {
  const teams = getFavoriteTeams(userId);
  return teams.includes(teamId);
};

// --- Followed Games ---

export const getFollowedGames = (userId: string): string[] => {
  try {
    const games = localStorage.getItem(getFollowedGamesKey(userId));
    return games ? JSON.parse(games) : [];
  } catch (error) {
    console.error(`Error reading followed games for user ${userId} from localStorage:`, error);
    return [];
  }
};

export const addFollowedGame = (userId: string, gameId: string): void => {
  try {
    const games = getFollowedGames(userId);
    if (!games.includes(gameId)) {
      localStorage.setItem(getFollowedGamesKey(userId), JSON.stringify([...games, gameId]));
    }
  } catch (error) {
    console.error(`Error adding followed game for user ${userId} to localStorage:`, error);
  }
};

export const removeFollowedGame = (userId: string, gameId: string): void => {
  try {
    const games = getFollowedGames(userId);
    const updatedGames = games.filter(id => id !== gameId);
    localStorage.setItem(getFollowedGamesKey(userId), JSON.stringify(updatedGames));
  } catch (error) {
    console.error(`Error removing followed game for user ${userId} from localStorage:`, error);
  }
};

export const isFollowedGame = (userId: string, gameId: string): boolean => {
  const games = getFollowedGames(userId);
  return games.includes(gameId);
};

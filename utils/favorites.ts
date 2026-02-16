
// Keys for localStorage
const FAVORITE_PLAYERS_KEY = 'urscorecard_favorite_players';
const FAVORITE_TEAMS_KEY = 'urscorecard_favorite_teams';

// --- Player Favorites ---

export const getFavoritePlayers = (): string[] => {
  try {
    const players = localStorage.getItem(FAVORITE_PLAYERS_KEY);
    return players ? JSON.parse(players) : [];
  } catch (error) {
    console.error("Error reading favorite players from localStorage:", error);
    return [];
  }
};

export const addFavoritePlayer = (playerId: string): void => {
  try {
    const players = getFavoritePlayers();
    if (!players.includes(playerId)) {
      localStorage.setItem(FAVORITE_PLAYERS_KEY, JSON.stringify([...players, playerId]));
    }
  } catch (error) {
    console.error("Error adding favorite player to localStorage:", error);
  }
};

export const removeFavoritePlayer = (playerId: string): void => {
  try {
    const players = getFavoritePlayers();
    const updatedPlayers = players.filter(id => id !== playerId);
    localStorage.setItem(FAVORITE_PLAYERS_KEY, JSON.stringify(updatedPlayers));
  } catch (error) {
    console.error("Error removing favorite player from localStorage:", error);
  }
};

export const isFavoritePlayer = (playerId: string): boolean => {
  const players = getFavoritePlayers();
  return players.includes(playerId);
};

// --- Team Favorites ---

export const getFavoriteTeams = (): string[] => {
  try {
    const teams = localStorage.getItem(FAVORITE_TEAMS_KEY);
    return teams ? JSON.parse(teams) : [];
  } catch (error) {
    console.error("Error reading favorite teams from localStorage:", error);
    return [];
  }
};

export const addFavoriteTeam = (teamId: string): void => {
  try {
    const teams = getFavoriteTeams();
    if (!teams.includes(teamId)) {
      localStorage.setItem(FAVORITE_TEAMS_KEY, JSON.stringify([...teams, teamId]));
    }
  } catch (error) {
    console.error("Error adding favorite team to localStorage:", error);
  }
};

export const removeFavoriteTeam = (teamId: string): void => {
  try {
    const teams = getFavoriteTeams();
    const updatedTeams = teams.filter(id => id !== teamId);
    localStorage.setItem(FAVORITE_TEAMS_KEY, JSON.stringify(updatedTeams));
  } catch (error) {
    console.error("Error removing favorite team from localStorage:", error);
  }
};

export const isFavoriteTeam = (teamId: string): boolean => {
  const teams = getFavoriteTeams();
  return teams.includes(teamId);
};
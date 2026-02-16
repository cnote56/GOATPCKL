
// --- Core Data Interfaces ---

export interface Score {
  gameId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  gameState: string; // e.g., "Live", "Halftime", "Fulltime", "Upcoming"
  gameTime: string; // e.g., "12:30 PM", "FT", "Tomorrow 7 PM"
  league: string;
  date: string; // YYYY-MM-DD for grouping
}

export interface PlayerStat {
  season: string;
  pointsPerGame: number;
  assistsPerGame: number;
  reboundsPerGame: number;
  gamesPlayed: number;
  // Add more stats as needed for specific sports
}

export interface PlayerProfile {
  id: string;
  name: string;
  team: string;
  sport: string;
  position: string;
  age: number;
  nationality: string;
  stats: PlayerStat[];
  bio: string;
  imageUrl: string;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  jerseyNumber?: number;
}

export interface TeamProfile {
  id: string;
  name: string;
  sport: string;
  league: string;
  wins: number;
  losses: number;
  draws?: number;
  points: number;
  members: TeamMember[];
  coach: string;
  stadium: string;
  logoUrl: string;
}

export interface LeagueStanding {
  team: string;
  wins: number;
  losses: number;
  draws?: number;
  points: number;
  rank: number;
}

export interface LeagueProfile {
  id: string;
  name: string;
  sport: string;
  country: string;
  currentSeason: string;
  teams: { id: string; name: string; logoUrl: string }[];
  standings: LeagueStanding[];
  logoUrl: string;
}

// --- API Response Types (for Gemini) ---

export interface GeminiResponse<T> {
  data?: T;
  error?: string;
}

export interface GroundingLink {
  uri: string;
  title?: string;
}

export interface SearchResult {
  answer: string;
  groundingLinks?: GroundingLink[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  groundingLinks?: GroundingLink[];
}

// --- Utility Types ---

export enum Sport {
  FOOTBALL = 'Football',
  BASKETBALL = 'Basketball',
  TENNIS = 'Tennis',
  HOCKEY = 'Hockey',
}

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';

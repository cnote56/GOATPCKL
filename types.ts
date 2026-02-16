
// --- Core Data Interfaces ---

export interface Score {
  gameId?: string; // Made optional for loading state
  sport?: string; // Made optional for loading state
  homeTeam?: string; // Made optional for loading state
  awayTeam?: string; // Made optional for loading state
  homeScore?: number; // Made optional for loading state
  awayScore?: number; // Made optional for loading state
  gameState?: string; // Made optional for loading state
  gameTime?: string; // Made optional for loading state
  league?: string; // Made optional for loading state
  date?: string; // YYYY-MM-DD for grouping // Made optional for loading state
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

// New interface for betting odds
export interface Odds {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  overUnder: number; // Total points/goals
  spread: number;    // E.g., -7.5 for home team, +7.5 for away team
  moneylineHome: number; // Odds for home team to win (e.g., -150)
  moneylineAway: number; // Odds for away team to win (e.g., +130)
  moneylineDraw?: number; // Optional for sports with draws
  lastUpdated: string; // Timestamp
}

export interface NewsArticle {
  title: string;
  summary: string;
  source: string;
  date: string; // YYYY-MM-DD
  imageUrl?: string;
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

// Updated SearchResult to include optional suggestedAction
export interface SearchResult {
  answer: string;
  groundingLinks?: GroundingLink[];
  suggestedAction?: {
    type: 'followTeam' | 'followGame';
    id: string;
    name: string; // Name to display for the action (e.g., Team Name or Game Description)
    homeTeam?: string; // Only for followGame
    awayTeam?: string; // Only for followGame
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  groundingLinks?: GroundingLink[];
  suggestedAction?: {
    type: 'followTeam' | 'followGame';
    id: string;
    name: string;
    homeTeam?: string; // Only for followGame
    awayTeam?: string; // Only for followGame
  };
}

// --- Utility Types ---

export enum Sport {
  FOOTBALL = 'Football',
  BASKETBALL = 'Basketball',
  TENNIS = 'Tennis',
  HOCKEY = 'Hockey',
  RUGBY = 'Rugby', // Added Rugby
  FOOTY = 'Footy', // Added Australian rules football (Footy)
  SOCCER = 'Soccer', // Added Soccer for header nav
  BASEBALL = 'Baseball', // Added Baseball for header nav
  GOLF = 'Golf', // Added Golf for header nav
  SNOOKER = 'Snooker', // Added Snooker for header nav
  VOLLEYBALL = 'Volleyball' // Removed trailing comma here
}

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';

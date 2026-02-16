
import { Sport } from './types';

export const EXAMPLE_SPORTS: Sport[] = [
  Sport.FOOTBALL,
  Sport.BASKETBALL,
  Sport.TENNIS,
  Sport.HOCKEY,
];

export const EXAMPLE_FOOTBALL_TEAMS: string[] = [
  'Real Madrid', 'FC Barcelona', 'Manchester United', 'Liverpool FC', 'Bayern Munich',
  'Paris Saint-Germain', 'Juventus', 'AC Milan', 'Inter Milan', 'Arsenal FC'
];

export const EXAMPLE_BASKETBALL_TEAMS: string[] = [
  'Los Angeles Lakers', 'Golden State Warriors', 'Boston Celtics', 'Chicago Bulls', 'Miami Heat',
  'Brooklyn Nets', 'Milwaukee Bucks', 'Phoenix Suns', 'Denver Nuggets', 'Philadelphia 76ers'
];

export const EXAMPLE_FOOTBALL_PLAYERS: string[] = [
  'Lionel Messi', 'Cristiano Ronaldo', 'Kylian Mbappé', 'Erling Haaland', 'Robert Lewandowski',
  'Kevin De Bruyne', 'Mohamed Salah', 'Vinicius Jr.', 'Jude Bellingham', 'Harry Kane'
];

export const EXAMPLE_BASKETBALL_PLAYERS: string[] = [
  'LeBron James', 'Stephen Curry', 'Nikola Jokic', 'Giannis Antetokounmpo', 'Joel Embiid',
  'Luka Doncic', 'Kevin Durant', 'Jayson Tatum', 'Devin Booker', 'Shai Gilgeous-Alexander'
];

export const EXAMPLE_LEAGUES: string[] = [
  'La Liga', 'Premier League', 'NBA', 'Serie A', 'Bundesliga', 'Ligue 1'
];

export const API_KEY = process.env.API_KEY;

export const GEMINI_MODEL_TEXT = 'gemini-3-flash-preview';
export const GEMINI_MODEL_IMAGE = 'gemini-2.5-flash-image';
export const GEMINI_MODEL_CHAT = 'gemini-3-pro-preview';

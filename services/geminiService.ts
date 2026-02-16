
import { GoogleGenAI, Type, GenerateContentResponse, GroundingChunk, Chat } from "@google/genai";
import { API_KEY, GEMINI_MODEL_TEXT, GEMINI_MODEL_CHAT } from '../constants';
import {
  Score,
  PlayerProfile,
  TeamProfile,
  LeagueProfile,
  SearchResult,
  GroundingLink,
  Odds,
} from '../types';

if (!API_KEY) {
  console.warn("API_KEY is not defined. Gemini API calls will fail.");
}

const getGeminiInstance = () => {
  if (!API_KEY) {
    throw new Error("Gemini API Key is not configured.");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

async function generateContentWithSchema<T>(
  prompt: string,
  schema: { type: Type; items?: any; properties?: any; propertyOrdering?: string[] }
): Promise<T | undefined> {
  try {
    const ai = getGeminiInstance();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) {
      console.error("Gemini response was empty or not text.");
      return undefined;
    }

    // Attempt to parse JSON. Gemini might wrap it in markdown code block.
    let cleanJsonStr = jsonStr;
    if (jsonStr.startsWith("```json") && jsonStr.endsWith("```")) {
      cleanJsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
    }

    const parsedData: T = JSON.parse(cleanJsonStr);
    return parsedData;

  } catch (error) {
    console.error("Error generating content with schema from Gemini:", error);
    // Attempt to extract more specific error message from the Gemini response structure if available
    if (error instanceof Error) {
      console.error("Gemini API Error:", error.message);
    }
    return undefined;
  }
}

// Helper to extract grounding links
const extractGroundingLinks = (response: GenerateContentResponse): GroundingLink[] => {
  const groundingLinks: GroundingLink[] = [];
  if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
    for (const chunk of response.candidates[0].groundingMetadata.groundingChunks) {
      if (chunk.web?.uri) {
        groundingLinks.push({ uri: chunk.web.uri, title: chunk.web.title });
      }
    }
  }
  return groundingLinks;
};


export const geminiService = {
  getLiveScores: async (sport?: string, teamName?: string, playerName?: string, gameId?: string): Promise<Score[]> => {
    let prompt = `Generate a JSON array of 5-7 live or upcoming sports scores for popular leagues. Ensure a mix of game states (Live, Halftime, Fulltime, Upcoming). Provide realistic team names, scores, and times. Include unique game IDs.`;

    if (sport) {
      prompt += ` Specifically for ${sport}.`;
    }
    if (teamName) {
      prompt += ` Focus on games involving the team "${teamName}".`;
    }
    if (playerName) {
      prompt += ` Focus on games involving the player "${playerName}".`;
    }
    if (gameId) {
      // If a specific gameId is requested, try to ensure at least one score matches
      prompt += ` Ensure at least one game has the ID "${gameId}". If team names are available, ensure that game involves them (e.g., if gameId is for Real Madrid vs Barcelona, make sure that game is present).`;
    }
    prompt += ` Include the date of the game in YYYY-MM-DD format.`;


    const scoreSchema = {
      type: Type.OBJECT,
      properties: {
        gameId: { type: Type.STRING },
        sport: { type: Type.STRING },
        homeTeam: { type: Type.STRING },
        awayTeam: { type: Type.STRING },
        homeScore: { type: Type.NUMBER },
        awayScore: { type: Type.NUMBER },
        gameState: { type: Type.STRING },
        gameTime: { type: Type.STRING },
        league: { type: Type.STRING },
        date: { type: Type.STRING, description: 'YYYY-MM-DD' },
      },
      required: ['gameId', 'sport', 'homeTeam', 'awayTeam', 'homeScore', 'awayScore', 'gameState', 'gameTime', 'league', 'date'],
      propertyOrdering: ['gameId', 'sport', 'homeTeam', 'awayTeam', 'homeScore', 'awayScore', 'gameState', 'gameTime', 'league', 'date'],
    };

    const arraySchema = {
      type: Type.ARRAY,
      items: scoreSchema,
    };

    const scores = await generateContentWithSchema<Score[]>(prompt, arraySchema);
    return scores || [];
  },

  getPlayerProfile: async (playerName: string): Promise<PlayerProfile | undefined> => {
    const prompt = `Generate a detailed JSON profile for a popular sports player named ${playerName}, including their team, sport, position, age, nationality, a short bio, and realistic career statistics (points per game, assists per game, rebounds per game, games played) for the past 3 seasons. Include a placeholder image URL from picsum.photos.`;

    const playerStatSchema = {
      type: Type.OBJECT,
      properties: {
        season: { type: Type.STRING },
        pointsPerGame: { type: Type.NUMBER },
        assistsPerGame: { type: Type.NUMBER },
        reboundsPerGame: { type: Type.NUMBER },
        gamesPlayed: { type: Type.NUMBER },
      },
      required: ['season', 'pointsPerGame', 'assistsPerGame', 'reboundsPerGame', 'gamesPlayed'],
      propertyOrdering: ['season', 'pointsPerGame', 'assistsPerGame', 'reboundsPerGame', 'gamesPlayed'],
    };

    const playerProfileSchema = {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        team: { type: Type.STRING },
        sport: { type: Type.STRING },
        position: { type: Type.STRING },
        age: { type: Type.NUMBER },
        nationality: { type: Type.STRING },
        stats: { type: Type.ARRAY, items: playerStatSchema },
        bio: { type: Type.STRING },
        imageUrl: { type: Type.STRING, description: 'URL for player image' },
      },
      required: ['id', 'name', 'team', 'sport', 'position', 'age', 'nationality', 'stats', 'bio', 'imageUrl'],
      propertyOrdering: ['id', 'name', 'team', 'sport', 'position', 'age', 'nationality', 'stats', 'bio', 'imageUrl'],
    };

    return generateContentWithSchema<PlayerProfile>(prompt, playerProfileSchema);
  },

  getTeamProfile: async (teamName: string): Promise<TeamProfile | undefined> => {
    const prompt = `Generate a detailed JSON profile for the sports team named ${teamName}, including their sport, league, current season's record (wins, losses, draws, points), coach, stadium, a list of 5 key players (id, name, position, jerseyNumber), and a placeholder image URL for the logo from picsum.photos.`;

    const teamMemberSchema = {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        position: { type: Type.STRING },
        jerseyNumber: { type: Type.NUMBER, description: 'Optional jersey number' },
      },
      required: ['id', 'name', 'position'],
      propertyOrdering: ['id', 'name', 'position', 'jerseyNumber'],
    };

    const teamProfileSchema = {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        sport: { type: Type.STRING },
        league: { type: Type.STRING },
        wins: { type: Type.NUMBER },
        losses: { type: Type.NUMBER },
        draws: { type: Type.NUMBER, description: 'Optional for some sports' },
        points: { type: Type.NUMBER },
        members: { type: Type.ARRAY, items: teamMemberSchema },
        coach: { type: Type.STRING },
        stadium: { type: Type.STRING },
        logoUrl: { type: Type.STRING, description: 'URL for team logo' },
      },
      required: ['id', 'name', 'sport', 'league', 'wins', 'losses', 'points', 'members', 'coach', 'stadium', 'logoUrl'],
      propertyOrdering: ['id', 'name', 'sport', 'league', 'wins', 'losses', 'draws', 'points', 'members', 'coach', 'stadium', 'logoUrl'],
    };

    return generateContentWithSchema<TeamProfile>(prompt, teamProfileSchema);
  },

  getLeagueProfile: async (leagueName: string): Promise<LeagueProfile | undefined> => {
    const prompt = `Generate a detailed JSON profile for the sports league named ${leagueName}, including its sport, country, current season, a list of 5 notable teams (id, name, logoUrl), and current standings for these teams (rank, team name, wins, losses, draws, points). Include a placeholder image URL for the league logo from picsum.photos.`;

    const teamInLeagueSchema = {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        logoUrl: { type: Type.STRING },
      },
      required: ['id', 'name', 'logoUrl'],
      propertyOrdering: ['id', 'name', 'logoUrl'],
    };

    const leagueStandingSchema = {
      type: Type.OBJECT,
      properties: {
        rank: { type: Type.NUMBER },
        team: { type: Type.STRING },
        wins: { type: Type.NUMBER },
        losses: { type: Type.NUMBER },
        draws: { type: Type.NUMBER, description: 'Optional for some sports' },
        points: { type: Type.NUMBER },
      },
      required: ['rank', 'team', 'wins', 'losses', 'points'],
      propertyOrdering: ['rank', 'team', 'wins', 'losses', 'draws', 'points'],
    };

    const leagueProfileSchema = {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        sport: { type: Type.STRING },
        country: { type: Type.STRING },
        currentSeason: { type: Type.STRING },
        teams: { type: Type.ARRAY, items: teamInLeagueSchema },
        standings: { type: Type.ARRAY, items: leagueStandingSchema },
        logoUrl: { type: Type.STRING, description: 'URL for league logo' },
      },
      required: ['id', 'name', 'sport', 'country', 'currentSeason', 'teams', 'standings', 'logoUrl'],
      propertyOrdering: ['id', 'name', 'sport', 'country', 'currentSeason', 'teams', 'standings', 'logoUrl'],
    };

    return generateContentWithSchema<LeagueProfile>(prompt, leagueProfileSchema);
  },

  getGameOdds: async (gameId: string, homeTeam: string, awayTeam: string): Promise<Odds | undefined> => {
    const prompt = `Generate realistic JSON betting odds for a game between ${homeTeam} and ${awayTeam} (Game ID: ${gameId}). Include over/under, point spread (e.g., -7.5 for home, +7.5 for away), and moneyline odds for both teams. Assume standard North American odds format (e.g., -150, +130). Also include a lastUpdated timestamp.`;

    const oddsSchema = {
      type: Type.OBJECT,
      properties: {
        gameId: { type: Type.STRING },
        homeTeam: { type: Type.STRING },
        awayTeam: { type: Type.STRING },
        overUnder: { type: Type.NUMBER },
        spread: { type: Type.NUMBER },
        moneylineHome: { type: Type.NUMBER },
        moneylineAway: { type: Type.NUMBER },
        moneylineDraw: { type: Type.NUMBER, description: 'Optional for sports with draws' },
        lastUpdated: { type: Type.STRING, description: 'ISO 8601 timestamp' },
      },
      required: ['gameId', 'homeTeam', 'awayTeam', 'overUnder', 'spread', 'moneylineHome', 'moneylineAway', 'lastUpdated'],
      propertyOrdering: ['gameId', 'homeTeam', 'awayTeam', 'overUnder', 'spread', 'moneylineHome', 'moneylineAway', 'moneylineDraw', 'lastUpdated'],
    };

    return generateContentWithSchema<Odds>(prompt, oddsSchema);
  },

  searchSportsData: async (query: string): Promise<SearchResult | undefined> => {
    try {
      const ai = getGeminiInstance();
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT, // Use Flash for quick general answers
        contents: [{ parts: [{ text: `Answer the following sports-related query concisely and provide up-to-date information. If the query asks for specific entity data, prioritize that. Query: "${query}"` }] }],
        config: {
          tools: [{ googleSearch: {} }], // Enable Google Search grounding
        },
      });

      const answer = response.text || "No specific answer found.";
      const groundingLinks = extractGroundingLinks(response);

      return { answer, groundingLinks };

    } catch (error) {
      console.error("Error searching sports data with Gemini and Google Search:", error);
      if (error instanceof Error) {
        console.error("Gemini API Error:", error.message);
      }
      return undefined;
    }
  },

  startChat: (systemInstruction?: string): Chat => {
    const ai = getGeminiInstance();
    return ai.chats.create({
      model: GEMINI_MODEL_CHAT, // Use Pro for conversational tasks
      config: {
        systemInstruction: systemInstruction || 'You are a helpful sports assistant for the URScoreCard app. Provide concise and accurate information about sports, players, teams, and leagues. Use Google Search grounding to provide up-to-date details when necessary. If a specific team or game is clearly identifiable in the user\'s query and a \'follow\' action seems appropriate, you can optionally include an action tag at the end of your response in the format `[ACTION:type:ID:Name(:HomeTeam:AwayTeam)]`. For example, for a team: `[ACTION:followTeam:RealMadridID:Real Madrid]`, or for a game: `[ACTION:followGame:GameID123:Real Madrid vs Barcelona:Real Madrid:Barcelona]`. Do not output this tag unless a clear actionable entity is present.',
      },
    });
  },

  sendChatMessage: async (chat: Chat, message: string): Promise<SearchResult | undefined> => {
    try {
      const response: GenerateContentResponse = await chat.sendMessage({
        message: message,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      let answer = response.text || "I'm sorry, I couldn't generate a response.";
      const groundingLinks = extractGroundingLinks(response);
      let suggestedAction;

      // Parse for ACTION tag at the end of the response
      const actionTagRegex = /\[ACTION:(followTeam|followGame):([^:]+):([^:]+)(?::([^:]+):([^:]+))?\]$/;
      const match = answer.match(actionTagRegex);

      if (match) {
        const [, type, id, name, homeTeam, awayTeam] = match;
        suggestedAction = { type, id, name };
        if (type === 'followGame' && homeTeam && awayTeam) {
          suggestedAction.homeTeam = homeTeam;
          suggestedAction.awayTeam = awayTeam;
        }
        answer = answer.replace(actionTagRegex, '').trim(); // Remove the action tag from the displayed answer
      }

      return { answer, groundingLinks, suggestedAction };

    } catch (error) {
      console.error("Error sending chat message:", error);
      if (error instanceof Error) {
        console.error("Gemini API Chat Error:", error.message);
      }
      return undefined;
    }
  },
};
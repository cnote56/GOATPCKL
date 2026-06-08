import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, Db } from 'mongodb';
import { GoogleGenAI, Type } from '@google/genai';
import { seededTrivia } from './src/triviaData';

const isESM = typeof import.meta !== 'undefined' && typeof import.meta.url !== 'undefined';
const __filename = isESM ? fileURLToPath(import.meta.url) : '';
const __dirname = isESM ? path.dirname(__filename) : '';

// Lazy initialization for Gemini Client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Lazy initialization for MongoDB
let dbClient: MongoClient | null = null;
let database: Db | null = null;

async function getDb(): Promise<Db | null> {
  if (database) return database;
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI not found. Using fallback in-memory database.');
    return null;
  }

  try {
    if (!dbClient) {
      dbClient = new MongoClient(uri);
      await dbClient.connect();
      console.log('Connected to MongoDB Atlas');
    }
    database = dbClient.db('goatpckl');
    return database;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    return null;
  }
}

// Rich default stats for NBA players & trivia seeding (resembles Cole's real-world data)
const defaultPlayers = [
  { id: '1', name: 'LeBron James', team: 'Lakers', position: 'F', pts: 25.7, reb: 7.3, ast: 8.3, stl: 1.3, blk: 0.6, fgPct: '54.0%', fg3Pct: '41.0%', gamesPlayed: 71 },
  { id: '2', name: 'Stephen Curry', team: 'Warriors', position: 'G', pts: 26.4, reb: 4.5, ast: 5.1, stl: 0.7, blk: 0.4, fgPct: '45.0%', fg3Pct: '40.8%', gamesPlayed: 74 },
  { id: '3', name: 'Nikola Jokic', team: 'Nuggets', position: 'C', pts: 26.4, reb: 12.4, ast: 9.0, stl: 1.4, blk: 0.9, fgPct: '58.3%', fg3Pct: '35.9%', gamesPlayed: 79 },
  { id: '4', name: 'Luka Doncic', team: 'Mavericks', position: 'G', pts: 33.9, reb: 9.2, ast: 9.8, stl: 1.4, blk: 0.5, fgPct: '48.7%', fg3Pct: '38.2%', gamesPlayed: 70 },
  { id: '5', name: 'Giannis Antetokounmpo', team: 'Bucks', position: 'F', pts: 30.4, reb: 11.5, ast: 6.5, stl: 1.2, blk: 1.1, fgPct: '61.1%', fg3Pct: '27.4%', gamesPlayed: 73 },
  { id: '6', name: 'Shai Gilgeous-Alexander', team: 'Thunder', position: 'G', pts: 30.1, reb: 5.5, ast: 6.2, stl: 2.0, blk: 0.9, fgPct: '53.5%', fg3Pct: '35.3%', gamesPlayed: 75 },
  { id: '7', name: 'Anthony Edwards', team: 'Timberwolves', position: 'G', pts: 25.9, reb: 5.4, ast: 5.1, stl: 1.3, blk: 0.5, fgPct: '46.1%', fg3Pct: '35.7%', gamesPlayed: 79 }
];

const defaultGames = [
  { id: '101', homeTeam: 'Lakers', awayTeam: 'Warriors', time: '8:00 PM EST', status: 'upcoming', date: 'Tonight' },
  { id: '102', homeTeam: 'Nuggets', awayTeam: 'Mavericks', time: '9:30 PM EST', status: 'upcoming', date: 'Tonight' },
  { id: '103', homeTeam: 'Bucks', awayTeam: 'Thunder', time: 'Final', status: 'completed', score: '118-112', date: 'Yesterday' }
];

const defaultTrivia = [...seededTrivia];

function getNovelStats(player: any): string[] {
  const achievements: string[] = [];
  const pts = parseFloat(player.pts) || 0;
  const reb = parseFloat(player.reb) || 0;
  const ast = parseFloat(player.ast) || 0;
  const stl = parseFloat(player.stl) || 0;
  const blk = parseFloat(player.blk) || 0;

  // 1. Triple Threat MVP (Leads team in scoring, rebounds and playmaking)
  if (pts >= 25 && ast >= 6 && reb >= 6) {
    achievements.push('Triple Threat MVP');
  }
  // 2. Playmaker general (Court general leads playmaking and defense)
  if (ast >= 8 && stl >= 1.2) {
    achievements.push('Court General');
  }
  // 3. Defensive anchor
  if (stl >= 1.3 && blk >= 0.8) {
    achievements.push('Lockdown Guardian');
  }
  // 4. Elite sniper (High 3P%)
  const fg3PctVal = player.fg3Pct ? parseFloat(player.fg3Pct.replace('%', '')) : 0;
  if (fg3PctVal >= 40 || (pts >= 26 && fg3PctVal >= 38)) {
    achievements.push('Deadly Sniper');
  }
  // 5. Block / Steal supreme
  if (stl >= 2.0 || blk >= 1.0) {
    achievements.push('Clutch Thief');
  }
  // 6. Paint Dominator
  if (reb >= 10 && pts >= 20) {
    achievements.push('Paint Dominator');
  }

  if (achievements.length === 0 && pts >= 25) {
    achievements.push('Elite Scoring Weapon');
  }
  if (achievements.length === 0) {
    achievements.push('High Impact Roleplayer');
  }

  return achievements;
}

let inMemoryStorage = {
  players: [...defaultPlayers],
  games: [...defaultGames],
  picks: [
    { id: 'p1', username: 'DunkMaster', player: 'LeBron James', voteTime: '7:30 PM' },
    { id: 'p2', username: 'Cole', player: 'Stephen Curry', voteTime: '8:45 PM' },
    { id: 'p3', username: 'SplashFan', player: 'Stephen Curry', voteTime: '9:12 PM' }
  ],
  trivia: [...defaultTrivia],
  chats: [
    { username: 'DunkMaster', text: 'LeBron is going for 40 tonight. Trust the King!', time: '10:15 AM' },
    { username: 'SplashFan', text: 'Curry with 8 threes incoming! Warriors winning this.', time: '10:45 AM' },
    { username: 'Cole', text: 'Check out Jokics efficiency metrics lately. Triple double lock.', time: '11:20 AM' }
  ],
  leaderboard: [
    { username: 'Cole', score: 450, picksCount: 12 },
    { username: 'SplashFan', score: 380, picksCount: 10 },
    { username: 'DunkMaster', score: 320, picksCount: 11 }
  ],
  bets: [] as any[],
  historicalLegends: [
    { id: 'h1', holiday: 'Christmas Day (2023)', player: 'LeBron James', pts: 46, reb: 10, ast: 11, stl: 5, blk: 1 },
    { id: 'h2', holiday: 'Christmas Day (2023)', player: 'Giannis Antetokounmpo', pts: 36, reb: 19, ast: 4, stl: 1, blk: 5 },
    { id: 'h3', holiday: 'MLK Day (2023)', player: 'LeBron James', pts: 48, reb: 8, ast: 9, stl: 2, blk: 0 },
    { id: 'h4', holiday: 'MLK Day (2022)', player: 'Stephen Curry', pts: 40, reb: 4, ast: 8, stl: 4, blk: 1 },
    { id: 'h5', holiday: 'Thanksgiving (2023)', player: 'Kevin Durant', pts: 38, reb: 7, ast: 8, stl: 1, blk: 2 },
    { id: 'h6', holiday: 'Thanksgiving (2023)', player: 'Nikola Jokic', pts: 35, reb: 15, ast: 12, stl: 3, blk: 1 },
    { id: 'h7', holiday: 'December Matchup (Historic Peak)', player: 'Luka Doncic', pts: 50, reb: 8, ast: 10, stl: 3, blk: 1 },
    { id: 'h8', holiday: 'December Avg Standard', player: 'Nikola Jokic', pts: 30, reb: 15, ast: 10, stl: 2, blk: 1 },
    { id: 'h9', holiday: 'January Average Standard', player: 'Giannis Antetokounmpo', pts: 32, reb: 13, ast: 6, stl: 1, blk: 2 },
    { id: 'h10', holiday: 'February Average Standard', player: 'Jayson Tatum', pts: 29, reb: 8, ast: 5, stl: 1, blk: 1 }
  ]
};

// Seed MongoDB if empty
async function seedDatabase() {
  const db = await getDb();
  if (!db) return;

  try {
    const playersCol = db.collection('players');
    const gamesCol = db.collection('games');
    const triviaCol = db.collection('trivia_questions');
    const leaderboardCol = db.collection('leaderboard');

    const playerCount = await playersCol.countDocuments();
    if (playerCount === 0) {
      await playersCol.insertMany(defaultPlayers);
      console.log('Seeded players collection in MongoDB.');
    }

    const gamesCount = await gamesCol.countDocuments();
    if (gamesCount === 0) {
      await gamesCol.insertMany(defaultGames);
      console.log('Seeded games collection in MongoDB.');
    }

    const triviaCount = await triviaCol.countDocuments();
    if (triviaCount < 50) {
      if (triviaCount > 0) {
        await triviaCol.deleteMany({});
      }
      await triviaCol.insertMany(defaultTrivia);
      console.log('Seeded and upgraded trivia collection with 100 high-quality questions.');
    }

    const leaderboardCount = await leaderboardCol.countDocuments();
    if (leaderboardCount === 0) {
      await leaderboardCol.insertMany(inMemoryStorage.leaderboard);
      console.log('Seeded leaderboard collection in MongoDB.');
    }
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize DB & Syncing (non-blocking background call)
  seedDatabase().catch(err => {
    console.error('Failed to seed database in background:', err);
  });

  // --- API Routes ---

  // 1. Get All Players / Stats (Mapped dynamically with Novel Achievements tags)
  app.get('/api/players', async (req: any, res: any) => {
    const db = await getDb();
    let rPlayers: any[] = [];
    if (db) {
      rPlayers = await db.collection('players').find({}).toArray();
    } else {
      rPlayers = inMemoryStorage.players;
    }
    const mapped = rPlayers.map((p: any) => ({
      ...p,
      achievements: getNovelStats(p)
    }));
    res.json(mapped);
  });

  // 2. CSV Upload Endpoint to parse Cole's real-world database / stats
  app.post('/api/upload-csv', async (req: any, res: any) => {
    const { csvData, filename } = req.body;
    if (!csvData) return res.status(400).json({ error: 'No CSV data provided' });

    try {
      const lines = csvData.split(/\r?\n/);
      if (lines.length < 2) return res.status(400).json({ error: 'Empty or invalid CSV file' });

      const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
      const parsedPlayers: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        const columns = lines[i].split(',').map((c: string) => c.trim());
        
        // Construct player object based on columns
        const playerObj: any = { id: Date.now().toString() + '-' + i };
        headers.forEach((header: string, index: number) => {
          if (columns[index] !== undefined) {
            const val = columns[index];
            // Format to match database properties
            if (header === 'player' || header === 'name') playerObj.name = val;
            else if (header === 'team') playerObj.team = val;
            else if (header === 'position' || header === 'pos') playerObj.position = val;
            else if (header === 'pts' || header === 'points') playerObj.pts = parseFloat(val) || 0;
            else if (header === 'reb' || header === 'rebounds') playerObj.reb = parseFloat(val) || 0;
            else if (header === 'ast' || header === 'assists') playerObj.ast = parseFloat(val) || 0;
            else if (header === 'stl' || header === 'steals') playerObj.stl = parseFloat(val) || 0;
            else if (header === 'blk' || header === 'blocks') playerObj.blk = parseFloat(val) || 0;
            else if (header === 'fg%') playerObj.fgPct = val;
            else if (header === '3p%') playerObj.fg3Pct = val;
          }
        });

        if (playerObj.name) parsedPlayers.push(playerObj);
      }

      const db = await getDb();
      if (db) {
        const playersCol = db.collection('players');
        // Clear old list if desired or insert parsed ones
        await playersCol.deleteMany({});
        await playersCol.insertMany(parsedPlayers);
        const allDb = await playersCol.find({}).toArray();
        res.json({ message: `Successfully loaded ${parsedPlayers.length} players from ${filename}`, players: allDb });
      } else {
        inMemoryStorage.players = parsedPlayers;
        res.json({ message: `Successfully loaded ${parsedPlayers.length} players locally from ${filename}`, players: parsedPlayers });
      }
    } catch (err: any) {
      console.error('CSV Import Error:', err);
      res.status(500).json({ error: 'Failed to process CSV file', details: err.message });
    }
  });

  // 2b. Pull Historical Holiday / Month Average Landmarks
  app.get('/api/historical-legends', (req: any, res: any) => {
    res.json(inMemoryStorage.historicalLegends);
  });

  // 2c. Get Active User Bets
  app.get('/api/bets', async (req: any, res: any) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'Missing username' });
    const db = await getDb();
    if (db) {
      const userBets = await db.collection('bets').find({ username }).toArray();
      res.json(userBets);
    } else {
      const userBets = (inMemoryStorage.bets || []).filter((b: any) => b.username === username);
      res.json(userBets);
    }
  });

  // 2d. Record/Submit XP Wager on Tonight's Chosen vs Historical Giant
  app.post('/api/bets/submit', async (req: any, res: any) => {
    const { username, player, legendId, stat, betValue } = req.body;
    if (!username || !player || !legendId || !stat || !betValue) {
      return res.status(400).json({ error: 'Missing required betting options' });
    }

    const value = parseInt(betValue);
    if (isNaN(value) || value <= 0) {
      return res.status(400).json({ error: 'Bet value must be a positive integer.' });
    }

    const db = await getDb();
    let currentScore = 0;

    if (db) {
      const userLd = await db.collection('leaderboard').findOne({ username });
      if (userLd) currentScore = userLd.score || 0;
    } else {
      const userLd = inMemoryStorage.leaderboard.find(l => l.username === username);
      if (userLd) currentScore = userLd.score || 0;
    }

    if (currentScore < value) {
      return res.status(400).json({ error: `You have insufficient XP balance. You need ${value} XP, but only have ${currentScore} XP.` });
    }

    const legendPlayer = inMemoryStorage.historicalLegends.find(hl => hl.id === legendId);
    if (!legendPlayer) {
      return res.status(404).json({ error: 'Historical legend not found.' });
    }

    const newBet = {
      id: `bet-${Date.now()}`,
      username,
      player,
      legendId,
      legendName: legendPlayer.player,
      legendVal: (legendPlayer as any)[stat] || 0,
      holiday: legendPlayer.holiday,
      stat,
      betValue: value,
      status: 'pending',
      resultCommentary: null
    };

    const deduction = -value;

    if (db) {
      await db.collection('leaderboard').updateOne(
        { username },
        { $inc: { score: deduction } }
      );
      await db.collection('bets').insertOne(newBet);
      const userBets = await db.collection('bets').find({ username }).toArray();
      res.json({ success: true, bets: userBets });
    } else {
      const userLd = inMemoryStorage.leaderboard.find(l => l.username === username);
      if (userLd) userLd.score += deduction;

      if (!inMemoryStorage.bets) inMemoryStorage.bets = [];
      inMemoryStorage.bets.push(newBet);
      const userBets = inMemoryStorage.bets.filter((b: any) => b.username === username);
      res.json({ success: true, bets: userBets });
    }
  });

  // 2e. Simulate Live Court Action and Resolve All Standard Selection & XP Battles
  app.post('/api/games/simulate', async (req: any, res: any) => {
    const { username } = req.body;
    const db = await getDb();

    let activePlayers: any[] = [];
    let rGames: any[] = [];
    if (db) {
      activePlayers = await db.collection('players').find({}).toArray();
      rGames = await db.collection('games').find({}).toArray();
    } else {
      activePlayers = inMemoryStorage.players;
      rGames = inMemoryStorage.games;
    }

    // Generate simulated actual performance for tonight's games
    const playerStatsTonight: { [name: string]: any } = {};
    activePlayers.forEach(p => {
      const pAvgPts = parseFloat(p.pts) || 20;
      const pAvgReb = parseFloat(p.reb) || 6;
      const pAvgAst = parseFloat(p.ast) || 5;
      const pAvgStl = parseFloat(p.stl) || 1.1;
      const pAvgBlk = parseFloat(p.blk) || 0.6;

      const ptsOffset = Math.floor(Math.random() * 15) - 6; // -6 to +8
      const rebOffset = Math.floor(Math.random() * 6) - 2;
      const astOffset = Math.floor(Math.random() * 5) - 2;

      playerStatsTonight[p.name] = {
        name: p.name,
        pts: Math.max(12, Math.round(pAvgPts + ptsOffset)),
        reb: Math.max(2, Math.round(pAvgReb + rebOffset)),
        ast: Math.max(1, Math.round(pAvgAst + astOffset)),
        stl: Math.max(0, Math.round(pAvgStl + (Math.random() > 0.5 ? 1 : -1))),
        blk: Math.max(0, Math.round(pAvgBlk + (Math.random() > 0.6 ? 1 : 0)))
      };
    });

    const simulatedGames = rGames.map(g => {
      if (g.status === 'upcoming' || g.date === 'Tonight') {
        const score1 = Math.round(102 + Math.random() * 22);
        const score2 = Math.round(102 + Math.random() * 22);
        return {
          ...g,
          status: 'completed',
          score: `${score1}-${score2}`,
          date: 'Completed Tonight'
        };
      }
      return g;
    });

    if (db) {
      await db.collection('games').deleteMany({});
      await db.collection('games').insertMany(simulatedGames);
    } else {
      inMemoryStorage.games = simulatedGames;
    }

    let allPicks: any[] = [];
    if (db) {
      allPicks = await db.collection('picks').find({}).toArray();
    } else {
      allPicks = inMemoryStorage.picks;
    }

    let hasInsurance = false;
    let hasOffset = false;
    let activePurchases: any[] = [];

    if (db) {
      activePurchases = await db.collection('xp_purchases').find({ username }).toArray();
    } else {
      activePurchases = (inMemoryStorage as any).purchases || [];
    }

    hasInsurance = activePurchases.some(p => p.itemId === 'goat_insurance');
    hasOffset = activePurchases.some(p => p.itemId === 'stat_offset');

    const userPick = allPicks.find(p => p.username === username);
    let pickPointsEarned = 0;
    let pickAwardText = '';

    if (userPick) {
      const pStats = playerStatsTonight[userPick.player];
      if (pStats) {
        let scored = pStats.pts;
        const baseline = parseFloat(activePlayers.find(pl => pl.name === userPick.player)?.pts) || 20;

        if (hasOffset) scored += 2;

        if (scored >= baseline) {
          pickPointsEarned = 100;
          pickAwardText = `🏆 Pick Success: ${userPick.player} outperformed season benchmarks scoring ${scored} PTS! Received +100 XP.`;
        } else if (hasInsurance) {
          pickPointsEarned = 50;
          pickAwardText = `🛡️ Insurance Shield: ${userPick.player} scored ${scored} PTS (below baseline), but GOAT Nightly Insurance saved your lock! Obtained +50 XP.`;
        } else {
          pickAwardText = `❌ Pick Failed: ${userPick.player} got ${scored} PTS, which missed season average. Better luck next game.`;
        }
      }
    }

    let userBets: any[] = [];
    if (db) {
      userBets = await db.collection('bets').find({ username }).toArray();
    } else {
      userBets = inMemoryStorage.bets || [];
    }

    let betXPEarned = 0;
    const evaluatedBets = userBets.map(bet => {
      if (bet.status === 'pending') {
        const pStats = playerStatsTonight[bet.player];
        const legend = inMemoryStorage.historicalLegends.find(lh => lh.id === bet.legendId);
        
        if (pStats && legend) {
          let tonVal = pStats[bet.stat] || 0;
          let legVal = (legend as any)[bet.stat] || 0;
          
          let won = tonVal > legVal;
          if (bet.stat === 'pts' && hasOffset) won = (tonVal + 2) > legVal;

          if (won) {
            const reward = bet.betValue * 2;
            betXPEarned += reward;
            return {
              ...bet,
              status: 'won',
              resultCommentary: `Winner! Tonight's ${bet.player} logged ${tonVal} ${bet.stat.toUpperCase()} which beat ${legend.player}'s historical line of ${legVal} from ${legend.holiday}! Paid +${reward} XP.`
            };
          } else if (hasInsurance) {
            const refund = bet.betValue + 50;
            betXPEarned += refund;
            return {
              ...bet,
              status: 'shielded',
              resultCommentary: `Shielded! Tonight's ${bet.player} scored ${tonVal} ${bet.stat.toUpperCase()} failing to beat historic giants, but GOAT Nightly Insurance triggered! Refunded ${bet.betValue} XP + awarded +50 XP shield bonus.`
            };
          } else {
            return {
              ...bet,
              status: 'lost',
              resultCommentary: `Lost! Tonight's ${bet.player} logged ${tonVal} ${bet.stat.toUpperCase()} which fell short against ${legend.player}'s legendary ${legVal} from ${legend.holiday}. Deducted ${bet.betValue} XP.`
            };
          }
        }
      }
      return bet;
    });

    if (db) {
      await db.collection('bets').deleteMany({ username });
      if (evaluatedBets.length > 0) {
        await db.collection('bets').insertMany(evaluatedBets);
      }
    } else {
      inMemoryStorage.bets = evaluatedBets;
    }

    const totalXPToAdd = pickPointsEarned + betXPEarned;
    if (totalXPToAdd > 0) {
      if (db) {
        await db.collection('leaderboard').updateOne(
          { username },
          { $inc: { score: totalXPToAdd } }
        );
      } else {
        const userLd = inMemoryStorage.leaderboard.find(l => l.username === username);
        if (userLd) userLd.score += totalXPToAdd;
      }
    }

    const clearedPurchases = activePurchases.filter(p => p.itemId !== 'goat_insurance' && p.itemId !== 'stat_offset');
    if (db) {
      await db.collection('xp_purchases').deleteMany({ username });
      if (clearedPurchases.length > 0) {
        await db.collection('xp_purchases').insertMany(clearedPurchases);
      }
    } else {
      (inMemoryStorage as any).purchases = clearedPurchases;
    }

    const simulatedCommentaryText = `🎙️ [GOATPCKL ANCHOR REPORT] TONIGHT'S LIVE COURTS SIMULATED ACCORDINGLY! 

    Tonight's Core Box Score Highlights & Custom Badges Witnessed:
    ${Object.keys(playerStatsTonight).map(name => {
      const s = playerStatsTonight[name];
      const statsAchievements = getNovelStats(s);
      return `🏀 ${s.name}: ${s.pts} PTS, ${s.reb} REB, ${s.ast} AST, ${s.stl} STL, ${s.blk} BLK [Dynamic Badges: ${statsAchievements.join(', ')}]`;
    }).join('\n')}

    User Account Record updates for ${username}:
    ${pickAwardText || '• No active picks lock registered for tonight.'}
    ${evaluatedBets.map(eb => `• Bet Outcome: ${eb.resultCommentary}`).join('\n') || '• No active bets placed against historical holiday giants.'}

    Total Score Earned: +${totalXPToAdd} XP! All matchup rosters and shop power-ups have reset for the next live court list. Check the Lobby standings to see your updated leaderboard rank!`;

    const commentatorMessage = {
      username: 'Goat Commentator AI',
      text: simulatedCommentaryText,
      videoUrl: null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    inMemoryStorage.chats.push(commentatorMessage);

    let finalLeaderboard = [];
    if (db) {
      finalLeaderboard = await db.collection('leaderboard').find({}).sort({ score: -1 }).toArray();
    } else {
      finalLeaderboard = [...inMemoryStorage.leaderboard].sort((a, b) => b.score - a.score);
    }

    res.json({
      success: true,
      message: 'Games simulated and settled successfully!',
      playerStatsTonight,
      pickAwardText,
      totalXPEarned: totalXPToAdd,
      leaderboard: finalLeaderboard,
      bets: evaluatedBets,
      chats: inMemoryStorage.chats,
      games: simulatedGames,
      purchases: clearedPurchases
    });
  });

  // 3. Get Active Matchups
  app.get('/api/games', async (req: any, res: any) => {
    const db = await getDb();
    if (db) {
      const dbGames = await db.collection('games').find({}).toArray();
      res.json(dbGames);
    } else {
      res.json(inMemoryStorage.games);
    }
  });

  // 4. Submit GOAT Pick of the Night
  app.post('/api/picks', async (req: any, res: any) => {
    const { username, player } = req.body;
    if (!username || !player) return res.status(400).json({ error: 'Missing username or player selection' });

    const newPick = {
      id: Date.now().toString(),
      username,
      player,
      voteTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const db = await getDb();
    if (db) {
      await db.collection('picks').insertOne(newPick);
      // Double check active counts to update score
      await db.collection('leaderboard').updateOne(
        { username },
        { $inc: { score: 10, picksCount: 1 }, $setOnInsert: { username } },
        { upsert: true }
      );
      const picks = await db.collection('picks').find({}).toArray();
      res.json({ success: true, picks });
    } else {
      inMemoryStorage.picks.push(newPick);
      // Update local leaderboard
      const userLd = inMemoryStorage.leaderboard.find(l => l.username === username);
      if (userLd) {
        userLd.score += 10;
        userLd.picksCount += 1;
      } else {
        inMemoryStorage.leaderboard.push({ username, score: 10, picksCount: 1 });
      }
      res.json({ success: true, picks: inMemoryStorage.picks });
    }
  });

  // 5. Fetch Votes / Picks Leaderboard
  app.get('/api/picks', async (req: any, res: any) => {
    const db = await getDb();
    if (db) {
      const picks = await db.collection('picks').find({}).toArray();
      res.json(picks);
    } else {
      res.json(inMemoryStorage.picks);
    }
  });

  // 6. Gemini Trivia Mining / Generation from active stats & historical profiles
  app.post('/api/trivia/mine', async (req: any, res: any) => {
    const { simulateLivePlay } = req.body;
    const db = await getDb();
    let sampleStats: any[] = inMemoryStorage.players;
    let sampleGames: any[] = inMemoryStorage.games;
    if (db) {
      sampleStats = await db.collection('players').find({}).toArray();
      sampleGames = await db.collection('games').find({}).toArray();
    }

    try {
      let prompt = '';
      if (simulateLivePlay) {
        prompt = `You are the ultimate live NBA commentator, analytical game-simulator, and quizmaster for a fantasy app called GOATPCKL.
        
        Analyze these live player roster cards:
        ${JSON.stringify(sampleStats, null, 2)}
        And tonight's active live matchups:
        ${JSON.stringify(sampleGames, null, 2)}

        Create EXACTLY 3 highly engaging trivia questions that mimics real-time court events happening right now (or just finished) to keep the TV viewer glued to the screen!
        For example:
        - "Stephen Curry is heating up with 18 points in the 3rd quarter tonight. In NBA History, who holds the record for most 3-pointers made in a single quarter?"
        - "Luka Doncic is leading a Mavs fastbreak right now. If he logs another triple-double tonight, how many career triple-doubles will he have?"
        - "Lakers at Warriors is going wire-to-wire. What is the franchise record for most points scored in a single game between these two historic teams?"

        Formulate fresh, creative, highly specific questions using the active list of players/matchups. Set the scene as if the play is unfolding live right now!
        
        Return the result as a strict JSON array where each object has the following keys:
        - question: (live court-mimicked, high-stakes commentary-based trivia question)
        - options: (must be exactly 4 possible option strings)
        - answer: (must be the exact correct string matching one of the options)
        - explanation: (a highly details breakdown resembling an ESPN analyst)

        Only return the clean, stringified JSON array. Do not include markdown code block syntax or extra text.`;
      } else {
        prompt = `You are the ultimate NBA statistician and quizmaster for a sports picking/trivia app called GOATPCKL.
        Analyze the following NBA player stats data and use your broad historical knowledge to mine exactly 3 highly engaging, fact-based trivia questions.
        
        Here is the available current player dataset:
        ${JSON.stringify(sampleStats, null, 2)}

        For each question, ensure it is statistically accurate based either directly on these statistics (e.g. "Which player leads this list with 33.9 PPG?") or historical milestones associated with these teams/players (e.g. LeBron James Laker championships, Stephen Curry 3-pointers, Nuggets franchise statistics).

        Return the result as a strict JSON array where each object has the following keys:
        - question: (highly engaging fact-based trivia question)
        - options: (must be exactly 4 possible option strings)
        - answer: (must be the exact correct string matching one of the options)
        - explanation: (a highly details breakdown resembling an ESPN analyst)

        Only return the clean, stringified JSON array. Do not include markdown code block syntax or extra text.`;
      }

      const response = await getAiClient().models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                answer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ['question', 'options', 'answer', 'explanation']
            }
          }
        }
      });

      const text = response.text?.trim() || '[]';
      const triviaQuestions = JSON.parse(text);

      // Add IDs to generated trivia
      const typedTrivia = triviaQuestions.map((t: any, index: number) => ({
        ...t,
        id: `gen-${Date.now()}-${index}`,
        isLiveMimic: !!simulateLivePlay
      }));

      if (db) {
        const triviaCol = db.collection('trivia_questions');
        await triviaCol.insertMany(typedTrivia);
        const allTrivia = await triviaCol.find({}).toArray();
        res.json({ message: 'Trivia mined successfully!', trivia: allTrivia });
      } else {
        inMemoryStorage.trivia = [...inMemoryStorage.trivia, ...typedTrivia];
        res.json({ message: 'Trivia mined locally!', trivia: inMemoryStorage.trivia });
      }
    } catch (err: any) {
      console.error('Trivia generation error:', err);
      res.status(500).json({ error: 'AI failed to mine trivia. Please ensure your GEMINI_API_KEY is configured correctly.', details: err.message });
    }
  });

  // 7. Get Trivia Questions (mined or static)
  app.get('/api/trivia', async (req: any, res: any) => {
    const db = await getDb();
    if (db) {
      const trivia = await db.collection('trivia_questions').find({}).toArray();
      res.json(trivia);
    } else {
      res.json(inMemoryStorage.trivia);
    }
  });

  // 7b. Get user purchased items from XP Shop
  app.get('/api/xp-shop/purchases', async (req: any, res: any) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'Missing username' });

    const db = await getDb();
    if (db) {
      const purchases = await db.collection('xp_purchases').find({ username }).toArray();
      res.json(purchases);
    } else {
      // Fallback local memory
      if (!(inMemoryStorage as any).purchases) (inMemoryStorage as any).purchases = [];
      const userPurchases = (inMemoryStorage as any).purchases.filter((p: any) => p.username === username);
      res.json(userPurchases);
    }
  });

  // 7c. Purchase item in the XP Shop (Costs XP score deducted from Leaderboard)
  app.post('/api/xp-shop/purchase', async (req: any, res: any) => {
    const { username, itemId, itemCost, itemName } = req.body;
    if (!username || !itemId) return res.status(400).json({ error: 'Missing username or item details' });

    const db = await getDb();
    let currentScore = 0;

    if (db) {
      const userLd = await db.collection('leaderboard').findOne({ username });
      if (userLd) currentScore = userLd.score || 0;
    } else {
      const userLd = inMemoryStorage.leaderboard.find(l => l.username === username);
      if (userLd) currentScore = userLd.score || 0;
    }

    if (currentScore < itemCost) {
      return res.status(400).json({ error: `Insufficient XP Balance! You need ${itemCost} XP, but only have ${currentScore} XP.` });
    }

    const doubleDeduct = -itemCost;
    const newPurchase = {
      id: `purch-${Date.now()}`,
      username,
      itemId,
      itemName,
      cost: itemCost,
      purchasedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      appliedToPlayer: null
    };

    if (db) {
      // Deduct score
      await db.collection('leaderboard').updateOne(
        { username },
        { $inc: { score: doubleDeduct } }
      );
      // Save purchase
      await db.collection('xp_purchases').insertOne(newPurchase);
      const userPurchases = await db.collection('xp_purchases').find({ username }).toArray();
      res.json({ success: true, purchases: userPurchases });
    } else {
      // Fallback
      if (!(inMemoryStorage as any).purchases) (inMemoryStorage as any).purchases = [];
      const userLd = inMemoryStorage.leaderboard.find(l => l.username === username);
      if (userLd) userLd.score += doubleDeduct;

      (inMemoryStorage as any).purchases.push(newPurchase);
      const userPurchases = (inMemoryStorage as any).purchases.filter((p: any) => p.username === username);
      res.json({ success: true, purchases: userPurchases });
    }
  });

  // 8. Submit Trivia Answers (Earn Points)
  app.post('/api/trivia/answer', async (req: any, res: any) => {
    const { username, questionId, selectedAnswer } = req.body;
    if (!username || !questionId) return res.status(400).json({ error: 'Missing username or question ID' });

    let activeTriviaList: any[] = inMemoryStorage.trivia;
    const db = await getDb();

    if (db) {
      activeTriviaList = await db.collection('trivia_questions').find({}).toArray();
    }

    const question = activeTriviaList.find(q => q.id === questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const correct = question.answer === selectedAnswer;
    const pointsEarned = correct ? 50 : 0;

    if (pointsEarned > 0) {
      if (db) {
        await db.collection('leaderboard').updateOne(
          { username },
          { $inc: { score: pointsEarned }, $setOnInsert: { username } },
          { upsert: true }
        );
      } else {
        const userLd = inMemoryStorage.leaderboard.find(l => l.username === username);
        if (userLd) userLd.score += pointsEarned;
        else inMemoryStorage.leaderboard.push({ username, score: pointsEarned, picksCount: 0 });
      }
    }

    res.json({
      correct,
      pointsEarned,
      explanation: question.explanation,
      correctAnswer: question.answer
    });
  });

  // 9. Get User Leaderboard
  app.get('/api/leaderboard', async (req: any, res: any) => {
    const db = await getDb();
    if (db) {
      const leaderboard = await db.collection('leaderboard').find({}).sort({ score: -1 }).toArray();
      res.json(leaderboard);
    } else {
      const sorted = [...inMemoryStorage.leaderboard].sort((a, b) => b.score - a.score);
      res.json(sorted);
    }
  });

  // 10. Fan Chat Room
  app.get('/api/chats', (req: any, res: any) => {
    // Keep chats in-memory for live feel or support optional DB storage
    res.json(inMemoryStorage.chats);
  });

  app.post('/api/chats', (req: any, res: any) => {
    const { username, text, videoUrl } = req.body;
    if (!username || !text) return res.status(400).json({ error: 'Invalid message' });

    const newMessage = {
      username,
      text,
      videoUrl: videoUrl || null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    inMemoryStorage.chats.push(newMessage);
    res.json({ success: true, chats: inMemoryStorage.chats });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GOATPCKL Live Service running on http://localhost:${PORT}`);
  });
}

startServer();

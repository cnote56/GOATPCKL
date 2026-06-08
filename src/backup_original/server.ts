import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, Db } from 'mongodb';
import { GoogleGenAI, Type } from '@google/genai';
import { seededTrivia } from '../triviaData';

const isESM = typeof import.meta !== 'undefined' && typeof import.meta.url !== 'undefined';
const __filename = isESM ? fileURLToPath(import.meta.url) : '';
const __dirname = isESM ? path.dirname(__filename) : '';

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

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

  // Initialize DB & Syncing
  await seedDatabase();

  // --- API Routes ---

  // 1. Get All Players / Stats
  app.get('/api/players', async (req: any, res: any) => {
    const db = await getDb();
    if (db) {
      const dbPlayers = await db.collection('players').find({}).toArray();
      res.json(dbPlayers);
    } else {
      res.json(inMemoryStorage.players);
    }
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

      const response = await ai.models.generateContent({
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
    app.get('/:all*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GOATPCKL Live Service running on http://localhost:${PORT}`);
  });
}

startServer();

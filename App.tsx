import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Flame, 
  Tv, 
  MessageSquare, 
  Upload, 
  User, 
  Check, 
  Cpu, 
  HelpCircle, 
  TrendingUp, 
  AlertCircle,
  FileText,
  Send,
  Video,
  ShoppingBag,
  ShieldCheck,
  Zap,
  Sparkles,
  Coins
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'trivia' | 'draft' | 'xp-shop' | 'standings' | 'chat' | 'csv'>('trivia');
  const [username, setUsername] = useState<string>('Cole');
  const [tempUsername, setTempUsername] = useState<string>('Cole');
  const [isEditingUser, setIsEditingUser] = useState<boolean>(false);
  
  // Data State
  const [players, setPlayers] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [picks, setPicks] = useState<any[]>([]);
  const [trivia, setTrivia] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  
  // Interaction State
  const [selectedTriviaOption, setSelectedTriviaOption] = useState<{ [key: string]: string }>({});
  const [triviaResult, setTriviaResult] = useState<{ [key: string]: { correct: boolean, explanation: string, correctAnswer: string } }>({});
  const [isMiningTrivia, setIsMiningTrivia] = useState<boolean>(false);
  const [isMiningMimic, setIsMiningMimic] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatVideoUrl, setChatVideoUrl] = useState<string>('');
  const [userVote, setUserVote] = useState<string>('');
  const [csvUploadStatus, setCsvUploadStatus] = useState<string>('');
  const [csvFileContent, setCsvFileContent] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [purchaseStatus, setPurchaseStatus] = useState<string>('');
  const [insuranceApplied, setInsuranceApplied] = useState<boolean>(false);
  const [offsetApplied, setOffsetApplied] = useState<boolean>(false);

  // Poll intervals
  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(() => {
      fetchPicks();
      fetchChats();
      fetchLeaderboard();
      fetchPurchases(username);
    }, 4000);
    return () => clearInterval(interval);
  }, [username]);

  const fetchInitialData = async () => {
    try {
      const pRes = await fetch('/api/players');
      const pData = await pRes.json();
      setPlayers(pData);

      const gRes = await fetch('/api/games');
      const gData = await gRes.json();
      setGames(gData);

      fetchPicks();
      fetchTrivia();
      fetchChats();
      fetchLeaderboard();
      fetchPurchases(username);
    } catch (err) {
      console.error('Failed to load initial GOATPCKL data:', err);
    }
  };

  const fetchPicks = async () => {
    const res = await fetch('/api/picks');
    const data = await res.json();
    setPicks(data);
  };

  const fetchTrivia = async () => {
    const res = await fetch('/api/trivia');
    const data = await res.json();
    setTrivia(data);
  };

  const fetchChats = async () => {
    const res = await fetch('/api/chats');
    const data = await res.json();
    setChats(data);
  };

  const fetchLeaderboard = async () => {
    const res = await fetch('/api/leaderboard');
    const data = await res.json();
    setLeaderboard(data);
  };

  const fetchPurchases = async (user: string) => {
    try {
      const res = await fetch(`/api/xp-shop/purchases?username=${encodeURIComponent(user)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPurchases(data);
      }
    } catch (err) {
      console.error('Failed to fetch user purchases:', err);
    }
  };

  // Submit Nightly GOAT selection
  const handleVoteGOAT = async (playerName: string) => {
    try {
      setUserVote(playerName);
      const res = await fetch('/api/picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, player: playerName })
      });
      const data = await res.json();
      if (data.success) {
        setPicks(data.picks);
        fetchLeaderboard();
      }
    } catch (err) {
      console.error('Error recording pick:', err);
    }
  };

  // Submit Trivia Answer
  const handleTriviaAnswer = async (questionId: string, option: string) => {
    if (triviaResult[questionId]) return; // already answered
    setSelectedTriviaOption(prev => ({ ...prev, [questionId]: option }));

    try {
      const res = await fetch('/api/trivia/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, questionId, selectedAnswer: option })
      });
      const data = await res.json();
      setTriviaResult(prev => ({
        ...prev,
        [questionId]: {
          correct: data.correct,
          explanation: data.explanation,
          correctAnswer: data.correctAnswer
        }
      }));
      fetchLeaderboard();
    } catch (err) {
      console.error('Error submitting answer:', err);
    }
  };

  // Mine fresh trivia using Gemini (Standard or Live Mimicked)
  const handleMineTrivia = async (simulateLivePlay: boolean = false) => {
    if (simulateLivePlay) setIsMiningMimic(true);
    else setIsMiningTrivia(true);

    try {
      const res = await fetch('/api/trivia/mine', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulateLivePlay })
      });
      const data = await res.json();
      if (data.trivia) {
        setTrivia(data.trivia);
        // Clean feedback without modal blocking where appropriate
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error('Failed to trigger trivia generation:', err);
    } finally {
      setIsMiningTrivia(false);
      setIsMiningMimic(false);
    }
  };

  // Trigger XP item purchase
  const handlePurchaseItem = async (itemId: string, itemCost: number, itemName: string) => {
    setPurchaseStatus('');
    try {
      const res = await fetch('/api/xp-shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, itemId, itemCost, itemName })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPurchases(data.purchases);
        setPurchaseStatus(`✅ Purchased: ${itemName}! -${itemCost} XP applied.`);
        fetchLeaderboard();
      } else {
        setPurchaseStatus(`❌ Error: ${data.error || 'Failed to complete transaction'}`);
      }
    } catch (err) {
      console.error('Purchase failed:', err);
      setPurchaseStatus('❌ System error during checkout.');
    }
  };

  // Post community chat / highlight
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          text: chatInput,
          videoUrl: chatVideoUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        setChats(data.chats);
        setChatInput('');
        setChatVideoUrl('');
      }
    } catch (err) {
      console.error('Error posting message:', err);
    }
  };

  // Load Cole's Real_World_Data CSV
  const handleCSVImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFileContent) return;
    setIsUploading(true);

    try {
      const res = await fetch('/api/upload-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvData: csvFileContent,
          filename: 'Real_World_Data.csv'
        })
      });
      const data = await res.json();
      if (data.players) {
        setPlayers(data.players);
        setCsvUploadStatus(`Imported successfully! ${data.players.length} players added.`);
        setCsvFileContent('');
      } else if (data.error) {
        setCsvUploadStatus('Format Error: ' + data.error);
      }
    } catch (err) {
      setCsvUploadStatus('Failed to upload data');
    } finally {
      setIsUploading(false);
    }
  };

  // Helper: calculate live consensus percentages
  const getPickConsensus = (playerName: string) => {
    const totalPicks = picks.length;
    if (totalPicks === 0) return 0;
    const playerPicks = picks.filter(p => p.player === playerName).length;
    return Math.round((playerPicks / totalPicks) * 100);
  };

  const activeUserPick = picks.find(p => p.username === username);
  const userLeaderboardRecord = leaderboard.find(l => l.username === username);
  const userXP = userLeaderboardRecord ? userLeaderboardRecord.score : 0;

  return (
    <div className="min-h-screen bg-[#121214] text-[#f5f5f5] flex flex-col items-center p-0 md:p-6 select-none font-sans">
      
      {/* Full Layout wrapper structured as an elite ESPN/DraftKings Mobile App Container */}
      <div className="w-full max-w-[480px] min-h-[100vh] md:min-h-[850px] bg-[#1a1a1e] border-0 md:border md:border-[#34343d] md:rounded-[36px] flex flex-col justify-between overflow-hidden shadow-2xl relative">
        
        {/* Top Status Bar Grid */}
        <div className="bg-[#111113] p-4 pb-3 border-b border-[#2d2d34] flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ccff00] animate-pulse"></div>
              <h1 className="text-xl font-black tracking-tighter text-[#ccff00] italic">GOATPCKL</h1>
            </div>
            
            {/* User Profile & XP Balance section */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#ccff00]/15 text-[#ccff00] px-2.5 py-1 rounded-full border border-[#ccff00]/30 text-[10px] font-black tracking-wider shadow-sm">
                <Coins size={11} className="animate-spin-slow" />
                <span>{userXP} XP</span>
              </div>

              {isEditingUser ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="text" 
                    value={tempUsername} 
                    onChange={(e) => setTempUsername(e.target.value)}
                    className="bg-[#2a2a30] text-xs px-2 py-1 rounded border border-[#ccff00] outline-none w-20 text-center text-white font-bold"
                    maxLength={12}
                  />
                  <button 
                    onClick={() => { setUsername(tempUsername); setIsEditingUser(false); }}
                    className="bg-[#ccff00] text-black rounded p-1"
                  >
                    <Check size={12} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditingUser(true)} 
                  className="flex items-center gap-1 bg-[#26262a] hover:bg-[#34343d] px-2.5 py-1.5 rounded-full border border-[#3e3e46] cursor-pointer transition-all duration-150"
                >
                  <User size={11} className="text-[#ccff00]" />
                  <span className="text-[11px] font-bold tracking-tight">{username}</span>
                  {purchases.some(p => p.itemId === 'crown_badge') && (
                    <Sparkles size={10} className="text-yellow-400" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Hot ticker showing quick info */}
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#a3a3b3] bg-[#1d1d21] px-2 py-1.5 rounded-md mt-1 overflow-x-auto whitespace-nowrap scrollbar-none">
            <span className="text-[#ccff00]">LIVE TICKER:</span>
            <span>🔥 {picks.length} picks loaded</span>
            <span className="opacity-30">|</span>
            <span>🏆 Double XP Trivia Hour Active!</span>
          </div>
        </div>

        {/* Dynamic Canvas Area */}
        <div className="flex-grow overflow-y-auto px-4 py-4 space-y-4 max-h-[calc(100vh-140px)] md:max-h-[700px] scrollbar-hide">
          
          {/* TAB 1: DRAFT ROOM */}
          {activeTab === 'draft' && (
            <div className="space-y-4">
              
              {/* Draft modifier controls if pick is locked */}
              {activeUserPick && (
                <div className="bg-[#24242e] border-2 border-[#ccff00]/40 rounded-2xl p-4 space-y-3 shadow-md">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-[#ccff00] text-black font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase">
                      My Locked Vote
                    </span>
                    <span className="text-xs font-black text-white">{activeUserPick.player}</span>
                  </div>

                  <p className="text-[10.5px] text-[#a3a3b3] leading-relaxed">
                    Protect your active pick using items purchased from the **XP Shop**! Earn more XP inside our interactive Trivia module.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button 
                      onClick={() => {
                        if (!purchases.some(p => p.itemId === 'goat_insurance')) {
                          alert("Go to 'XP Shop' to purchase Premium GOAT Insurance first!");
                          return;
                        }
                        setInsuranceApplied(!insuranceApplied);
                      }}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                        insuranceApplied 
                          ? 'bg-[#15341c] border-[#00e676] text-[#00e676]' 
                          : purchases.some(p => p.itemId === 'goat_insurance')
                            ? 'bg-[#1a1a23] border-[#34343d] text-white hover:border-[#ccff00]'
                            : 'bg-[#121216] border-[#25252a] text-zinc-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <ShieldCheck size={16} />
                      <span className="text-[9.5px] font-black uppercase tracking-wider">
                        {insuranceApplied ? 'Insurance Applied' : 'Apply Insurance'}
                      </span>
                    </button>

                    <button 
                      onClick={() => {
                        if (!purchases.some(p => p.itemId === 'stat_offset')) {
                          alert("Go to 'XP Shop' to purchase Stat Offset Boosters!");
                          return;
                        }
                        setOffsetApplied(!offsetApplied);
                      }}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                        offsetApplied 
                          ? 'bg-[#15341c] border-[#00e676] text-[#00e676]' 
                          : purchases.some(p => p.itemId === 'stat_offset')
                            ? 'bg-[#1a1a23] border-[#34343d] text-white hover:border-[#ccff00]'
                            : 'bg-[#121216] border-[#25252a] text-zinc-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Zap size={16} />
                      <span className="text-[9.5px] font-black uppercase tracking-wider">
                        {offsetApplied ? '+2 PTS Offset On' : 'Apply +2 Offset'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Matchup tickers */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-bold tracking-widest text-[#a3a3b3] flex items-center gap-1.5">
                  <Tv size={12} className="text-[#ccff00]" /> Nightly Matchups
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {games.map(game => (
                    <div key={game.id} className="bg-[#242429] flex-shrink-0 p-2.5 rounded-xl border border-[#32323b] min-w-[140px] text-center">
                      <div className="text-[9px] uppercase tracking-wider text-[#a3a3b3] mb-1">{game.time}</div>
                      <div className="text-xs font-black flex justify-between items-center px-1">
                        <span>{game.homeTeam}</span>
                        <span className="text-[10px] opacity-40">vs</span>
                        <span>{game.awayTeam}</span>
                      </div>
                      <div className="text-[9px] text-[#ccff00] font-bold tracking-wider mt-1.5">{game.score || 'PICK GOAT NOW'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roster list */}
              <div className="space-y-3">
                <div className="flex justify-between items-center shadow-sm">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-[#a3a3b3] flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-[#ccff00]" /> High Impact Roster
                  </div>
                  <span className="text-[9px] text-[#a3a3b3]">Click card to lock GOAT pick</span>
                </div>

                <div className="space-y-3">
                  {players.map(player => {
                    const consensus = getPickConsensus(player.name);
                    const isSelected = activeUserPick?.player === player.name;

                    return (
                      <div 
                        key={player.id} 
                        className={`bg-[#202025] hover:bg-[#25252b] rounded-2xl border-2 transition-all p-4 relative overflow-hidden ${
                          isSelected ? 'border-[#ccff00]' : 'border-[#32323a]'
                        }`}
                      >
                        {/* Player Basic Heading */}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="bg-[#111113] text-[#ccff00] text-[9px] font-extrabold px-1.5 py-0.5 rounded-md tracking-wider mr-2 uppercase">
                              {player.team} • {player.position}
                            </span>
                            <h3 className="text-sm font-black tracking-tight mt-1.5">{player.name}</h3>
                          </div>
                          
                          {/* Pick GOAT Action */}
                          <button 
                            onClick={() => handleVoteGOAT(player.name)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                              isSelected 
                                ? 'bg-[#ccff00] text-black border-2 border-[#ccff00]' 
                               : 'bg-[#121214] text-[#f5f5f5] hover:bg-[#1f1f23] border border-[#3e3e4a]'
                            }`}
                          >
                            {isSelected && <Check size={11} />}
                            {isSelected ? 'My GOAT' : 'GOAT PICK'}
                          </button>
                        </div>

                        {/* Player Quick Metric bars in ESPN style */}
                        <div className="grid grid-cols-3 gap-2 text-center bg-[#18181b] p-2 rounded-xl mb-3 border border-[#2b2b32]">
                          <div>
                            <div className="text-[9px] uppercase text-[#a3a3b3]">Points</div>
                            <div className="text-sm font-bold text-white">
                              {player.pts} {isSelected && offsetApplied && <span className="text-[#ccff00] text-xs font-black font-mono"> (+2)</span>}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase text-[#a3a3b3]">Rebounds</div>
                            <div className="text-sm font-bold text-white">{player.reb}</div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase text-[#a3a3b3]">Assists</div>
                            <div className="text-sm font-bold text-white">{player.ast}</div>
                          </div>
                        </div>

                        {/* Additional Stats Slider / View */}
                        <div className="flex justify-between items-center text-[10px] opacity-60 font-mono">
                          <span>STL: {player.stl} | BLK: {player.blk}</span>
                          <span>FG: {player.fgPct} | 3P: {player.fg3Pct}</span>
                        </div>

                        {/* Visual Consensus Bar */}
                        {consensus > 0 && (
                          <div className="mt-3.5 pt-2 border-t border-[#2a2a33]">
                            <div className="flex justify-between items-center text-[9px] uppercase font-bold text-[#ccff00] mb-1">
                              <span>Consensus Pick Trend</span>
                              <span>{consensus}%</span>
                            </div>
                            <div className="w-full bg-[#17171d] h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-[#ccff00] h-full transition-all duration-300" 
                                style={{ width: `${consensus}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STANDINGS & LEADERBOARD */}
          {activeTab === 'standings' && (
            <div className="space-y-4">
              <div className="bg-[#202025] border border-[#34343d] rounded-2xl p-4">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-[#ccff00] mb-3 flex items-center gap-1.5">
                  <Flame size={14} /> Hot GOAT Selections Tonight
                </h3>
                
                {/* Aggregate selections trend */}
                <div className="space-y-3">
                  {players.map(player => {
                    const count = picks.filter(p => p.player === player.name).length;
                    const percent = getPickConsensus(player.name);
                    return (
                      <div key={player.id} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span>{player.name} ({player.team})</span>
                          <span className="text-[#ccff00] font-mono">{count} Picks ({percent}%)</span>
                        </div>
                        <div className="w-full bg-[#121214] h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-[#ccff00] to-[#00e676] h-full transition-all" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="bg-[#202025] border border-[#34343d] rounded-2xl p-4">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-white mb-3 flex items-center gap-1.5">
                  <Trophy size={14} className="text-[#ccff00]" /> Trivia & Pick Leaderboard
                </h3>
                <div className="divide-y divide-[#2d2d34]">
                  {leaderboard.map((user, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-center w-5 opacity-40">{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-black">{user.username}</p>
                          {purchases.some(p => p.username === user.username && p.itemId === 'crown_badge') && (
                            <Sparkles size={11} className="text-yellow-400" />
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-black text-[#ccff00] font-mono">{user.score} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRIVIA COMPANION */}
          {activeTab === 'trivia' && (
            <div className="space-y-4">
              
              {/* Rewards Callout banner */}
              <div className="bg-gradient-to-r from-[#ccff00]/15 to-transparent border border-[#ccff00]/25 p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Coins size={14} className="text-[#ccff00] animate-bounce" />
                  <h3 className="text-xs uppercase font-black tracking-wider text-white">Interactive Fan Companion</h3>
                </div>
                <p className="text-[10.5px] text-[#a3a3b3] leading-relaxed">
                  Lock guesses during live TV broadcasts to earn **+50 XP points**. Spend points inside the **XP Shop** to redeem GOAT Insurance or offset stat boosters!
                </p>
              </div>

              {/* AI generator laboratory callout */}
              <div className="bg-gradient-to-b from-[#202025] to-[#151518] border border-[#3e3e4a] p-4 rounded-2xl flex flex-col items-center text-center gap-3 relative overflow-hidden">
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#ccff00]/10 text-[#ccff00] text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-[#ccff00]/20">
                  <Cpu size={8} /> Gemini 3.5 Active
                </div>
                
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-white">Dynamic AI Trivia Miner</h3>
                <p className="text-[10px] text-[#a3a3b3] leading-normal max-w-sm">
                  Generate the next set of questions! Pick standard statistical analysis, or match the live broadcast using our game-mimic commentator model:
                </p>

                <div className="grid grid-cols-2 gap-2 w-full pt-1">
                  <button 
                    onClick={() => handleMineTrivia(false)}
                    disabled={isMiningTrivia || isMiningMimic}
                    className="bg-[#1a1a23] hover:bg-[#23232d] border border-[#353540] text-[#f5f5f5] font-extrabold uppercase text-[9px] py-3 rounded-xl transition-all tracking-wider disabled:opacity-40 flex flex-col items-center justify-center gap-1"
                  >
                    <Coins size={12} className="text-[#ccff00]" />
                    <span>{isMiningTrivia ? 'MINING...' : 'STATISTICS TRIVIA'}</span>
                  </button>

                  <button 
                    onClick={() => handleMineTrivia(true)}
                    disabled={isMiningTrivia || isMiningMimic}
                    className="bg-[#ccff00] hover:bg-[#b5e000] text-black font-black uppercase text-[9px] py-3 rounded-xl transition-all tracking-wider disabled:opacity-40 flex flex-col items-center justify-center gap-1 shadow-lg"
                  >
                    <Flame size={12} className="text-black animate-pulse" />
                    <span>{isMiningMimic ? 'SIMULATING...' : 'MIMIC LIVE GAME'}</span>
                  </button>
                </div>
              </div>

              {/* Active list */}
              <div className="space-y-3">
                {trivia.map((t, tIndex) => {
                  const result = triviaResult[t.id];
                  const hasAnswered = !!result;

                  return (
                    <div key={t.id} className="bg-[#202025] border border-[#32323a] rounded-2xl p-4 gap-3 flex flex-col relative overflow-hidden">
                      {/* Live indicator block */}
                      <div className="flex justify-between items-center">
                        <span className={`text-[8.5px] uppercase font-black px-2 py-0.5 rounded-md ${
                          t.isLiveMimic 
                            ? 'bg-rose-900/40 text-rose-400 border border-rose-500/30' 
                            : 'bg-[#111113] text-[#ccff00]'
                        }`}>
                          {t.isLiveMimic ? '📡 Mimicked Court Commentary' : '📚 Factual Stat Milestone'}
                        </span>
                        {t.isLiveMimic && (
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                            <span className="text-[8px] uppercase font-bold text-rose-400 tracking-wider">LIVE MOCK FEED</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-start gap-2 pt-1">
                        <HelpCircle size={14} className="text-[#ccff00] flex-shrink-0 mt-0.5" />
                        <h4 className="text-xs font-extrabold leading-normal text-white">{t.question}</h4>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                        {t.options.map((option: string) => {
                          const isCorrectOpt = result?.correctAnswer === option;
                          const isWrongSelect = hasAnswered && selectedTriviaOption[t.id] === option && !isCorrectOpt;

                          return (
                            <button
                              key={option}
                              onClick={() => handleTriviaAnswer(t.id, option)}
                              disabled={hasAnswered}
                              className={`text-[11px] text-left p-2.5 rounded-xl border font-bold transition-all ${
                                hasAnswered
                                  ? isCorrectOpt
                                    ? 'bg-[#15341c] text-[#00e676] border-[#00e676]'
                                    : isWrongSelect
                                      ? 'bg-[#3b1717] text-[#ef4444] border-[#ef4444]'
                                      : 'bg-[#18181c] text-[#71717a] border-[#222225]'
                                  : 'bg-[#121214] hover:bg-[#19191d] border-[#2c2c34] text-white'
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>

                      {/* Result / Explanation */}
                      {hasAnswered && (
                        <div className="bg-[#121214] p-3 rounded-xl border border-[#26262b] text-[10px] space-y-1.5 animate-fadeIn">
                          <p className={`font-black uppercase tracking-wide flex items-center gap-1 ${
                            result.correct ? 'text-[#00e676]' : 'text-[#ef4444]'
                          }`}>
                            {result.correct ? '🔥 Correct! +50 XP' : '❌ Incorrect'}
                          </p>
                          <p className="text-[#a3a3b3] leading-relaxed font-semibold">{result.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3.5: XP MARKETPLACE / CHECKOUT */}
          {activeTab === 'xp-shop' && (
            <div className="space-y-4">
              <div className="bg-[#202025] border border-[#34343d] rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs uppercase font-black tracking-wider text-[#ccff00] flex items-center gap-1.5">
                    <ShoppingBag size={14} /> XP Shop & Insurance Check
                  </h3>
                  <div className="text-[10px] bg-[#ccff00]/10 text-[#ccff00] font-black px-2 py-1 rounded-full border border-[#ccff00]/30 mr-1">
                    {userXP} XP Balance
                  </div>
                </div>

                <p className="text-[11px] text-[#a3a3b3] leading-relaxed">
                  Redeem your hard earned trivia expertise to purchase unique bonuses! Your items will automatically display on the Roster & Draft interface so you can apply them.
                </p>

                {purchaseStatus && (
                  <div className="p-2.5 bg-[#121215] rounded-xl border border-[#ccff00]/30 text-[10px] font-bold text-center">
                    {purchaseStatus}
                  </div>
                )}

                {/* Items collection */}
                <div className="space-y-3 font-sans">
                  {/* Item 1 */}
                  <div className="bg-[#141416] p-3.5 rounded-xl border border-[#2b2b32] flex justify-between items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-white">GOAT Nightly Insurance</span>
                        <span className="text-[8px] font-black bg-rose-900/30 text-rose-400 px-1 py-0.5 rounded uppercase">Safety</span>
                      </div>
                      <p className="text-[9.5px] text-[#a3a3b3] leading-normal">
                        Protects your active lock record even if your GOAT selection hits on ejections, limited minutes, or low final score.
                      </p>
                    </div>
                    <button 
                      onClick={() => handlePurchaseItem('goat_insurance', 150, 'GOAT Nightly Insurance')}
                      className="bg-[#ccff00] text-black hover:bg-[#b5e000] font-black uppercase text-[9.5px] px-3.5 py-2.5 rounded-lg transition-all"
                    >
                      150 XP
                    </button>
                  </div>

                  {/* Item 2 */}
                  <div className="bg-[#141416] p-3.5 rounded-xl border border-[#2b2b32] flex justify-between items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-white">Stat Offset Booster (+2 PTS)</span>
                        <span className="text-[8px] font-black bg-[#ccff00]/20 text-[#ccff00] px-1 py-0.5 rounded uppercase">Power-Up</span>
                      </div>
                      <p className="text-[9.5px] text-[#a3a3b3] leading-normal">
                        Grants a +2 Points offset added directly onto your drafted player projection in aggregate game locks!
                      </p>
                    </div>
                    <button 
                      onClick={() => handlePurchaseItem('stat_offset', 100, 'Stat Offset Booster')}
                      className="bg-[#ccff00] text-black hover:bg-[#b5e000] font-black uppercase text-[9.5px] px-3.5 py-2.5 rounded-lg transition-all"
                    >
                      100 XP
                    </button>
                  </div>

                  {/* Item 3 */}
                  <div className="bg-[#141416] p-3.5 rounded-xl border border-[#2b2b32] flex justify-between items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-white">Crown Fan Badge</span>
                        <span className="text-[8px] font-black bg-violet-900/30 text-violet-400 px-1 py-0.5 rounded uppercase">Cosmetic</span>
                      </div>
                      <p className="text-[9.5px] text-[#a3a3b3] leading-normal">
                        Instantly displays a gleaming star badge next to your profile in the Live Fan Zone and Standings lobbies.
                      </p>
                    </div>
                    <button 
                      onClick={() => handlePurchaseItem('crown_badge', 75, 'Crown Fan Badge')}
                      className="bg-[#ccff00] text-black hover:bg-[#b5e000] font-black uppercase text-[9.5px] px-3.5 py-2.5 rounded-lg transition-all"
                    >
                      75 XP
                    </button>
                  </div>
                </div>
              </div>

              {/* Inventory items */}
              <div className="bg-[#202025] border border-[#34343d] rounded-2xl p-4 space-y-3">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-white flex items-center gap-1.5 pt-1">
                  <ShieldCheck size={14} className="text-[#ccff00]" /> Purchased Power-Up Inventory
                </h3>
                {purchases.length === 0 ? (
                  <p className="text-[10px] text-zinc-500 italic">No purchased items in your lock companion today. Spend XP above!</p>
                ) : (
                  <div className="space-y-2">
                    {purchases.map((p) => (
                      <div key={p.id} className="bg-[#121214] p-3 rounded-xl border border-[#2b2b32] flex justify-between items-center text-[10.5px]">
                        <span className="font-bold text-white flex items-center gap-1">
                          🎁 {p.itemName} 
                        </span>
                        <span className="text-[9px] text-[#ccff00] uppercase font-black">Active in wallet</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: FAN ZONE / LIVE CHAT */}
          {activeTab === 'chat' && (
            <div className="space-y-4 flex flex-col h-[520px] justify-between">
              
              {/* Chat Log lists */}
              <div className="space-y-3 flex-grow overflow-y-auto pr-1">
                {chats.map((c, index) => (
                  <div key={index} className="bg-[#202025] rounded-xl p-3 border border-[#2b2b32] space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-black text-[#ccff00]">{c.username}</span>
                        {purchases.some(p => p.username === c.username && p.itemId === 'crown_badge') && (
                          <Sparkles size={10} className="text-yellow-400" />
                        )}
                      </div>
                      <span className="text-[9px] opacity-40 font-mono">{c.time}</span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">{c.text}</p>
                    
                    {/* Share highlight integration block */}
                    {c.videoUrl && (
                      <div className="bg-[#121214] border border-[#2c2c31] p-2 rounded-lg flex items-center justify-between text-[10px] text-white">
                        <div className="flex items-center gap-1.5">
                          <Video size={12} className="text-[#ccff00]" />
                          <span className="truncate max-w-[140px] font-mono">{c.videoUrl}</span>
                        </div>
                        <a 
                          href={c.videoUrl} 
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          className="bg-[#ccff00] text-black px-2 py-0.5 rounded font-black uppercase text-[8px]"
                        >
                          Play Clip
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Send Input Box */}
              <form onSubmit={handleSendChat} className="bg-[#111113] p-3 border border-[#2d2d34] rounded-2xl gap-2 flex flex-col">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Talk statistics, drafts, trivia..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="bg-[#202025] text-xs px-3.5 py-2.5 rounded-xl outline-none flex-grow border border-[#2b2b32] text-white focus:border-[#ccff00]"
                  />
                  <button 
                    type="submit"
                    className="bg-[#ccff00] text-black px-4 rounded-xl flex items-center justify-center font-bold"
                  >
                    <Send size={14} />
                  </button>
                </div>
                
                {/* Integration input to append play reactions */}
                <div className="flex gap-1.5 items-center bg-[#1d1d21] p-1.5 rounded-lg border border-[#26262c]">
                  <Video size={11} className="text-[#ccff00] ml-1" />
                  <input
                    type="text"
                    placeholder="Paste NBA highlight URL to share video play..."
                    value={chatVideoUrl}
                    onChange={(e) => setChatVideoUrl(e.target.value)}
                    className="bg-transparent text-[10px] w-full outline-none text-[#a3a3b3] placeholder-[#555]"
                  />
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: Cole's CSV Laboratory */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              <div className="bg-[#202025] border border-[#34343d] rounded-2xl p-4 space-y-3">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-[#ccff00] flex items-center gap-1.5">
                  <Upload size={14} /> Real-World Data CSV Loader
                </h3>
                <p className="text-[11px] text-[#a3a3b3] leading-relaxed">
                  Connect files from <code className="bg-[#121214] px-1 py-0.5 rounded">C:\Users\Cole\data\Real_World_Data</code> into our simulated MongoDB environment. Pasting player metrics below processes rosters immediately.
                </p>

                {/* Example format */}
                <div className="bg-[#121214] p-2.5 rounded-xl border border-[#222227] text-[10px] font-mono text-white/50 leading-loose">
                  <span className="text-[#ccff00]">Roster format:</span><br />
                  Player,Team,Pos,PTS,REB,AST,STL,BLK,FG%,3P%<br />
                  Michael Jordan,Bulls,G,30.1,6.2,5.3,2.3,0.8,49.7%,32.7%
                </div>

                <form onSubmit={handleCSVImport} className="space-y-3">
                  <textarea
                    rows={6}
                    placeholder="Paste your NBA Real_World_Data CSV lines here..."
                    value={csvFileContent}
                    onChange={(e) => setCsvFileContent(e.target.value)}
                    className="bg-[#121214] border border-[#2c2c35] p-3 text-xs w-full rounded-xl font-mono text-[#ccff00] focus:border-[#ccff00] outline-none"
                  />
                  
                  <button 
                    type="submit"
                    disabled={isUploading}
                    className="w-full bg-[#ccff00] font-black text-black text-xs py-2.5 tracking-wider uppercase rounded-xl hover:bg-[#b5e000] transition-colors disabled:opacity-40"
                  >
                    {isUploading ? 'SAVING DATA TO MONGODB...' : 'OVERWRITE DB WITH CSV'}
                  </button>
                </form>

                {csvUploadStatus && (
                  <div className="bg-[#121214] p-3 rounded-xl border border-[#2b2b32] text-[10px] flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#00e676]">
                    <Check size={12} /> {csvUploadStatus}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM ESPN/DRAFTKINGS MOBILE APP BAR */}
        <div className="bg-[#111113] border-t border-[#2d2d34] flex justify-around py-3 px-2 z-10">
          <button 
            onClick={() => setActiveTab('draft')}
            className={`flex flex-col items-center gap-1 transition-all flex-1 ${
              activeTab === 'draft' ? 'text-[#ccff00]' : 'text-[#71717a] hover:text-[#a3a3b3]'
            }`}
          >
            <Tv size={16} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Draft</span>
          </button>

          <button 
            onClick={() => setActiveTab('standings')}
            className={`flex flex-col items-center gap-1 transition-all flex-1 ${
              activeTab === 'standings' ? 'text-[#ccff00]' : 'text-[#71717a] hover:text-[#a3a3b3]'
            }`}
          >
            <Trophy size={16} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Lobby</span>
          </button>

          <button 
            onClick={() => setActiveTab('xp-shop')}
            className={`flex flex-col items-center gap-1 transition-all flex-1 ${
              activeTab === 'xp-shop' ? 'text-[#ccff00]' : 'text-[#71717a] hover:text-[#a3a3b3]'
            }`}
          >
            <ShoppingBag size={16} />
            <span className="text-[9px] uppercase font-bold tracking-wider">XP Shop</span>
          </button>

          <button 
            onClick={() => setActiveTab('trivia')}
            className={`flex flex-col items-center gap-1 transition-all flex-1 ${
              activeTab === 'trivia' ? 'text-[#ccff00]' : 'text-[#71717a] hover:text-[#a3a3b3]'
            }`}
          >
            <HelpCircle size={16} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Trivia</span>
          </button>

          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-1 transition-all flex-1 ${
              activeTab === 'chat' ? 'text-[#ccff00]' : 'text-[#71717a] hover:text-[#a3a3b3]'
            }`}
          >
            <MessageSquare size={16} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Zone</span>
          </button>

          <button 
            onClick={() => setActiveTab('csv')}
            className={`flex flex-col items-center gap-1 transition-all flex-1 ${
              activeTab === 'csv' ? 'text-[#ccff00]' : 'text-[#71717a] hover:text-[#a3a3b3]'
            }`}
          >
            <FileText size={16} />
            <span className="text-[9px] uppercase font-bold tracking-wider">CSV Lab</span>
          </button>
        </div>

      </div>
    </div>
  );
}

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
  Video
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'draft' | 'standings' | 'trivia' | 'chat' | 'csv'>('draft');
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
  
  // Interaction State
  const [selectedTriviaOption, setSelectedTriviaOption] = useState<{ [key: string]: string }>({});
  const [triviaResult, setTriviaResult] = useState<{ [key: string]: { correct: boolean, explanation: string, correctAnswer: string } }>({});
  const [isMiningTrivia, setIsMiningTrivia] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatVideoUrl, setChatVideoUrl] = useState<string>('');
  const [userVote, setUserVote] = useState<string>('');
  const [csvUploadStatus, setCsvUploadStatus] = useState<string>('');
  const [csvFileContent, setCsvFileContent] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Poll intervals
  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(() => {
      fetchPicks();
      fetchChats();
      fetchLeaderboard();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

  // Mine fresh fact-based trivia using Gemini
  const handleMineTrivia = async () => {
    setIsMiningTrivia(true);
    try {
      const res = await fetch('/api/trivia/mine', { method: 'POST' });
      const data = await res.json();
      if (data.trivia) {
        setTrivia(data.trivia);
        alert('Gemini successfully mined custom statistical trivia from your player list!');
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error('Failed to trigger trivia generation:', err);
    } finally {
      setIsMiningTrivia(false);
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
            
            {/* User Profile Info section */}
            <div className="flex items-center gap-2">
              {isEditingUser ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="text" 
                    value={tempUsername} 
                    onChange={(e) => setTempUsername(e.target.value)}
                    className="bg-[#2a2a30] text-xs px-2 py-1 rounded border border-[#ccff00] outline-none w-20 text-center"
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
                </div>
              )}
            </div>
          </div>

          {/* Hot ticker showing quick info */}
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#a3a3b3] bg-[#1d1d21] px-2 py-1.5 rounded-md mt-1 overflow-x-auto whitespace-nowrap scrollbar-none">
            <span className="text-[#ccff00]">LIVE UPDATED:</span>
            <span>🔥 {picks.length} Fans picked their GOAT</span>
            <span className="opacity-30">|</span>
            <span>🏀 {players.length} Players ready</span>
          </div>
        </div>

        {/* Dynamic Canvas Area */}
        <div className="flex-grow overflow-y-auto px-4 py-4 space-y-4 max-h-[calc(100vh-140px)] md:max-h-[700px] scrollbar-hide">
          
          {/* TAB 1: DRAFT ROOM */}
          {activeTab === 'draft' && (
            <div className="space-y-4">
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
                  <span className="text-[9px] text-[#a3a3b3]">Click stat bars to discover advanced charts</span>
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
                            <div className="text-sm font-bold text-white">{player.pts}</div>
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
                        <div>
                          <p className="text-xs font-black">{user.username}</p>
                          <p className="text-[10px] opacity-40 text-[#a3a3b3]">{user.picksCount} active nightly picks</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-[#ccff00] font-mono">{user.score} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRIVIA */}
          {activeTab === 'trivia' && (
            <div className="space-y-4">
              
              {/* AI generator laboratory callout */}
              <div className="bg-gradient-to-r from-[#202025] to-[#2c2c36] border border-[#3e3e4a] p-4 rounded-2xl flex flex-col items-center text-center gap-3 relative overflow-hidden">
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#ccff00]/10 text-[#ccff00] text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-[#ccff00]/20">
                  <Cpu size={8} /> AI Active
                </div>
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-white">Dynamic Trivia Miner</h3>
                <p className="text-[10px] text-[#a3a3b3] leading-normal max-w-sm">
                  Click below to trigger the server-side Gemini 3.5 AI. It will analyze your live players lists and formulate fresh fact-based challenges.
                </p>
                <button 
                  onClick={handleMineTrivia}
                  disabled={isMiningTrivia}
                  className="bg-[#ccff00] hover:bg-[#b5e000] text-black font-black uppercase text-[10px] px-4 py-2.5 rounded-xl transition-all tracking-wider disabled:opacity-40"
                >
                  {isMiningTrivia ? 'AI MINING STATISTICS...' : 'MINE NEW AI TRIVIA'}
                </button>
              </div>

              {/* Active list */}
              <div className="space-y-3">
                {trivia.map((t, tIndex) => {
                  const result = triviaResult[t.id];
                  const hasAnswered = !!result;

                  return (
                    <div key={t.id} className="bg-[#202025] border border-[#32323a] rounded-2xl p-4 gap-3 flex flex-col">
                      <div className="flex items-start gap-2">
                        <HelpCircle size={14} className="text-[#ccff00] flex-shrink-0 mt-0.5" />
                        <h4 className="text-xs font-extrabold leading-normal">{t.question}</h4>
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
                          <p className="text-[#a3a3b3] leading-relaxed font-medium">{result.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: FAN CONE / LIVE CHAT & VIDEO */}
          {activeTab === 'chat' && (
            <div className="space-y-4 flex flex-col h-[520px] justify-between">
              
              {/* Chat Log lists */}
              <div className="space-y-3 flex-grow overflow-y-auto pr-1">
                {chats.map((c, index) => (
                  <div key={index} className="bg-[#202025] rounded-xl p-3 border border-[#2b2b32] space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black text-[#ccff00]">{c.username}</span>
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
                    placeholder="Talk statistics, drafts..."
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

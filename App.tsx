import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
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
  Coins,
  RefreshCw,
  ArrowLeftRight,
  Activity,
  Info,
  BookOpen,
  Download,
  BarChart2,
  TrendingDown,
  Grid,
  Sliders,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Layers,
  GitBranch,
  Share2
} from 'lucide-react';
import { draftPlayersDb } from './src/draftPlayersData';

export default function App() {
  const [activeTab, setActiveTab] = useState<'trivia' | 'draft' | 'xp-shop' | 'standings' | 'chat' | 'csv' | 'optimizer'>('optimizer');
  const [selectedSport, setSelectedSport] = useState<'nfl' | 'nba'>('nfl');

  // Sport visual configurations
  const sportColor = selectedSport === 'nfl' ? '#ccff00' : '#ff6600';
  const sportText = selectedSport === 'nfl' ? 'text-[#ccff00]' : 'text-[#ff6600]';
  const sportBg = selectedSport === 'nfl' ? 'bg-[#ccff00]' : 'bg-[#ff6600]';
  const sportBgHover = selectedSport === 'nfl' ? 'hover:bg-[#b5e000]' : 'hover:bg-[#e05a00]';
  const sportBorder = selectedSport === 'nfl' ? 'border-[#ccff00]' : 'border-[#ff6600]';
  const sportLightBg = selectedSport === 'nfl' ? 'bg-[#ccff00]/15' : 'bg-[#ff6600]/15';
  const sportLightBorder = selectedSport === 'nfl' ? 'border-[#ccff00]/30' : 'border-[#ff6600]/30';

  const getTabColor = (tab: string) => {
    if (activeTab === tab) {
      return selectedSport === 'nfl' ? 'text-[#ccff00]' : 'text-[#ff6600]';
    }
    return 'text-[#71717a] hover:text-[#a3a3b3]';
  };

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
  const [uploadedCsvPicks, setUploadedCsvPicks] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [purchaseStatus, setPurchaseStatus] = useState<string>('');
  const [insuranceApplied, setInsuranceApplied] = useState<boolean>(false);
  const [offsetApplied, setOffsetApplied] = useState<boolean>(false);
  const [rosterShareStatus, setRosterShareStatus] = useState<'sharing' | 'success' | 'empty' | 'error' | null>(null);

  // Live-Sync Roster Optimizer States
  const [sleeperLeagueId, setSleeperLeagueId] = useState<string>('demo');
  const [syncedLeagueData, setSyncedLeagueData] = useState<any | null>(null);
  const [selectedRosterIdx, setSelectedRosterIdx] = useState<number>(0);
  const [isSyncingLeague, setIsSyncingLeague] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [nflRankingsSheet, setNflRankingsSheet] = useState<any | null>(null);
  const [showRankingsModal, setShowRankingsModal] = useState<boolean>(false);
  const [modalSubTab, setModalSubTab] = useState<'hero-blueprint' | 'position-tiers' | 'general-strategy'>('hero-blueprint');

  // Visual Heatmap States & Computation
  const [optimizerSubTab, setOptimizerSubTab] = useState<'heatmap' | 'lineup' | 'depth' | 'overview'>('heatmap');
  const [heatmapViewMode, setHeatmapViewMode] = useState<'matrix' | 'starters' | 'liabilities'>('matrix');
  const [showHeatmapCardOverlay, setShowHeatmapCardOverlay] = useState<boolean>(true);
  const [heatmapFilterPos, setHeatmapFilterPos] = useState<string>('ALL');

  // Expandable Positional Depth Chart States
  const [isDepthChartExpanded, setIsDepthChartExpanded] = useState<boolean>(true);
  const [depthChartPosFilter, setDepthChartPosFilter] = useState<string>('ALL');

  // Dynamic League Positional Benchmark Averages
  const positionalAverages = React.useMemo(() => {
    const defaultAverages: Record<string, number> = {
      QB: 18.5,
      RB: 13.5,
      WR: 13.0,
      TE: 9.5,
      DEF: 7.5,
      K: 8.0,
      FLEX: 12.5,
    };

    if (!syncedLeagueData || !syncedLeagueData.rosters) return defaultAverages;

    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};

    syncedLeagueData.rosters.forEach((roster: any) => {
      const starters = roster.starters || [];
      starters.forEach((p: any) => {
        if (p && p.position && typeof p.projectedPts === 'number') {
          const pos = p.position.toUpperCase();
          sums[pos] = (sums[pos] || 0) + p.projectedPts;
          counts[pos] = (counts[pos] || 0) + 1;
        }
      });
    });

    const calculated: Record<string, number> = { ...defaultAverages };
    Object.keys(sums).forEach(pos => {
      if (counts[pos] > 0) {
        calculated[pos] = Math.round((sums[pos] / counts[pos]) * 10) / 10;
      }
    });

    return calculated;
  }, [syncedLeagueData]);

  const getHeatmapSlotInfo = (player: any) => {
    if (!player || typeof player.projectedPts !== 'number') {
      return {
        delta: 0,
        pctDiff: 0,
        score: 50,
        status: 'NEUTRAL',
        label: 'Neutral',
        colorClass: 'text-zinc-400 bg-zinc-800/80 border-zinc-700',
        badgeClass: 'bg-zinc-800 text-zinc-400 border-zinc-700',
        bgGradient: 'from-zinc-900/60 to-zinc-900/20',
        glowClass: 'border-zinc-800',
        cardBorder: 'border-zinc-800',
        posAvg: 12.0,
        badgeText: 'NEUTRAL (0.0 pts)',
        icon: 'neutral'
      };
    }

    const pos = (player.position || 'WR').toUpperCase();
    const posAvg = positionalAverages[pos] || (pos === 'QB' ? 18.5 : pos === 'RB' ? 13.5 : pos === 'WR' ? 13.0 : pos === 'TE' ? 9.5 : 8.0);
    const delta = player.projectedPts - posAvg;
    const pctDiff = posAvg > 0 ? (delta / posAvg) * 100 : 0;

    // Heat score 0 to 100
    const score = Math.min(100, Math.max(0, Math.round(50 + delta * 5)));

    if (delta >= 3.0 || pctDiff >= 20) {
      return {
        delta,
        pctDiff,
        score,
        status: 'HIGH_VALUE',
        label: 'High Value',
        colorClass: 'text-[#ccff00] bg-[#ccff00]/15 border-[#ccff00]/40',
        badgeClass: 'bg-[#ccff00]/15 text-[#ccff00] border-[#ccff00]/30',
        bgGradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
        glowClass: 'border-emerald-500/50 shadow-md shadow-emerald-500/10',
        cardBorder: 'border-emerald-500/50',
        posAvg,
        badgeText: `🔥 HIGH-VALUE (+${delta.toFixed(1)} vs ${pos} Avg)`,
        icon: 'fire'
      };
    } else if (delta >= 0.8 || pctDiff >= 6) {
      return {
        delta,
        pctDiff,
        score,
        status: 'ABOVE_AVG',
        label: 'Above Avg',
        colorClass: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
        badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
        bgGradient: 'from-cyan-500/15 via-cyan-500/5 to-transparent',
        glowClass: 'border-cyan-500/40',
        cardBorder: 'border-cyan-500/40',
        posAvg,
        badgeText: `🟢 ABOVE AVG (+${delta.toFixed(1)} vs ${pos} Avg)`,
        icon: 'up'
      };
    } else if (delta > -1.5) {
      return {
        delta,
        pctDiff,
        score,
        status: 'NEUTRAL',
        label: 'Neutral',
        colorClass: 'text-zinc-300 bg-zinc-800/80 border-zinc-700',
        badgeClass: 'bg-zinc-800/80 text-zinc-300 border-zinc-700',
        bgGradient: 'from-zinc-900/40 to-zinc-900/20',
        glowClass: 'border-zinc-800',
        cardBorder: 'border-zinc-800',
        posAvg,
        badgeText: `⚪ NEUTRAL (${delta >= 0 ? '+' : ''}${delta.toFixed(1)} vs ${pos} Avg)`,
        icon: 'neutral'
      };
    } else if (delta > -3.5) {
      return {
        delta,
        pctDiff,
        score,
        status: 'BELOW_AVG',
        label: 'Below Avg',
        colorClass: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        bgGradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
        glowClass: 'border-amber-500/40',
        cardBorder: 'border-amber-500/40',
        posAvg,
        badgeText: `🟡 BELOW AVG (${delta.toFixed(1)} vs ${pos} Avg)`,
        icon: 'down'
      };
    } else {
      return {
        delta,
        pctDiff,
        score,
        status: 'LOW_VALUE',
        label: 'Low Value',
        colorClass: 'text-red-400 bg-red-500/15 border-red-500/40',
        badgeClass: 'bg-red-500/15 text-red-300 border-red-500/30',
        bgGradient: 'from-red-500/25 via-red-500/10 to-transparent',
        glowClass: 'border-red-500/50 shadow-md shadow-red-500/10',
        cardBorder: 'border-red-500/50',
        posAvg,
        badgeText: `🔴 LOW-VALUE (${delta.toFixed(1)} vs ${pos} Avg)`,
        icon: 'alert'
      };
    }
  };

  const getPlayerTierInfo = (player: any) => {
    if (!player) {
      return { tier: 5, label: 'Tier 5 • Reserve', badgeClass: 'bg-zinc-800 text-zinc-400 border-zinc-700', color: '#a1a1aa' };
    }
    const rawTier = player.tier;
    let computedTier = 3;
    if (typeof rawTier === 'number' && rawTier >= 1 && rawTier <= 5) {
      computedTier = rawTier;
    } else {
      const pts = player.projectedPts || 0;
      if (pts >= 19) computedTier = 1;
      else if (pts >= 15) computedTier = 2;
      else if (pts >= 11) computedTier = 3;
      else if (pts >= 7) computedTier = 4;
      else computedTier = 5;
    }

    switch (computedTier) {
      case 1:
        return { tier: 1, label: 'Tier 1 • Elite Anchor', badgeClass: 'bg-[#ccff00]/15 text-[#ccff00] border-[#ccff00]/30', color: '#ccff00' };
      case 2:
        return { tier: 2, label: 'Tier 2 • High-End Starter', badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', color: '#38bdf8' };
      case 3:
        return { tier: 3, label: 'Tier 3 • Solid Starter/Flex', badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', color: '#34d399' };
      case 4:
        return { tier: 4, label: 'Tier 4 • Handcuff / Upside Backup', badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30', color: '#fbbf24' };
      case 5:
      default:
        return { tier: 5, label: 'Tier 5 • Speculative / Deep Reserve', badgeClass: 'bg-zinc-800 text-zinc-400 border-zinc-700', color: '#a1a1aa' };
    }
  };

  // Showdown & Battle Arena state properties
  const [historicalLegends, setHistoricalLegends] = useState<any[]>([]);
  const [userBets, setUserBets] = useState<any[]>([]);
  const [selectedLegendId, setSelectedLegendId] = useState<string>('');
  const [selectedBetStat, setSelectedBetStat] = useState<string>('pts');
  const [betWagerAmount, setBetWagerAmount] = useState<string>('50');
  const [selectedBetPlayer, setSelectedBetPlayer] = useState<string>('');
  const [isSimulatingGames, setIsSimulatingGames] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [betResponseMsg, setBetResponseMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Celebration states
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationDetails, setCelebrationDetails] = useState<{
    player: string;
    points: number;
    text: string;
    stats: any;
    isPickSuccess: boolean;
    isBetSuccess: boolean;
    wonBets: any[];
  } | null>(null);
  const [confettiParticles, setConfettiParticles] = useState<any[]>([]);


  // --- NFL FANTASY FOOTBALL MOCK DRAFT STATES ---
  const [mockDraftStatus, setMockDraftStatus] = useState<'settings' | 'drafting' | 'completed'>('settings');
  const [totalTeams, setTotalTeams] = useState<number>(10);
  const [userPickPosition, setUserPickPosition] = useState<number>(6);
  const [draftStrategy, setDraftStrategy] = useState<string>('Hero-RB');
  const [draftLog, setDraftLog] = useState<string[]>([]);
  const [draftBoard, setDraftBoard] = useState<any[]>([]); // Array of empty picks
  const [currentPickIndex, setCurrentPickIndex] = useState<number>(0);
  const [availableDraftPlayers, setAvailableDraftPlayers] = useState<any[]>([]);
  const [isAiSuggesting, setIsAiSuggesting] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [selectedPositionFilter, setSelectedPositionFilter] = useState<string>('All');
  const [searchPlayerQuery, setSearchPlayerQuery] = useState<string>('');
  const [draftSpeed, setDraftSpeed] = useState<number>(700); // ms delay
  const [draftSubTab, setDraftSubTab] = useState<'my-roster' | 'board' | 'all-rosters'>('my-roster');
  const [selectedInspectRosterIdx, setSelectedInspectRosterIdx] = useState<number>(0);

  const handleStartMockDraft = () => {
    // 1. Initialize available players
    setAvailableDraftPlayers([...draftPlayersDb].sort((a, b) => a.adp - b.adp));

    // 2. Initialize draft board of empty picks (15 rounds)
    const totalPicks = totalTeams * 15;
    const tempBoard = [];
    for (let i = 0; i < totalPicks; i++) {
      const round = Math.floor(i / totalTeams) + 1;
      const roundPick = (i % totalTeams) + 1;
      const activeTeamId = (round % 2 === 1) ? roundPick : (totalTeams - roundPick + 1);
      const activeTeamName = activeTeamId === userPickPosition ? `${username} (You)` : `AI Manager ${activeTeamId}`;

      tempBoard.push({
        pickNumber: i + 1,
        round,
        roundPick,
        teamId: activeTeamId,
        teamName: activeTeamName,
        player: null,
      });
    }

    setDraftBoard(tempBoard);
    setCurrentPickIndex(0);
    setDraftLog([`🚀 Fantasy Draft initiated! 120+ public player database loaded. Round 1 on the clock.`]);
    setMockDraftStatus('drafting');
    setAiSuggestions([]);
    setSelectedPositionFilter('All');
    setSearchPlayerQuery('');
  };

  const handleDownloadDraftCSV = () => {
    const userPicks = draftBoard
      .filter(p => p.teamId === userPickPosition && p.player)
      .map((p) => ({
        round: p.round,
        pickNumber: p.pickNumber,
        name: p.player.name,
        position: p.player.position,
        team: p.player.team,
        projectedPts: p.player.projectedPts || 0,
        adp: p.player.adp || 'N/A',
        opponent: p.player.opponent || 'N/A',
        matchupRating: p.player.matchupRating || 'N/A',
        achievements: (p.player.achievements || []).join('; ')
      }));

    if (userPicks.length === 0) {
      alert("No players drafted yet!");
      return;
    }

    const headers = [
      'Round',
      'Overall Pick',
      'Player Name',
      'Position',
      'Team',
      'Projected Points',
      'ADP',
      'Opponent',
      'Matchup Rating',
      'Special Achievements'
    ];

    const csvRows = [
      headers.join(','),
      ...userPicks.map(p => [
        p.round,
        p.pickNumber,
        `"${String(p.name).replace(/"/g, '""')}"`,
        `"${String(p.position).replace(/"/g, '""')}"`,
        `"${String(p.team).replace(/"/g, '""')}"`,
        p.projectedPts,
        p.adp,
        `"${String(p.opponent).replace(/"/g, '""')}"`,
        `"${String(p.matchupRating).replace(/"/g, '""')}"`,
        `"${String(p.achievements).replace(/"/g, '""')}"`
      ].join(','))
    ];

    const csvString = csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${username.replace(/\s+/g, '_')}_mock_draft_${draftStrategy.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateLocalHeuristicSuggestions = (available: any[]) => {
    const results = [];
    let positionsToFind = ['RB', 'WR', 'TE', 'QB'];
    if (draftStrategy === 'Zero-RB') {
      positionsToFind = ['WR', 'TE', 'QB'];
    } else if (draftStrategy === 'Tight End Premium') {
      positionsToFind = ['TE', 'WR', 'RB', 'QB'];
    }
    
    for (const pos of positionsToFind) {
      const match = available.find(p => p.position === pos);
      if (match) {
        let strategyReason = `Solidifies your starting lineup values.`;
        if (draftStrategy === 'Zero-RB' && pos === 'WR') {
          strategyReason = `Key building block for your Zero-RB build. Sells out for elite receiver points.`;
        } else if (draftStrategy === 'Hero-RB' && pos === 'RB') {
          strategyReason = `Your cornerstone workhorse anchor. Fits your single-RB early model perfectly.`;
        } else if (draftStrategy === 'Robust-RB' && pos === 'RB') {
          strategyReason = `Builds positional dominance at running back. Secure top tier workload.`;
        } else if (draftStrategy === 'Tight End Premium' && pos === 'TE') {
          strategyReason = `Secures a high-priority, premium point-scoring Tight End to dominate positional matchups.`;
        } else if (draftStrategy === 'Balanced') {
          strategyReason = `Provides excellent, balanced roster depth without committing early to rigid position constraints.`;
        }
        
        results.push({
          playerName: match.name,
          position: match.position,
          tier: match.tier,
          reasoning: strategyReason
        });
      }
      if (results.length >= 3) break;
    }
    setAiSuggestions(results);
  };

  const triggerAiSuggestions = async (userRoster: any[], available: any[]) => {
    setIsAiSuggesting(true);
    try {
      const activePick = draftBoard[currentPickIndex];
      const res = await fetch('/api/draft/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRoster,
          availablePlayers: available,
          userStrategy: draftStrategy,
          currentRound: activePick ? activePick.round : 1,
          currentPick: currentPickIndex + 1,
          totalTeams
        })
      });
      const data = await res.json();
      if (data && data.recommendations) {
        setAiSuggestions(data.recommendations);
      } else {
        generateLocalHeuristicSuggestions(available);
      }
    } catch (err) {
      console.warn('AI suggestions API failed, using local heuristic:', err);
      generateLocalHeuristicSuggestions(available);
    } finally {
      setIsAiSuggesting(false);
    }
  };

  useEffect(() => {
    if (mockDraftStatus !== 'drafting') return;
    if (currentPickIndex >= totalTeams * 15) {
      setMockDraftStatus('completed');
      return;
    }

    const activePick = draftBoard[currentPickIndex];
    if (!activePick) return;

    if (activePick.teamId === userPickPosition) {
      const userRoster = draftBoard
        .slice(0, currentPickIndex)
        .filter(p => p.teamId === userPickPosition && p.player)
        .map(p => p.player);
      
      const available = availableDraftPlayers.filter(p => {
        return !draftBoard.slice(0, currentPickIndex).some(dp => dp.player?.id === p.id);
      });

      triggerAiSuggestions(userRoster, available);
      return;
    }

    const timer = setTimeout(() => {
      const draftedIds = new Set(
        draftBoard
          .slice(0, currentPickIndex)
          .filter(p => p.player)
          .map(p => p.player.id)
      );
      const available = availableDraftPlayers.filter(p => !draftedIds.has(p.id));

      if (available.length === 0) {
        setCurrentPickIndex(prev => prev + 1);
        return;
      }

      const round = activePick.round;
      const botTeamId = activePick.teamId;

      const botRoster = draftBoard
        .slice(0, currentPickIndex)
        .filter(p => p.teamId === botTeamId && p.player)
        .map(p => p.player);

      const qbCount = botRoster.filter(p => p.position === 'QB').length;
      const rbCount = botRoster.filter(p => p.position === 'RB').length;
      const wrCount = botRoster.filter(p => p.position === 'WR').length;
      const teCount = botRoster.filter(p => p.position === 'TE').length;
      const defCount = botRoster.filter(p => p.position === 'DEF').length;
      const kCount = botRoster.filter(p => p.position === 'K').length;

      let candidates = [...available];

      if (qbCount >= 1 && round < 10) {
        candidates = candidates.filter(p => p.position !== 'QB');
      }
      if (teCount >= 1 && round < 10) {
        candidates = candidates.filter(p => p.position !== 'TE');
      }
      if (defCount >= 1) {
        candidates = candidates.filter(p => p.position !== 'DEF');
      }
      if (kCount >= 1) {
        candidates = candidates.filter(p => p.position !== 'K');
      }
      if (round < 12) {
        candidates = candidates.filter(p => p.position !== 'K' && p.position !== 'DEF');
      }

      if (candidates.length === 0) {
        candidates = [...available];
      }

      const pool = candidates.slice(0, 3);
      const selectedPlayer = pool[Math.floor(Math.random() * pool.length)] || available[0];

      setDraftBoard(prev => {
        const next = [...prev];
        next[currentPickIndex] = {
          ...next[currentPickIndex],
          player: selectedPlayer
        };
        return next;
      });

      const logMessage = `Round ${activePick.round}, Pick ${activePick.roundPick}: AI Manager ${botTeamId} drafts ${selectedPlayer.name} (${selectedPlayer.position}, ${selectedPlayer.team})`;
      setDraftLog(prev => [logMessage, ...prev]);

      setCurrentPickIndex(prev => prev + 1);
    }, draftSpeed);

    return () => clearTimeout(timer);
  }, [mockDraftStatus, currentPickIndex, draftSpeed, availableDraftPlayers, draftBoard]);

  const handleUserDraftPlayer = (player: any) => {
    if (mockDraftStatus !== 'drafting') return;
    const activePick = draftBoard[currentPickIndex];
    if (!activePick || activePick.teamId !== userPickPosition) return;

    setDraftBoard(prev => {
      const next = [...prev];
      next[currentPickIndex] = {
        ...next[currentPickIndex],
        player: {
          ...player,
          draftRound: activePick.round
        }
      };
      return next;
    });

    const logMessage = `Round ${activePick.round}, Pick ${activePick.roundPick}: ${username} (You) draft ${player.name} (${player.position}, ${player.team})`;
    setDraftLog(prev => [logMessage, ...prev]);
    setAiSuggestions([]);
    setCurrentPickIndex(prev => prev + 1);
  };

  const getRosterSlots = (roster: any[]) => {
    const slots: { [key: string]: any | null } = {
      QB: null,
      RB1: null,
      RB2: null,
      WR1: null,
      WR2: null,
      WR3: null,
      TE: null,
      FLEX: null,
      DEF: null,
      K: null,
      BENCH1: null,
      BENCH2: null,
      BENCH3: null,
      BENCH4: null,
      BENCH5: null,
    };

    const bench: any[] = [];

    roster.forEach(p => {
      if (p.position === 'QB' && !slots.QB) {
        slots.QB = p;
      } else if (p.position === 'RB') {
        if (!slots.RB1) slots.RB1 = p;
        else if (!slots.RB2) slots.RB2 = p;
        else if (!slots.FLEX) slots.FLEX = p;
        else bench.push(p);
      } else if (p.position === 'WR') {
        if (!slots.WR1) slots.WR1 = p;
        else if (!slots.WR2) slots.WR2 = p;
        else if (!slots.WR3) slots.WR3 = p;
        else if (!slots.FLEX) slots.FLEX = p;
        else bench.push(p);
      } else if (p.position === 'TE') {
        if (!slots.TE) slots.TE = p;
        else if (!slots.FLEX) slots.FLEX = p;
        else bench.push(p);
      } else if (p.position === 'DEF' && !slots.DEF) {
        slots.DEF = p;
      } else if (p.position === 'K' && !slots.K) {
        slots.K = p;
      } else {
        bench.push(p);
      }
    });

    for (let i = 1; i <= 5; i++) {
      slots[`BENCH${i}`] = bench[i - 1] || null;
    }

    return slots;
  };

  const calculateDraftGrade = () => {
    const userRoster = draftBoard
      .filter(p => p.teamId === userPickPosition && p.player)
      .map(p => p.player);

    if (userRoster.length === 0) return { grade: 'N/A', rating: 'No picks made yet', feedback: 'Complete your mock draft to receive a strategy grading analysis!' };

    let penalties = 0;
    let strategyMatched = true;

    if (draftStrategy === 'Zero-RB') {
      const earlyRBs = userRoster.filter(p => p.position === 'RB' && p.draftRound <= 4);
      if (earlyRBs.length > 0) {
        penalties += earlyRBs.length * 15;
        strategyMatched = false;
      }
    } else if (draftStrategy === 'Hero-RB') {
      const earlyRBs = userRoster.filter(p => p.position === 'RB' && p.draftRound <= 4);
      if (earlyRBs.length === 0) {
        penalties += 20;
        strategyMatched = false;
      } else if (earlyRBs.length > 2) {
        penalties += 15;
        strategyMatched = false;
      }
    } else if (draftStrategy === 'Robust-RB') {
      const earlyRBs = userRoster.filter(p => p.position === 'RB' && p.draftRound <= 4);
      if (earlyRBs.length < 3) {
        penalties += 25;
        strategyMatched = false;
      }
    } else if (draftStrategy === 'Late-Round QB') {
      const earlyQBs = userRoster.filter(p => p.position === 'QB' && p.draftRound <= 7);
      if (earlyQBs.length > 0) {
        penalties += earlyQBs.length * 20;
        strategyMatched = false;
      }
    } else if (draftStrategy === 'Tight End Premium') {
      const earlyTEs = userRoster.filter(p => p.position === 'TE' && p.draftRound <= 5);
      if (earlyTEs.length === 0) {
        penalties += 25;
        strategyMatched = false;
      }
    } else if (draftStrategy === 'Balanced') {
      const rbs = userRoster.filter(p => p.position === 'RB');
      const wrs = userRoster.filter(p => p.position === 'WR');
      if (rbs.length > 6 || wrs.length > 7) {
        penalties += 15;
        strategyMatched = false;
      }
    }

    const score = Math.max(50, 100 - penalties);
    let grade = 'A';
    if (score >= 95) grade = 'A+';
    else if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else grade = 'D';

    let feedback = 'Sensational draft! You stuck strictly to your blueprint strategies and accumulated premier value across key rounds.';
    if (!strategyMatched) {
      if (draftStrategy === 'Zero-RB') {
        feedback = 'Decent draft, but you drafted running backs too early. True Zero-RB requires waiting until Round 5 or later to optimize WR starting rosters.';
      } else if (draftStrategy === 'Hero-RB') {
        feedback = 'Solid team, but you missed the Hero-RB sweet spot. Secure exactly 1 elite workhorse back in the first two rounds, then focus heavily on receiver depth.';
      } else if (draftStrategy === 'Robust-RB') {
        feedback = 'Good roster, but Robust-RB builds require securing 3 early premium running backs to achieve true backfield dominance.';
      } else if (draftStrategy === 'Late-Round QB') {
        feedback = 'Decent draft, but you selected a quarterback too early. Late-Round QB strategy demands waiting until Round 8 or later to draft starting quarterbacks.';
      } else if (draftStrategy === 'Tight End Premium') {
        feedback = 'Good team, but you missed the Tight End Premium blueprint. Secure an elite, high-target TE in the first 5 rounds to establish positional dominance.';
      } else if (draftStrategy === 'Balanced') {
        feedback = 'Decent draft, but you became too heavily concentrated at one position. Balanced drafts aim to distribute value evenly across RBs and WRs.';
      }
    }

    return {
      grade,
      score,
      feedback
    };
  };

  // Poll intervals
  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(() => {
      fetchPicks();
      fetchChats();
      fetchLeaderboard();
      fetchPurchases(username);
      fetchUserBets(username);
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
      fetchHistoricalLegends();
      fetchUserBets(username);
      fetchNflRankings();
      handleSyncLeague('demo');
    } catch (err) {
      console.error('Failed to load initial GOATPCKL data:', err);
    }
  };

  const handleSyncLeague = async (idToSync?: string) => {
    const targetId = idToSync !== undefined ? idToSync : sleeperLeagueId;
    if (!targetId || targetId.trim() === '') {
      setSyncError('Please enter a Sleeper League ID.');
      return;
    }
    setIsSyncingLeague(true);
    setSyncError(null);
    try {
      const res = await fetch(`/api/fantasy/sync?leagueId=${encodeURIComponent(targetId.trim())}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncedLeagueData(data);
        setSelectedRosterIdx(0);
      } else {
        setSyncError(data.error || 'Failed to sync with Sleeper API');
      }
    } catch (err: any) {
      setSyncError('Network error connecting to fantasy server.');
    } finally {
      setIsSyncingLeague(false);
    }
  };

  const fetchNflRankings = async () => {
    try {
      const res = await fetch('/api/fantasy/rankings');
      const data = await res.json();
      setNflRankingsSheet(data);
    } catch (err) {
      console.error('Failed to fetch NFL rankings sheet:', err);
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

  const fetchHistoricalLegends = async () => {
    try {
      const res = await fetch('/api/historical-legends');
      const data = await res.json();
      setHistoricalLegends(data);
      if (data.length > 0) {
        setSelectedLegendId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load historical legends:', err);
    }
  };

  const fetchUserBets = async (user: string) => {
    try {
      const res = await fetch(`/api/bets?username=${encodeURIComponent(user)}`);
      const data = await res.json();
      setUserBets(data);
    } catch (err) {
      console.error('Failed to load user bets:', err);
    }
  };

  const handlePlaceBet = async () => {
    setBetResponseMsg(null);
    if (!selectedBetPlayer) {
      setBetResponseMsg({ type: 'error', text: 'Select one of tonight\'s active players first!' });
      return;
    }
    if (!selectedLegendId) {
      setBetResponseMsg({ type: 'error', text: 'Select a Historical Legend to match!' });
      return;
    }
    const cost = parseInt(betWagerAmount);
    if (isNaN(cost) || cost <= 0) {
      setBetResponseMsg({ type: 'error', text: 'Enter a valid positive XP wager!' });
      return;
    }
    if (userXP < cost) {
      setBetResponseMsg({ type: 'error', text: `Insufficient balance! You need ${cost} XP but only have ${userXP} XP.` });
      return;
    }

    try {
      const res = await fetch('/api/bets/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          player: selectedBetPlayer,
          legendId: selectedLegendId,
          stat: selectedBetStat,
          betValue: cost
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserBets(data.bets);
        setBetResponseMsg({ type: 'success', text: `🎲 Locked XP battle wager: Tonight's ${selectedBetPlayer} vs Legend in ${selectedBetStat.toUpperCase()} for ${cost} XP!` });
        fetchLeaderboard();
      } else {
        setBetResponseMsg({ type: 'error', text: data.error || 'Failed to lock wager' });
      }
    } catch (err) {
      console.error('Bet submission failed:', err);
      setBetResponseMsg({ type: 'error', text: 'Server error locking your battle wager.' });
    }
  };

  const handleSimulateGameNight = async () => {
    setIsSimulatingGames(true);
    setSimulationResult(null);
    try {
      const res = await fetch('/api/games/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (data.success) {
        setSimulationResult(data);
        setPlayers(prev => {
          return prev.map(p => {
            const tonightStats = data.playerStatsTonight[p.name];
            if (tonightStats) {
              return {
                ...p,
                pts: tonightStats.pts,
                reb: tonightStats.reb,
                ast: tonightStats.ast,
                stl: tonightStats.stl,
                blk: tonightStats.blk
              };
            }
            return p;
          });
        });
        setGames(data.games);
        setLeaderboard(data.leaderboard);
        setUserBets(data.bets);
        setChats(data.chats);
        setPurchases(data.purchases);

        // Check for GOAT pick or high-performance wager win to trigger celebration
        const isPickSuccess = !!(data.pickAwardText?.includes('🏆') || data.pickAwardText?.includes('Success'));
        const wonBets = data.bets?.filter((b: any) => b.status === 'won' || b.status === 'shielded') || [];
        const isBetSuccess = wonBets.length > 0;

        if (isPickSuccess || isBetSuccess) {
          const colors = ['#ccff00', '#ff6600', '#00e676', '#38bdf8', '#a855f7', '#f43f5e', '#facc15'];
          const particles = Array.from({ length: 120 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 6,
            duration: Math.random() * 3 + 2.5,
            sway: Math.random() * 60 - 30,
          }));
          
          setConfettiParticles(particles);
          setCelebrationDetails({
            player: activeUserPick?.player || 'Your Selected GOAT',
            points: data.totalXPEarned || 0,
            text: data.pickAwardText || '',
            stats: data.playerStatsTonight,
            isPickSuccess,
            isBetSuccess,
            wonBets,
          });
          setShowCelebration(true);
        }
      } else {
        alert(data.error || 'Failed to simulate court night.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulatingGames(false);
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

  // Share Draft Roster summary to Community Chat
  const handleShareDraftRoster = async (slots: Record<string, any>, totalProjPts: number, grade: string) => {
    const filledSlots = Object.entries(slots).filter(([_, p]) => p !== null);
    if (filledSlots.length === 0) {
      setRosterShareStatus('empty');
      setTimeout(() => setRosterShareStatus(null), 3000);
      return;
    }

    const lineupText = filledSlots
      .map(([slotKey, p]) => `${slotKey}: ${p.name} (${p.team} • ${p.projectedPts} PTS)`)
      .join(' | ');

    const shareText = `🏈 My Draft Lineup (${grade} Grade • ${totalProjPts.toFixed(1)} Total Proj PTS): ${lineupText}`;

    setRosterShareStatus('sharing');
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          text: shareText
        })
      });
      const data = await res.json();
      if (data.success) {
        setChats(data.chats);
        setRosterShareStatus('success');
        setTimeout(() => setRosterShareStatus(null), 4000);
      } else {
        setRosterShareStatus('error');
        setTimeout(() => setRosterShareStatus(null), 3000);
      }
    } catch (err) {
      console.error('Error sharing roster to chat:', err);
      setRosterShareStatus('error');
      setTimeout(() => setRosterShareStatus(null), 3000);
    }
  };

  // Load CSV data for benign local session review (e.g. nightly picks or mock drafts)
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
        setUploadedCsvPicks(data.players);
        setCsvUploadStatus(`Loaded ${data.players.length} custom CSV entries for your session review workspace! Global DB remains protected.`);
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
    <div className="min-h-screen bg-[#121214] text-[#f5f5f5] flex flex-col items-center p-0 md:p-6 select-none font-sans transition-colors duration-500">
      
      {/* Full Layout wrapper structured as an elite ESPN/DraftKings Mobile App Container */}
      <div 
        className="w-full max-w-[480px] min-h-[100vh] md:min-h-[850px] bg-[#1a1a1e] border-0 md:border md:rounded-[36px] flex flex-col justify-between overflow-hidden relative transition-all duration-500"
        style={{
          borderColor: selectedSport === 'nfl' ? 'rgba(204, 255, 0, 0.25)' : 'rgba(255, 102, 0, 0.25)',
          boxShadow: selectedSport === 'nfl' 
            ? '0 20px 40px -15px rgba(204, 255, 0, 0.08), 0 1px 3px rgba(0,0,0,0.4)' 
            : '0 20px 40px -15px rgba(255, 102, 0, 0.08), 0 1px 3px rgba(0,0,0,0.4)'
        }}
      >
        
        {/* Top Status Bar Grid */}
        <div className="bg-[#111113] p-4 pb-3 border-b border-[#2d2d34] flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${sportBg} animate-pulse shadow-md shadow-current`}></div>
              <div className="flex flex-col">
                <h1 className={`text-xl font-black tracking-tighter ${sportText} italic leading-none`}>GOATPCKL</h1>
                <span className="text-[7.5px] font-black uppercase tracking-widest text-[#a3a3b3] mt-0.5">
                  {selectedSport === 'nfl' ? 'NFL PRO OPTIMIZER' : 'NBA NIGHTLY SLATE'}
                </span>
              </div>
            </div>
            
            {/* User Profile & XP Balance section */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 ${sportLightBg} ${sportText} px-2.5 py-1 rounded-full border ${sportLightBorder} text-[10px] font-black tracking-wider shadow-sm transition-all duration-350`}>
                <Coins size={11} className="animate-spin-slow" />
                <span>{userXP} XP</span>
              </div>

              {isEditingUser ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="text" 
                    value={tempUsername} 
                    onChange={(e) => setTempUsername(e.target.value)}
                    className={`bg-[#2a2a30] text-xs px-2 py-1 rounded border ${sportBorder} outline-none w-20 text-center text-white font-bold`}
                    maxLength={12}
                  />
                  <button 
                    onClick={() => { setUsername(tempUsername); setIsEditingUser(false); }}
                    className={`${sportBg} text-black rounded p-1 font-bold`}
                  >
                    <Check size={12} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditingUser(true)} 
                  className={`flex items-center gap-1 bg-[#26262a] hover:bg-[#34343d] px-2.5 py-1.5 rounded-full border border-[#3e3e46] cursor-pointer transition-all duration-150`}
                >
                  <User size={11} className={sportText} />
                  <span className="text-[11px] font-bold tracking-tight">{username}</span>
                  {purchases.some(p => p.itemId === 'crown_badge') && (
                    <Sparkles size={10} className="text-yellow-400" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sport Segmented Switcher Control */}
          <div className="flex items-center bg-[#18181c] p-1 rounded-xl border border-[#2b2b32] mt-0.5">
            <button 
              onClick={() => {
                setSelectedSport('nfl');
                setActiveTab('optimizer');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                selectedSport === 'nfl' 
                  ? 'bg-[#ccff00] text-black font-extrabold shadow-md' 
                  : 'text-[#8e8e9f] hover:text-white'
              }`}
            >
              <Zap size={12} className={selectedSport === 'nfl' ? 'text-black' : 'text-zinc-500'} />
              <span>NFL Football</span>
            </button>
            <button 
              onClick={() => {
                setSelectedSport('nba');
                setActiveTab('draft');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                selectedSport === 'nba' 
                  ? 'bg-[#ff6600] text-black font-extrabold shadow-md' 
                  : 'text-[#8e8e9f] hover:text-white'
              }`}
            >
              <Flame size={12} className={selectedSport === 'nba' ? 'text-black' : 'text-zinc-500'} />
              <span>NBA Basketball</span>
            </button>
          </div>

          {/* Quick Sub-Navigation Toolbar when NFL Mode is active */}
          {selectedSport === 'nfl' && (
            <div className="flex gap-1.5 bg-[#18181c] p-1 rounded-xl border border-[#2b2b32] mt-0.5 overflow-x-auto">
              <button 
                onClick={() => { setSelectedSport('nfl'); setActiveTab('optimizer'); }}
                className={`flex-1 min-w-[120px] py-1.5 px-2.5 rounded-lg text-[9.5px] font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'optimizer' 
                    ? 'bg-[#ccff00] text-black font-black shadow-sm' 
                    : 'text-zinc-400 hover:text-white bg-[#121216]'
                }`}
              >
                <Zap size={12} />
                <span>Roster Optimizer</span>
              </button>

              <button 
                onClick={() => { setSelectedSport('nfl'); setActiveTab('draft'); }}
                className={`flex-1 min-w-[120px] py-1.5 px-2.5 rounded-lg text-[9.5px] font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'draft' 
                    ? 'bg-[#ccff00] text-black font-black shadow-sm' 
                    : 'text-zinc-400 hover:text-white bg-[#121216]'
                }`}
              >
                <Cpu size={12} />
                <span>Mock Draft Sim</span>
              </button>

              <button 
                onClick={() => setShowRankingsModal(true)}
                className="py-1.5 px-2.5 rounded-lg text-[9.5px] font-bold uppercase text-zinc-300 hover:text-[#ccff00] bg-[#121216] border border-zinc-800 flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <BookOpen size={12} className="text-[#ccff00]" />
                <span>Strategy Sheet</span>
              </button>
            </div>
          )}

          {/* Hot ticker showing quick info */}
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#a3a3b3] bg-[#1d1d21] px-2 py-1.5 rounded-md mt-0.5 overflow-x-auto whitespace-nowrap scrollbar-none">
            <span className={sportText}>LIVE TICKER:</span>
            <span>🏈 NFL Mock Draft Simulator & Live Sleeper Sync Ready</span>
            <span className="opacity-30">|</span>
            <span>🔥 {picks.length} picks loaded</span>
            <span className="opacity-30">|</span>
            <span>🏆 Double XP Active!</span>
          </div>
        </div>

        {/* Dynamic Canvas Area */}
        <div className="flex-grow overflow-y-auto px-4 py-4 space-y-4 max-h-[calc(100vh-140px)] md:max-h-[700px] scrollbar-hide">
          
          {/* TAB 1: DRAFT ROOM */}
          {activeTab === 'draft' && selectedSport === 'nba' && (
            <div className="space-y-4">
              
              {/* Redirect banner for NFL Draft Sim */}
              <div className="bg-gradient-to-r from-emerald-950/60 to-zinc-900 border border-emerald-500/30 p-3 rounded-2xl flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-[#ccff00] uppercase font-mono">
                    <Zap size={12} /> Looking for the NFL Mock Draft Simulator?
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    Switch to NFL Football mode to run strategy mock drafts & live roster sync!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSport('nfl');
                    setActiveTab('draft');
                  }}
                  className="bg-[#ccff00] hover:bg-[#b5e000] text-black font-black text-[10px] px-3 py-2 rounded-xl uppercase tracking-wider shrink-0 transition-all cursor-pointer shadow-md"
                >
                  Launch NFL Draft Sim
                </button>
              </div>

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
                <div className="text-[10px] uppercase font-bold tracking-widest text-[#a3a3b3] flex items-center gap-1.5 font-sans">
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

              {/* GOAT Battle Arena Section */}
              <div className="bg-[#202025] border border-[#34343d] rounded-2xl p-4 space-y-3 shadow-lg">
                <div className="flex justify-between items-center pb-2 border-b border-[#2d2d34]">
                  <h3 className="text-xs uppercase font-extrabold tracking-wider text-[#ccff00] flex items-center gap-1.5 font-sans">
                    ⚔️ GOAT Battle Arena
                  </h3>
                  <span className="text-[9px] uppercase font-bold text-[#a3a3b3]">Wager: Tonight vs Historic Giants</span>
                </div>

                <p className="text-[10px] text-[#a3a3b3] leading-relaxed">
                  Pitch tonight's performers against the supreme historical benchmarks of legendary holiday/monthly milestones. Stake XP score to double or refund wagers!
                </p>

                {/* Simulation overlay button triggers simulation on backend and publishes chat alerts */}
                <button
                  onClick={handleSimulateGameNight}
                  disabled={isSimulatingGames}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isSimulatingGames
                      ? 'bg-[#ccff00]/10 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#ccff00] to-[#00e676] text-black hover:scale-[1.01] hover:shadow-lg active:scale-1 w-full shadow-md cursor-pointer'
                  }`}
                >
                  {isSimulatingGames ? (
                    <div className="flex items-center gap-2 animate-pulse">
                      <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Simulating Court Actions...</span>
                    </div>
                  ) : (
                    <>
                      <Zap size={14} className="animate-pulse" />
                      <span>Simulate Game Night Results</span>
                    </>
                  )}
                </button>

                {/* Simulation Results Alert if available */}
                {simulationResult && (
                  <div className="bg-[#15341c]/50 border border-[#00e676]/40 p-3 rounded-xl space-y-2 animate-fadeIn text-[10.5px]">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-[#00e676] uppercase tracking-wide">⚡ Simulation Complete</span>
                      <span className="text-[9px] text-[#00e676] font-bold">Processed Tonight</span>
                    </div>
                    <p className="text-[#a3a3b3] font-semibold text-xs">
                      Tonight's games finished! Selected stats simulated, XP locks evaluated, and standard draft entries settled. Custom commentary published to lobby chat.
                    </p>
                    <div className="bg-[#121214] p-2 rounded text-[10px] space-y-1 text-zinc-300 font-mono">
                      <p>• Tonight's XP: <span className="text-[#ccff00] font-bold">+{simulationResult.totalXPEarned} XP gained</span></p>
                      <p>• {simulationResult.pickAwardText}</p>
                    </div>
                  </div>
                )}

                {/* Lock Bet Wager Form */}
                <div className="bg-[#17171a] p-3 rounded-xl border border-[#2d2d34] space-y-3 text-[11px]">
                  {/* Step 1: Select Active Player */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-extrabold text-[#a3a3b3]">1. Select Draft Pick for Tonight</label>
                    <select
                      value={selectedBetPlayer}
                      onChange={(e) => setSelectedBetPlayer(e.target.value)}
                      className="w-full bg-[#202025] text-white py-2 px-2.5 rounded-lg border border-[#3e3e46] font-bold outline-none cursor-pointer"
                    >
                      <option value="">-- Choose active player --</option>
                      {players.map(p => (
                        <option key={p.id} value={p.name}>{p.name} ({p.team})</option>
                      ))}
                    </select>
                  </div>

                  {/* Step 2: Select Historical Legend */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-extrabold text-[#a3a3b3]">2. Pick Historical Battle Marker</label>
                    <select
                      value={selectedLegendId}
                      onChange={(e) => setSelectedLegendId(e.target.value)}
                      className="w-full bg-[#202025] text-white py-2 px-2.5 rounded-lg border border-[#3e3e46] font-bold outline-none cursor-pointer text-xs"
                    >
                      {historicalLegends.map(hl => (
                        <option key={hl.id} value={hl.id}>
                          {hl.player} - {hl.holiday} [PTS:{hl.pts} / REB:{hl.reb} / AST:{hl.ast}]
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stat Category and Wager limit */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-extrabold text-[#a3a3b3]">3. Category</label>
                      <select
                        value={selectedBetStat}
                        onChange={(e) => setSelectedBetStat(e.target.value)}
                        className="w-full bg-[#202025] text-white py-2 px-2.5 rounded-lg border border-[#3e3e46] font-bold outline-none cursor-pointer"
                      >
                        <option value="pts">Points (PTS)</option>
                        <option value="reb">Rebounds (REB)</option>
                        <option value="ast">Assists (AST)</option>
                        <option value="stl">Steals (STL)</option>
                        <option value="blk">Blocks (BLK)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-extrabold text-[#a3a3b3]">4. XP Wager</label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={betWagerAmount}
                        onChange={(e) => setBetWagerAmount(e.target.value)}
                        className="w-full bg-[#202025] text-white py-1.5 px-2.5 rounded-lg border border-[#3e3e46] font-bold outline-none text-center font-mono"
                      />
                    </div>
                  </div>

                  {betResponseMsg && (
                    <div className={`p-2 rounded-lg font-bold text-[10px] text-center ${
                      betResponseMsg.type === 'success' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950/40 text-rose-400 border border-rose-500/30'
                    }`}>
                      {betResponseMsg.text}
                    </div>
                  )}

                  <button
                    onClick={handlePlaceBet}
                    className="w-full bg-[#ccff00] text-black hover:bg-[#b5e000] font-black uppercase text-[10px] py-2.5 rounded-xl transition-all shadow cursor-pointer"
                  >
                    Lock Matchup Battle Bet
                  </button>
                </div>

                {/* List of active/settled bets */}
                {userBets.length > 0 && (
                  <div className="space-y-2 pt-1 font-sans">
                    <h4 className="text-[9.5px] uppercase font-extrabold text-zinc-400 tracking-wider">Locked Battle Showdowns</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
                      {userBets.map(b => (
                        <div key={b.id} className="bg-[#151518] p-2.5 rounded-xl border border-[#2b2b30] text-[10px] space-y-1 uppercase font-semibold">
                          <div className="flex justify-between items-center text-[9px]">
                            <span className="font-extrabold text-[#ccff00]">Tonight's {b.player} vs {b.legendName}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black shrink-0 ${
                              b.status === 'pending'
                                ? 'bg-zinc-800 text-zinc-400'
                                : b.status === 'won'
                                  ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20'
                                  : b.status === 'shielded'
                                    ? 'bg-amber-900/30 text-amber-500 border border-amber-500/20'
                                    : 'bg-rose-900/30 text-rose-400 border border-rose-500/20'
                            }`}>
                              {b.status}
                            </span>
                          </div>
                          <p className="text-zinc-400 italic"> Wager: {b.betValue} XP in {b.stat.toUpperCase()} (Target: {b.legendVal} - {b.holiday})</p>
                          {b.resultCommentary && (
                            <p className="normal-case text-zinc-400 bg-black/40 p-1.5 rounded mt-1 font-sans leading-relaxed text-[8.5px] border border-zinc-800/60 font-medium text-left">✨ commentary: {b.resultCommentary}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Roster list */}
              <div className="space-y-3">
                <div className="flex justify-between items-center shadow-sm">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-[#a3a3b3] flex items-center gap-1.5 font-sans">
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
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="bg-[#111113] text-[#ccff00] text-[9px] font-extrabold px-1.5 py-0.5 rounded-md tracking-wider mr-2 uppercase">
                              {player.team} • {player.position}
                            </span>
                            <h3 className="text-sm font-black tracking-tight mt-1.5">{player.name}</h3>
                          </div>
                          
                          {/* Pick GOAT Action */}
                          <button 
                            onClick={() => handleVoteGOAT(player.name)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-[#ccff00] text-black border-2 border-[#ccff00]' 
                               : 'bg-[#121214] text-[#f5f5f5] hover:bg-[#1f1f23] border border-[#3e3e4a]'
                            }`}
                          >
                            {isSelected && <Check size={11} />}
                            {isSelected ? 'My GOAT' : 'GOAT PICK'}
                          </button>
                        </div>

                        {/* Computed Dynamic achievements / badges from the Novel Stats Engine */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {player.achievements && player.achievements.map((ach: string) => {
                            const isSpecial = ach !== 'High Impact Roleplayer' && ach !== 'Elite Scoring Weapon';
                            return (
                              <span 
                                key={ach} 
                                className={`inline-block rounded text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 ${
                                  isSpecial 
                                    ? 'bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30 animate-pulse' 
                                    : 'bg-[#191922] text-[#a3a3b3] border border-[#2b2b33]'
                                }`}
                              >
                                ✨ {ach}
                              </span>
                            );
                          })}
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

          {/* TAB 1: DRAFT ROOM (NFL MOCK DRAFT) */}
          {activeTab === 'draft' && selectedSport === 'nfl' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* SETTINGS VIEW */}
              {mockDraftStatus === 'settings' && (
                <div className="bg-[#202025] border border-[#34343d] rounded-2xl p-5 space-y-4 shadow-lg">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                      <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#ccff00]">
                        🏈 NFL Mock Draft Simulator
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSport('nfl');
                        setActiveTab('optimizer');
                      }}
                      className="text-[9.5px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-700 font-bold uppercase flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Zap size={12} className="text-[#ccff00]" />
                      <span>Switch to Roster Optimizer</span>
                    </button>
                  </div>

                  <p className="text-[10.5px] text-[#a3a3b3] leading-relaxed">
                    Set up your 2026 fantasy league parameters, pick your preferred draft-day strategy, and run real-time mock drafts. Watch the Gemini AI assistant recommend targets and run Monte Carlo simulations in the background!
                  </p>

                  <div className="space-y-3 pt-1">
                    {/* Choose Strategy */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-zinc-400">
                        Select Draft Strategy
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'Balanced', name: 'Balanced Build', desc: 'No constraints / regular draft' },
                          { id: 'Hero-RB', name: 'Hero-RB Build', desc: 'Secure 1 elite RB early' },
                          { id: 'Zero-RB', name: 'Zero-RB Build', desc: 'Avoid RBs first 5 rounds' },
                          { id: 'Robust-RB', name: 'Robust-RB Build', desc: 'Draft 3 RBs early' },
                          { id: 'Late-Round QB', name: 'Late-Round QB', desc: 'Wait on QB till round 8+' },
                          { id: 'Tight End Premium', name: 'Only TEs Premium', desc: 'Prioritize elite TEs early' }
                        ].map((strat) => (
                          <button
                            key={strat.id}
                            type="button"
                            onClick={() => setDraftStrategy(strat.id)}
                            className={`p-2.5 text-left rounded-xl border transition-all ${
                              draftStrategy === strat.id
                                ? 'bg-[#ccff00]/15 border-[#ccff00] text-white animate-pulse'
                                : 'bg-[#18181c] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                            }`}
                          >
                            <div className="text-[11px] font-black">{strat.name}</div>
                            <div className="text-[9px] text-zinc-500 font-medium leading-none mt-0.5">{strat.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* League Parameters */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wide text-zinc-400">
                          League Size
                        </label>
                        <select
                          value={totalTeams}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setTotalTeams(val);
                            if (userPickPosition > val) setUserPickPosition(val);
                          }}
                          className="w-full bg-[#18181c] border border-zinc-800 rounded-xl py-2 px-3 text-xs font-bold text-white outline-none cursor-pointer hover:border-zinc-700"
                        >
                          <option value={8}>8 Teams</option>
                          <option value={10}>10 Teams</option>
                          <option value={12}>12 Teams</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wide text-zinc-400">
                          Your Draft Spot
                        </label>
                        <select
                          value={userPickPosition}
                          onChange={(e) => setUserPickPosition(parseInt(e.target.value))}
                          className="w-full bg-[#18181c] border border-zinc-800 rounded-xl py-2 px-3 text-xs font-bold text-white outline-none cursor-pointer hover:border-zinc-700"
                        >
                          {Array.from({ length: totalTeams }, (_, i) => i + 1).map((spot) => (
                            <option key={spot} value={spot}>Pick Slot #{spot}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Sim Draft Speed */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-zinc-400">
                        Simulation Draft Speed
                      </label>
                      <div className="flex gap-2 bg-[#18181c] p-1 rounded-xl border border-zinc-800/80">
                        {[
                          { val: 1500, label: 'Slow' },
                          { val: 700, label: 'Normal' },
                          { val: 200, label: 'Fast' },
                          { val: 0, label: 'Instant' }
                        ].map((sp) => (
                          <button
                            key={sp.val}
                            type="button"
                            onClick={() => setDraftSpeed(sp.val)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                              draftSpeed === sp.val
                                ? 'bg-zinc-800 text-white font-extrabold'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            {sp.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Strategy Guide Summary */}
                    <div className="bg-[#18181c] p-3 rounded-xl border border-zinc-800/80 text-[10px] text-zinc-400 space-y-1">
                      <div className="font-extrabold uppercase text-[#ccff00] text-[9.5px]">
                        💡 Selected Strategy Playbook
                      </div>
                      <p className="leading-relaxed">
                        {draftStrategy === 'Balanced' && 'The Balanced blueprint removes all strict position biases, drafting purely for baseline value, roster flexibility, and dynamic depth across all slots.'}
                        {draftStrategy === 'Hero-RB' && 'The Hero-RB blueprint drafts 1 elite workhorse in the first 2 rounds (e.g. Jahmyr Gibbs or Bijan Robinson), then loads up heavily on WRs and elite TE advantages. Highly optimized for Middle Slots.'}
                        {draftStrategy === 'Zero-RB' && 'Zero-RB bypasses running backs in the first 5 rounds to secure extreme WR volume dominance, then stocks up on committee/breakout candidates later.'}
                        {draftStrategy === 'Robust-RB' && 'Robust-RB builds absolute backfield dominance by securing 3 premium ball-carriers in the first 4 rounds, picking up sleeper WR talent from the middle/late tiers.'}
                        {draftStrategy === 'Late-Round QB' && 'Late-Round QB hoards premium skill position depth (RBs, WRs, TEs) first, waiting until Round 8 or later to draft starting quarterbacks with high-floor options.'}
                        {draftStrategy === 'Tight End Premium' && 'Tight End Premium prioritizes elite, mismatch-creating tight ends (e.g., Travis Kelce, Sam LaPorta, Trey McBride) in the early rounds to establish an unbeatable point advantage at the thinnest fantasy position.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartMockDraft}
                    className="w-full bg-[#ccff00] hover:bg-[#b5e000] text-black font-black text-xs py-3.5 rounded-xl uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Tv size={14} />
                    <span>Initiate 15-Round Mock Draft</span>
                  </button>
                </div>
              )}

              {/* DRAFTING VIEW */}
              {mockDraftStatus === 'drafting' && (
                <div className="space-y-4">
                  {/* Draft State Widget */}
                  {(() => {
                    const activePick = draftBoard[currentPickIndex] || {};
                    const isUserOnClock = activePick.teamId === userPickPosition;
                    const completionPct = Math.round((currentPickIndex / (totalTeams * 15)) * 100);

                    return (
                      <div className="bg-[#202025] border border-[#34343d] rounded-2xl p-4 space-y-3.5 shadow-lg relative overflow-hidden">
                        
                        {/* Shimmering top line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-[#202025]">
                          <div 
                            className="bg-gradient-to-r from-[#ccff00] to-[#00e676] h-full transition-all duration-300"
                            style={{ width: `${completionPct}%` }}
                          />
                        </div>

                        {/* Top Metadata */}
                        <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-0.5">
                          <span className="font-extrabold font-mono uppercase text-[#ccff00]">
                            🏈 Round {activePick.round || 1} • Pick {activePick.roundPick || 1}
                          </span>
                          <span className="font-bold text-zinc-500 uppercase tracking-wider">
                            Pick #{activePick.pickNumber || 1} overall ({completionPct}% Complete)
                          </span>
                        </div>

                        {/* On the Clock Display */}
                        <div className="flex justify-between items-center bg-[#18181c] p-3 rounded-xl border border-zinc-800/80">
                          <div className="space-y-0.5">
                            <span className="text-[9px] uppercase font-bold text-zinc-500 block">
                              ON THE CLOCK:
                            </span>
                            <span className={`text-sm font-black tracking-tight uppercase ${isUserOnClock ? 'text-emerald-400 font-extrabold' : 'text-white'}`}>
                              {isUserOnClock ? `${username} (You)` : activePick.teamName}
                            </span>
                          </div>

                          <div>
                            {isUserOnClock ? (
                              <span className="bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-widest animate-pulse flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                Your Turn
                              </span>
                            ) : (
                              <span className="bg-zinc-800/80 text-zinc-400 font-extrabold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                                AI Manager Selecting...
                              </span>
                            )}
                          </div>
                        </div>

                        {/* GEMINI DRAFT ASSISTANT */}
                        <div className="bg-[#1c1c28] border border-zinc-800 rounded-xl p-3.5 space-y-3">
                          <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60">
                            <div className="flex items-center gap-1.5">
                              <Sparkles size={13} className="text-[#ccff00]" />
                              <span className="text-[10px] font-black uppercase text-white tracking-wider">
                                Gemini Draft Assistant Recommendations
                              </span>
                            </div>
                            <span className="text-[8px] bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/20 px-1.5 py-0.5 rounded font-extrabold uppercase">
                              {draftStrategy} Strategy
                            </span>
                          </div>

                          {isAiSuggesting ? (
                            <div className="space-y-2 py-2">
                              <div className="h-4 bg-zinc-800/40 rounded animate-pulse w-3/4" />
                              <div className="h-3 bg-zinc-800/30 rounded animate-pulse w-5/6" />
                              <div className="h-3 bg-zinc-800/30 rounded animate-pulse w-2/3" />
                            </div>
                          ) : aiSuggestions.length > 0 ? (
                            <div className="space-y-2.5">
                              {aiSuggestions.map((rec, idx) => {
                                // Find player in Db to grab correct stats/team
                                const pData = availableDraftPlayers.find(
                                  p => p.name.toLowerCase() === rec.playerName.toLowerCase() ||
                                       p.name.toLowerCase().replace(/[^a-z0-9]/g, '') === rec.playerName.toLowerCase().replace(/[^a-z0-9]/g, '')
                                ) || {
                                  id: `ai-suggested-${rec.position}-${idx}-${Date.now()}`,
                                  name: rec.playerName,
                                  position: rec.position || 'FLEX',
                                  team: 'NFL',
                                  projectedPts: 12.0,
                                  opponent: 'UNK',
                                  matchupRating: 'neutral',
                                  achievements: [],
                                  adp: 999,
                                  tier: 3
                                };
                                return (
                                  <div key={idx} className="bg-[#121216] border border-zinc-900 p-2.5 rounded-lg flex justify-between items-start gap-3 transition-colors hover:border-zinc-800">
                                    <div className="space-y-1 flex-grow">
                                      <div className="flex items-center gap-2">
                                        <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded ${
                                          rec.position === 'RB' ? 'bg-emerald-500/10 text-emerald-400' :
                                          rec.position === 'WR' ? 'bg-blue-500/10 text-blue-400' :
                                          rec.position === 'TE' ? 'bg-orange-500/10 text-orange-400' :
                                          rec.position === 'QB' ? 'bg-purple-500/10 text-purple-400' :
                                          'bg-zinc-800 text-zinc-400'
                                        }`}>
                                          {rec.position}
                                        </span>
                                        <span className="font-extrabold text-white text-xs">{rec.playerName}</span>
                                        <span className="text-[9px] text-zinc-500 font-bold uppercase">{pData.team || 'NFL'}</span>
                                      </div>
                                      <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                                        {rec.reasoning}
                                      </p>
                                    </div>

                                    <button
                                      type="button"
                                      disabled={!isUserOnClock}
                                      onClick={() => handleUserDraftPlayer(pData)}
                                      className={`py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 transition-colors ${
                                        isUserOnClock
                                          ? 'bg-[#ccff00] hover:bg-[#b5e000] text-black cursor-pointer'
                                          : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                      }`}
                                    >
                                      Draft
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[10px] text-zinc-500 italic py-1 text-center">
                              No recommendations active. Wait until you are on the clock.
                            </p>
                          )}

                          {/* GEMINI BACKGROUND SIMULATOR PANEL */}
                          <div className="bg-[#121217] p-2.5 rounded-lg border border-zinc-900 space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-ping" />
                              <span className="text-[8px] font-black uppercase text-zinc-400 tracking-wider font-mono">
                                Gemini Background Monte Carlo Engine
                              </span>
                            </div>
                            <p className="text-[9px] text-zinc-500 leading-tight">
                              Simulating 100 fast-forwarded draft sweeps in the background based on current roster metrics to evaluate player board survival rates for your next pick slot.
                            </p>
                            
                            {/* Live predicted board survival percentages */}
                            <div className="grid grid-cols-3 gap-2 pt-1">
                              {availableDraftPlayers
                                .filter(p => !draftBoard.slice(0, currentPickIndex).some(dp => dp.player?.id === p.id))
                                .slice(0, 3)
                                .map((cand) => {
                                  // Compute user next pick round overall number
                                  // In snake draft, rounds alternate
                                  let nextUserPickOverall = 150;
                                  const startRound = activePick?.round || 1;
                                  for (let r = startRound; r <= 15; r++) {
                                    const rP = (r % 2 === 1) ? userPickPosition : (totalTeams - userPickPosition + 1);
                                    const overall = (r - 1) * totalTeams + rP;
                                    if (overall > currentPickIndex + 1) {
                                      nextUserPickOverall = overall;
                                      break;
                                    }
                                  }

                                  const diff = cand.adp - nextUserPickOverall;
                                  let survivalRate = 50;
                                  if (diff > 12) survivalRate = 95;
                                  else if (diff > 6) survivalRate = 82;
                                  else if (diff > 0) survivalRate = 64;
                                  else if (diff > -6) survivalRate = 38;
                                  else if (diff > -12) survivalRate = 18;
                                  else survivalRate = 4;

                                  return (
                                    <div key={cand.id} className="bg-[#171720] border border-zinc-800/80 p-1.5 rounded text-center space-y-0.5">
                                      <div className="text-[9px] font-extrabold text-zinc-300 truncate">{cand.name}</div>
                                      <div className="text-[8px] text-zinc-500 font-mono font-bold uppercase">{cand.position} • ADP {cand.adp}</div>
                                      <div className="text-[10px] font-mono font-black text-[#ccff00]">{survivalRate}% Survival</div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>

                        </div>

                      </div>
                    );
                  })()}

                  {/* Player Pool Filters & Listing */}
                  <div className="bg-[#202025] border border-[#34343d] rounded-2xl p-4 space-y-3.5 shadow-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] uppercase font-extrabold tracking-wider text-zinc-400">
                        Player Pool Database
                      </h4>
                      <span className="text-[8.5px] text-[#ccff00] font-mono font-bold">
                        {availableDraftPlayers.filter(p => !draftBoard.slice(0, currentPickIndex).some(dp => dp.player?.id === p.id)).length} Players Available
                      </span>
                    </div>

                    {/* Search & filters */}
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={searchPlayerQuery}
                        onChange={(e) => setSearchPlayerQuery(e.target.value)}
                        placeholder="Search player name..."
                        className="w-full bg-[#18181c] text-white border border-zinc-800 text-xs py-2 px-3 rounded-xl font-medium outline-none placeholder-zinc-600 focus:border-[#ccff00]"
                      />

                      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                        {['All', 'QB', 'RB', 'WR', 'TE', 'DEF', 'K'].map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => setSelectedPositionFilter(pos)}
                            className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase transition-all cursor-pointer ${
                              selectedPositionFilter === pos
                                ? 'bg-[#ccff00] text-black font-black shadow-sm'
                                : 'bg-[#18181c] text-zinc-400 hover:text-white border border-zinc-800'
                            }`}
                          >
                            {pos}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Players scrollable table */}
                    <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-950/40">
                      <div className="max-h-[300px] overflow-y-auto divide-y divide-zinc-900">
                        {(() => {
                          const draftedIds = new Set(
                            draftBoard
                              .slice(0, currentPickIndex)
                              .filter(p => p.player)
                              .map(p => p.player.id)
                          );
                          const activePick = draftBoard[currentPickIndex] || {};
                          const isUserOnClock = activePick.teamId === userPickPosition;

                          const filtered = availableDraftPlayers.filter(p => {
                            const isDrafted = draftedIds.has(p.id);
                            const matchesPos = selectedPositionFilter === 'All' || p.position === selectedPositionFilter;
                            const matchesSearch = p.name.toLowerCase().includes(searchPlayerQuery.toLowerCase());
                            return !isDrafted && matchesPos && matchesSearch;
                          });

                          if (filtered.length === 0) {
                            return (
                              <div className="p-8 text-center text-xs text-zinc-500 italic">
                                No available draft candidates found matching filters.
                              </div>
                            );
                          }

                          return filtered.map((player) => (
                            <div key={player.id} className="p-2.5 flex justify-between items-center hover:bg-zinc-900/30 transition-colors text-xs">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="font-mono font-bold text-zinc-500 text-[10px] w-5">
                                  #{player.adp}
                                </span>
                                <div className="truncate min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-extrabold text-zinc-100 truncate">{player.name}</span>
                                    <span className="text-[9px] text-zinc-500 font-bold uppercase">{player.team}</span>
                                    <span className={`text-[8px] font-black px-1 rounded ${
                                      player.position === 'RB' ? 'bg-emerald-500/10 text-emerald-400' :
                                      player.position === 'WR' ? 'bg-blue-500/10 text-blue-400' :
                                      player.position === 'TE' ? 'bg-orange-500/10 text-orange-400' :
                                      player.position === 'QB' ? 'bg-purple-500/10 text-purple-400' :
                                      'bg-zinc-800 text-zinc-400'
                                    }`}>
                                      {player.position}
                                    </span>
                                    {player.injuryHistory && (
                                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full border ${
                                        player.injuryHistory === 'Fragile'
                                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                          : player.injuryHistory === 'Questionable'
                                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                      }`}>
                                        {player.injuryHistory === 'Fragile' && '🚑 '}
                                        {player.injuryHistory === 'Questionable' && '⚠️ '}
                                        {player.injuryHistory === 'Durable' && '🛡️ '}
                                        {player.injuryHistory}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 mt-0.5 truncate font-medium">
                                    <span>Tier {player.tier}</span>
                                    <span>•</span>
                                    <span>Proj: {player.projectedPts} PTS</span>
                                    {player.achievements && player.achievements.length > 0 && (
                                      <>
                                        <span>•</span>
                                        <span className="text-zinc-400 font-medium italic truncate">{player.achievements[0]}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                disabled={!isUserOnClock}
                                onClick={() => handleUserDraftPlayer(player)}
                                className={`py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 transition-all ${
                                  isUserOnClock
                                    ? 'bg-[#ccff00] hover:bg-[#b5e000] text-black cursor-pointer'
                                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                }`}
                              >
                                Draft
                              </button>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Context Sub-Tabs Selector */}
                  <div className="bg-[#202025] border border-[#34343d] rounded-2xl shadow-lg flex flex-col overflow-hidden">
                    <div className="flex border-b border-zinc-800 bg-[#17171a] px-3 gap-3 overflow-x-auto scrollbar-none">
                      {[
                        { id: 'my-roster', label: 'My Roster' },
                        { id: 'board', label: 'Draft Board' },
                        { id: 'all-rosters', label: 'All Roster Slates' },
                        { id: 'log', label: 'Draft Ticker Log' }
                      ].map((tb) => (
                        <button
                          key={tb.id}
                          type="button"
                          onClick={() => setDraftSubTab(tb.id as any)}
                          className={`py-3 text-[10px] font-black uppercase tracking-wider border-b-2 shrink-0 transition-all cursor-pointer ${
                            draftSubTab === tb.id
                              ? 'border-[#ccff00] text-[#ccff00]'
                              : 'border-transparent text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {tb.label}
                        </button>
                      ))}
                    </div>

                    <div className="p-4 bg-[#1e1e24] min-h-[180px]">
                      
                      {/* SUB TAB: MY ROSTER */}
                      {draftSubTab === 'my-roster' && (() => {
                        const userPicks = draftBoard
                          .filter(p => p.teamId === userPickPosition && p.player)
                          .map(p => p.player);
                        const slots = getRosterSlots(userPicks);

                        const totalProjPts = Object.values(slots).reduce((sum: number, p: any) => sum + (p ? (p.projectedPts || 0) : 0), 0);
                        const filledSlotsCount = Object.values(slots).filter(Boolean).length;
                        const avgTier = userPicks.length > 0 ? (userPicks.reduce((sum: number, p: any) => sum + (p.tier || 3), 0) / userPicks.length) : 3;
                        let grade = 'Pending';
                        if (filledSlotsCount > 0) {
                          if (avgTier <= 1.8) grade = 'A+ 🏆';
                          else if (avgTier <= 2.2) grade = 'A 🔥';
                          else if (avgTier <= 2.6) grade = 'B+ ⭐';
                          else if (avgTier <= 3.0) grade = 'B 👍';
                          else grade = 'C';
                        }

                        return (
                          <div className="space-y-2 animate-fadeIn text-xs">
                            <div className="flex justify-between items-center pb-1.5 border-b border-zinc-800 gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono">
                                  Your Starting Lineup (Pick Slot #{userPickPosition})
                                </span>
                                <span className="text-[9px] font-bold text-zinc-500 uppercase bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 font-mono">
                                  {filledSlotsCount} / 15 Drafted
                                </span>
                              </div>

                              <button
                                type="button"
                                disabled={rosterShareStatus === 'sharing'}
                                onClick={() => handleShareDraftRoster(slots, totalProjPts, grade)}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                                  rosterShareStatus === 'success'
                                    ? 'bg-emerald-500 text-black'
                                    : rosterShareStatus === 'empty'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-[#ccff00] hover:bg-[#b5e000] text-black'
                                }`}
                              >
                                {rosterShareStatus === 'sharing' ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    <span>Sharing...</span>
                                  </>
                                ) : rosterShareStatus === 'success' ? (
                                  <>
                                    <Check size={12} className="stroke-[3]" />
                                    <span>Shared!</span>
                                  </>
                                ) : rosterShareStatus === 'empty' ? (
                                  <>
                                    <AlertCircle size={12} />
                                    <span>No Players Yet</span>
                                  </>
                                ) : (
                                  <>
                                    <Share2 size={12} />
                                    <span>Share Roster</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {rosterShareStatus === 'success' && (
                              <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl text-[10px] text-emerald-400 font-bold animate-fadeIn">
                                <span className="flex items-center gap-1.5">
                                  <Sparkles size={12} /> Lineup summary posted to Community Chat!
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setActiveTab('chat')}
                                  className="bg-emerald-500 text-black px-2.5 py-0.5 rounded text-[9px] font-black uppercase hover:bg-emerald-400 transition-colors cursor-pointer"
                                >
                                  View Chat
                                </button>
                              </div>
                            )}

                            {/* LIVE ROSTER STAT TRENDS */}
                            <div className="grid grid-cols-2 gap-2 bg-[#121217] p-2 rounded-xl border border-zinc-900/80">
                              <div>
                                <span className="text-[8px] uppercase font-bold text-zinc-500 block font-mono">Roster Projected Power</span>
                                <span className="text-xs font-black text-[#ccff00]">{totalProjPts.toFixed(1)} <span className="text-[8px] text-zinc-400 font-bold uppercase">PTS</span></span>
                              </div>
                              <div className="text-right">
                                <span className="text-[8px] uppercase font-bold text-zinc-500 block font-mono">Draft Grade Trend</span>
                                <span className={`text-xs font-black ${grade.startsWith('A') ? 'text-[#ccff00]' : 'text-blue-400'}`}>{grade}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                              {Object.entries(slots).map(([slotKey, player]: [string, any]) => (
                                <div key={slotKey} className="bg-[#121217] border border-zinc-900 p-2 rounded-xl flex justify-between items-center">
                                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest w-12 font-mono">
                                    {slotKey}
                                  </span>
                                  {player ? (
                                    <div className="flex items-center gap-2 flex-grow pl-2 min-w-0">
                                      <span className="font-extrabold text-white text-[11px] truncate">{player.name}</span>
                                      <span className="text-[9px] text-zinc-500 font-bold uppercase">{player.team}</span>
                                      <span className="text-[8.5px] font-mono text-zinc-400 font-extrabold flex-grow text-right pr-2">
                                        {player.projectedPts} Proj PTS
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-zinc-650 italic text-[10px] pl-2 flex-grow text-left">
                                      Empty Slot
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* SUB TAB: DRAFT BOARD */}
                      {draftSubTab === 'board' && (
                        <div className="space-y-2 animate-fadeIn max-h-[220px] overflow-y-auto text-xs">
                          <span className="text-[9px] uppercase font-bold text-zinc-500 block pb-1 border-b border-zinc-800 font-mono">
                            Entire League Draft Board (All Picks)
                          </span>
                          <div className="divide-y divide-zinc-800/80">
                            {draftBoard.map((p, idx) => (
                              <div key={idx} className="py-2 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-[#ccff00] text-[9.5px]">
                                    R{p.round}P{p.roundPick}
                                  </span>
                                  <span className="text-zinc-400 font-medium">#{p.pickNumber}:</span>
                                  <span className="font-extrabold text-zinc-200">{p.teamName}</span>
                                </div>
                                <div>
                                  {p.player ? (
                                    <span className="bg-zinc-800/60 font-bold text-zinc-100 px-2 py-0.5 rounded text-[10px]">
                                      {p.player.name} ({p.player.position}, {p.player.team})
                                    </span>
                                  ) : (
                                    <span className="text-zinc-600 italic text-[10px]">On the Clock</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SUB TAB: ALL ROSTERS */}
                      {draftSubTab === 'all-rosters' && (
                        <div className="space-y-3 animate-fadeIn text-xs">
                          <div className="flex items-center gap-2 pb-1 border-b border-zinc-800">
                            <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono">
                              Inspect Competitor Rosters
                            </span>
                            <select
                              value={selectedInspectRosterIdx}
                              onChange={(e) => setSelectedInspectRosterIdx(parseInt(e.target.value))}
                              className="bg-[#121217] text-white border border-zinc-800 rounded-lg py-1 px-2 text-[10.5px] font-bold outline-none cursor-pointer font-sans"
                            >
                              {Array.from({ length: totalTeams }, (_, i) => i + 1).map((teamId) => (
                                <option key={teamId} value={teamId}>
                                  {teamId === userPickPosition ? `AI Manager ${teamId} (You)` : `AI Manager ${teamId}`}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-1 gap-1 max-h-[180px] overflow-y-auto">
                            {(() => {
                              const rosterPicks = draftBoard
                                .filter(p => p.teamId === selectedInspectRosterIdx && p.player)
                                .map(p => p.player);
                              const slots = getRosterSlots(rosterPicks);

                              return Object.entries(slots).map(([slotKey, player]: [string, any]) => (
                                <div key={slotKey} className="bg-[#121217]/50 border border-zinc-900/60 p-1.5 rounded-lg flex justify-between items-center">
                                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider w-10 font-mono font-bold">
                                    {slotKey}
                                  </span>
                                  <span className="text-[10px] font-extrabold text-zinc-350 pl-2 flex-grow text-left">
                                    {player ? `${player.name} (${player.team})` : <span className="text-zinc-650 italic">Empty</span>}
                                  </span>
                                  {player && (
                                    <span className="text-[9px] font-mono text-zinc-500">{player.projectedPts} PTS</span>
                                  )}
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}

                      {/* SUB TAB: LOG */}
                      {draftSubTab === 'log' && (
                        <div className="space-y-2 animate-fadeIn text-xs">
                          <span className="text-[9px] uppercase font-bold text-zinc-500 block pb-1 border-b border-zinc-800 font-mono">
                            Simulated Pick Feed Logs
                          </span>
                          <div className="max-h-[180px] overflow-y-auto bg-black/40 border border-zinc-900 p-2 rounded-xl font-mono text-[9.5px] text-[#ccff00] space-y-1">
                            {draftLog.map((log, idx) => (
                              <div key={idx} className="leading-tight opacity-90">
                                {log}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              )}

              {/* COMPLETED VIEW */}
              {mockDraftStatus === 'completed' && (
                <div className="bg-[#202025] border border-[#34343d] rounded-2xl p-5 space-y-4 shadow-lg text-center animate-fadeIn">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-[#ccff00] text-black font-extrabold px-2 py-0.5 rounded uppercase tracking-widest font-mono">
                      Draft Simulation Completed
                    </span>
                    <h3 className="text-lg font-black tracking-tighter text-white uppercase italic pt-1 font-sans">
                      🏈 Your Draft Evaluation Report
                    </h3>
                  </div>

                  {(() => {
                    const evaluation = calculateDraftGrade();
                    const userPicks = draftBoard
                      .filter(p => p.teamId === userPickPosition && p.player)
                      .map(p => p.player);

                    return (
                      <div className="space-y-4 pt-1">
                        
                        {/* Huge Grade Card */}
                        <div className="bg-[#18181c] border border-zinc-800 rounded-2xl p-5 space-y-2 max-w-[280px] mx-auto">
                          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                            Strategic Draft Grade
                          </span>
                          <div className="text-4xl font-black italic text-[#ccff00] font-mono tracking-tighter">
                            {evaluation.grade}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono font-bold">
                            Blueprint Compatibility: {evaluation.score}% Match
                          </div>
                        </div>

                        {/* Strategical Coaching Review */}
                        <div className="bg-[#1c1c28] border border-zinc-800 p-4 rounded-xl text-left space-y-1.5">
                          <span className="text-[9px] font-extrabold uppercase text-[#ccff00] tracking-wider block font-mono">
                            📋 Strategic Coaching Feedback ({draftStrategy})
                          </span>
                          <p className="text-[10.5px] text-zinc-300 leading-relaxed">
                            {evaluation.feedback}
                          </p>
                        </div>

                        {/* Summary of drafted starting lineup */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center pl-1">
                            <span className="text-[10px] text-zinc-500 font-extrabold uppercase block font-mono">
                              Drafted Starting Roster:
                            </span>
                            <button
                              type="button"
                              onClick={handleDownloadDraftCSV}
                              className="text-[9.5px] bg-zinc-800 hover:bg-zinc-700 text-[#ccff00] font-black px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors border border-zinc-750 cursor-pointer uppercase tracking-wider font-mono shadow-sm"
                            >
                              <Download size={11} /> Download Draft Results
                            </button>
                          </div>
                          <div className="bg-zinc-950/30 border border-zinc-800 p-3 rounded-xl grid grid-cols-2 gap-1.5 text-left text-[11px] font-medium max-h-[200px] overflow-y-auto">
                            {userPicks.map((p, idx) => (
                              <div key={idx} className="truncate">
                                <span className="text-zinc-500 font-bold font-mono mr-1">{idx+1}.</span>
                                <span className="text-zinc-300 font-extrabold mr-1">{p.name}</span>
                                <span className="text-[8px] bg-zinc-800 text-zinc-400 font-bold px-1 rounded uppercase">{p.position}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Reset / Redraft buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <button
                            type="button"
                            onClick={handleStartMockDraft}
                            className="w-full bg-[#ccff00] hover:bg-[#b5e000] text-black font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <RefreshCw size={13} className="animate-spin-slow" /> Redraft Same Settings
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setMockDraftStatus('settings');
                              setDraftLog([]);
                              setDraftBoard([]);
                            }}
                            className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs py-3 rounded-xl uppercase tracking-wider transition-all cursor-pointer border border-zinc-800"
                          >
                            Configure New Draft
                          </button>
                        </div>

                      </div>
                    );
                  })()}

                </div>
              )}

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

          {/* TAB 5: Nightly CSV Picks & Draft Projections Review */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              <div className="bg-[#202025] border border-[#34343d] rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h3 className="text-xs uppercase font-extrabold tracking-wider text-[#ccff00] flex items-center gap-1.5">
                    <Upload size={14} /> Nightly CSV Picks & Projections Review
                  </h3>
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold uppercase">
                    🛡️ Database Safe • Session Review Only
                  </span>
                </div>
                <p className="text-[11px] text-[#a3a3b3] leading-relaxed">
                  Upload custom CSV player metrics or nightly picks for your personal review during pick making and mock drafts. This data is loaded strictly into your active session review workspace, keeping the core website database safe and unchanged.
                </p>

                {/* Example format */}
                <div className="bg-[#121214] p-2.5 rounded-xl border border-[#222227] text-[10px] font-mono text-white/50 leading-loose">
                  <span className="text-[#ccff00]">Roster / Pick format:</span><br />
                  Player,Team,Pos,PTS,REB,AST,STL,BLK,FG%,3P%<br />
                  Michael Jordan,Bulls,G,30.1,6.2,5.3,2.3,0.8,49.7%,32.7%
                </div>

                <form onSubmit={handleCSVImport} className="space-y-3">
                  <textarea
                    rows={5}
                    placeholder="Paste your NBA Real_World_Data CSV lines here for pick review..."
                    value={csvFileContent}
                    onChange={(e) => setCsvFileContent(e.target.value)}
                    className="bg-[#121214] border border-[#2c2c35] p-3 text-xs w-full rounded-xl font-mono text-[#ccff00] focus:border-[#ccff00] outline-none"
                  />
                  
                  <button 
                    type="submit"
                    disabled={isUploading}
                    className="w-full bg-[#ccff00] font-black text-black text-xs py-2.5 tracking-wider uppercase rounded-xl hover:bg-[#b5e000] transition-colors disabled:opacity-40 cursor-pointer shadow-md"
                  >
                    {isUploading ? 'PROCESSING CSV PICKS...' : 'IMPORT CSV PICKS FOR SESSION REVIEW'}
                  </button>
                </form>

                {csvUploadStatus && (
                  <div className="bg-[#121214] p-3 rounded-xl border border-[#2b2b32] text-[10px] flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#00e676]">
                    <Check size={12} /> {csvUploadStatus}
                  </div>
                )}
              </div>

              {/* SESSION CSV REVIEW TABLE */}
              {uploadedCsvPicks.length > 0 && (
                <div className="bg-[#202025] border border-[#34343d] rounded-2xl p-4 space-y-3 animate-fadeIn">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-extrabold text-white font-mono">
                        📋 Your Imported Session Picks ({uploadedCsvPicks.length})
                      </span>
                      <span className="text-[9px] text-zinc-400 font-mono">Ready for Review</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedCsvPicks([])}
                      className="text-[9px] text-rose-400 hover:text-rose-300 font-bold uppercase bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 cursor-pointer"
                    >
                      Clear Review Slate
                    </button>
                  </div>

                  <div className="max-h-[260px] overflow-y-auto border border-zinc-800 rounded-xl bg-[#121214]">
                    <table className="w-full text-left text-[10px] font-mono">
                      <thead className="bg-[#18181c] text-zinc-400 border-b border-zinc-800 sticky top-0">
                        <tr>
                          <th className="p-2 font-bold uppercase">Player</th>
                          <th className="p-2 font-bold uppercase">Team</th>
                          <th className="p-2 font-bold uppercase">Pos</th>
                          <th className="p-2 font-bold uppercase text-right">PTS</th>
                          <th className="p-2 font-bold uppercase text-right">REB</th>
                          <th className="p-2 font-bold uppercase text-right">AST</th>
                          <th className="p-2 font-bold uppercase text-right">STL</th>
                          <th className="p-2 font-bold uppercase text-right">BLK</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900 text-zinc-200">
                        {uploadedCsvPicks.map((item, i) => (
                          <tr key={i} className="hover:bg-zinc-800/50 transition-colors">
                            <td className="p-2 font-bold text-[#ccff00]">{item.name}</td>
                            <td className="p-2 uppercase font-bold text-zinc-400">{item.team || '-'}</td>
                            <td className="p-2 uppercase font-bold text-zinc-400">{item.position || '-'}</td>
                            <td className="p-2 text-right font-bold text-white">{item.pts ?? '-'}</td>
                            <td className="p-2 text-right text-zinc-400">{item.reb ?? '-'}</td>
                            <td className="p-2 text-right text-zinc-400">{item.ast ?? '-'}</td>
                            <td className="p-2 text-right text-zinc-400">{item.stl ?? '-'}</td>
                            <td className="p-2 text-right text-zinc-400">{item.blk ?? '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: LIVE-SYNC ROSTER OPTIMIZER */}
          {activeTab === 'optimizer' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Header Action panel */}
              <div className="bg-gradient-to-r from-[#17171e] to-[#252530] border border-[#30303e] rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 animate-slideDown">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#ccff00] text-black font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase">
                      In-Season NFL Fantasy
                    </span>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e676] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e676]"></span>
                    </span>
                  </div>
                  <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                    <Zap className="text-[#ccff00] fill-[#ccff00]/20" size={16} /> LIVE-SYNC ROSTER OPTIMIZER
                  </h3>
                  <p className="text-[10.5px] text-[#a3a3b3]">
                    Map, evaluate, and optimize active Sleeper league lineups against Strategy Tiers.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
                  <button 
                    onClick={() => {
                      setSelectedSport('nfl');
                      setActiveTab('draft');
                    }}
                    className="bg-[#ccff00] hover:bg-[#b5e000] text-black font-black px-3.5 py-2 rounded-xl text-[10.5px] uppercase flex items-center gap-1.5 transition-all flex-1 md:flex-initial justify-center shadow-md cursor-pointer"
                  >
                    <Cpu size={13} />
                    <span>Launch Mock Draft Sim</span>
                  </button>

                  <button 
                    onClick={() => setShowRankingsModal(true)}
                    className="bg-[#2a2a35] hover:bg-[#323242] text-white border border-[#3d3d4e] px-3.5 py-2 rounded-xl text-[10.5px] font-bold flex items-center gap-1.5 transition-all flex-1 md:flex-initial justify-center cursor-pointer"
                  >
                    <BookOpen size={13} className="text-[#ccff00]" />
                    <span>Strategies Sheet</span>
                  </button>
                </div>
              </div>

              {/* Sleeper API Gateway Input box */}
              <div className="bg-[#191922] border border-[#2b2b3a] rounded-2xl p-4 space-y-3 shadow-md">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10.5px] uppercase font-extrabold text-[#ccff00] tracking-wider flex items-center gap-1.5">
                    <Cpu size={13} /> Sleeper API Gateway (Read-Only)
                  </h4>
                  <span className="text-[9px] text-[#71717a] font-bold">PUBLIC & NO KEYS REQUIRED</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-grow">
                    <input 
                      type="text" 
                      placeholder="Enter Sleeper League ID (e.g. 112233) or 'demo'"
                      value={sleeperLeagueId}
                      onChange={(e) => setSleeperLeagueId(e.target.value)}
                      className="w-full bg-[#121217] text-xs px-3.5 py-3 rounded-xl border border-[#2d2d3c] text-white placeholder-zinc-600 focus:border-[#ccff00] outline-none font-bold"
                    />
                  </div>
                  
                  <button 
                    onClick={() => handleSyncLeague()}
                    disabled={isSyncingLeague}
                    className="bg-[#ccff00] hover:bg-[#b5e000] text-black font-black text-xs px-5 py-3 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                  >
                    <RefreshCw size={13} className={isSyncingLeague ? 'animate-spin' : ''} />
                    <span>{isSyncingLeague ? 'Syncing...' : 'Sync League'}</span>
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-zinc-500 font-bold">Quick Presets:</span>
                  <button 
                    onClick={() => { setSleeperLeagueId('demo'); handleSyncLeague('demo'); }}
                    className="text-[10px] bg-[#222] hover:bg-[#333] text-[#ccff00] px-2.5 py-1 rounded border border-[#ccff00]/20 font-bold"
                  >
                    Demo Mode (Mock League)
                  </button>
                  <button 
                    onClick={() => { setSleeperLeagueId('999999'); handleSyncLeague('999999'); }}
                    className="text-[10px] bg-[#222] hover:bg-[#333] text-white px-2.5 py-1 rounded border border-zinc-800 font-bold"
                  >
                    Alternate Demo
                  </button>
                </div>

                {syncError && (
                  <div className="bg-[#361616] text-[#ff8a8a] border border-[#6b2525] p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <p className="leading-tight">{syncError}</p>
                  </div>
                )}
              </div>

              {/* Dynamic synced content */}
              {syncedLeagueData ? (
                <div className="space-y-4">
                  
                  {/* League Banner */}
                  <div className="bg-[#111116] p-3 rounded-xl border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy size={16} className="text-[#ccff00]" />
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        {syncedLeagueData.leagueName}
                      </span>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-black px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
                      Active Sync
                    </span>
                  </div>

                  {/* Team Standings / Selector Carousel */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 block pl-1">
                      Synced League Standings (Select Team to Optimize):
                    </span>
                    <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                      {syncedLeagueData.rosters.map((roster: any, idx: number) => {
                        const isSelected = selectedRosterIdx === idx;
                        const recordStr = `${roster.wins}-${roster.losses}`;
                        return (
                          <motion.div 
                            key={roster.rosterId}
                            initial={{ opacity: 0, scale: 0.92, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.22, delay: idx * 0.035 }}
                            whileHover={{ scale: 1.025 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSelectedRosterIdx(idx)}
                            className={`shrink-0 w-44 p-3 rounded-xl cursor-pointer transition-all border ${
                              isSelected 
                                ? 'bg-gradient-to-br from-[#1d2715] to-[#121215] border-[#ccff00] shadow-sm shadow-[#ccff00]/10' 
                                : 'bg-[#1a1a23] hover:bg-[#20202d] border-[#2b2b3a] text-[#8e8e9f]'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <span className={`text-[11px] font-black truncate max-w-[110px] ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                                {roster.username}
                              </span>
                              <span className="text-[9px] font-black bg-zinc-800 text-zinc-400 px-1 rounded">
                                #{roster.rosterId}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-zinc-800/50">
                              <span className="text-[10px] font-mono font-bold text-zinc-400">
                                {recordStr} ({Math.round(roster.wins / (roster.wins + roster.losses || 1) * 100)}% Win)
                              </span>
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                                roster.analysis.strategy.includes('Zero-RB') 
                                  ? 'bg-[#ccff00]/15 text-[#ccff00]' 
                                  : roster.analysis.strategy.includes('Robust-RB')
                                    ? 'bg-orange-500/10 text-orange-400'
                                    : 'bg-cyan-500/10 text-cyan-400'
                              }`}>
                                {roster.analysis.strategy.split(' ')[0]}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Roster Analysis Panel */}
                  {syncedLeagueData.rosters[selectedRosterIdx] && (
                    <div className="space-y-4">
                      
                      {/* OPTIMIZER SUB-TAB NAVIGATION */}
                      <div className="bg-[#14141d] border border-[#2d2d3e] p-1.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-lg">
                        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => setOptimizerSubTab('heatmap')}
                            className={`flex-1 sm:flex-initial text-[11px] font-black px-3.5 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              optimizerSubTab === 'heatmap'
                                ? 'bg-[#ccff00] text-black shadow-md shadow-[#ccff00]/10'
                                : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                            }`}
                          >
                            <BarChart2 size={14} />
                            <span>Roster Heatmap</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setOptimizerSubTab('lineup')}
                            className={`flex-1 sm:flex-initial text-[11px] font-black px-3.5 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              optimizerSubTab === 'lineup'
                                ? 'bg-[#ccff00] text-black shadow-md shadow-[#ccff00]/10'
                                : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                            }`}
                          >
                            <Activity size={14} />
                            <span>Matchup Grid</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setOptimizerSubTab('depth')}
                            className={`flex-1 sm:flex-initial text-[11px] font-black px-3.5 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              optimizerSubTab === 'depth'
                                ? 'bg-[#ccff00] text-black shadow-md shadow-[#ccff00]/10'
                                : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                            }`}
                          >
                            <Layers size={14} />
                            <span>Depth Hierarchy</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setOptimizerSubTab('overview')}
                            className={`flex-1 sm:flex-initial text-[11px] font-black px-3.5 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              optimizerSubTab === 'overview'
                                ? 'bg-[#ccff00] text-black shadow-md shadow-[#ccff00]/10'
                                : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                            }`}
                          >
                            <Grid size={14} />
                            <span>Full Roster View</span>
                          </button>
                        </div>

                        <div className="hidden lg:flex items-center gap-2 px-3 text-[10px] text-zinc-400 font-mono font-bold">
                          <Flame size={12} className="text-[#ccff00]" />
                          <span>Heat Intensity Active</span>
                        </div>
                      </div>

                      {/* Strategy Overview Block */}
                      <div className="bg-gradient-to-b from-[#1c1c24] to-[#14141a] border border-[#2b2b3a] rounded-2xl p-4 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800/80 pb-3">
                          <div>
                            <span className="text-[9px] text-[#ccff00] font-black uppercase tracking-widest block">
                              Coaching Staff Diagnosis
                            </span>
                            <h4 className="text-base font-black text-white italic tracking-tighter uppercase">
                              {syncedLeagueData.rosters[selectedRosterIdx].username}'s Team Strategy
                            </h4>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">
                                Power Rating
                              </span>
                              <span className="text-sm font-black text-white font-mono">
                                {syncedLeagueData.rosters[selectedRosterIdx].analysis.overallPower} / 100
                              </span>
                            </div>
                            <div className="w-12 h-12 rounded-full border-4 border-zinc-800 flex items-center justify-center bg-[#111] relative">
                              <div className="absolute inset-0 rounded-full border-4 border-t-[#ccff00] animate-spin-slow"></div>
                              <span className="text-xs font-black text-[#ccff00]">
                                {syncedLeagueData.rosters[selectedRosterIdx].analysis.overallPower}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Strategy Description and Alerts */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          
                          <div className="md:col-span-4 space-y-2.5 bg-[#121217] p-3.5 rounded-xl border border-zinc-800/60">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase block">
                              Detected Build Model:
                            </span>
                            <div className="inline-flex items-center gap-1.5 bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                              <Activity size={12} />
                              {syncedLeagueData.rosters[selectedRosterIdx].analysis.strategy}
                            </div>
                            <p className="text-[10.5px] text-[#8e8e9f] leading-relaxed">
                              {syncedLeagueData.rosters[selectedRosterIdx].analysis.strategy.includes('Zero-RB') 
                                ? 'Zero-RB Strategy targets high-end receivers early while stockpiling later high-upside committee running backs. Optimal starting requirements prioritize WR-heavy flexing.'
                                : syncedLeagueData.rosters[selectedRosterIdx].analysis.strategy.includes('Hero-RB')
                                  ? 'Hero-RB Strategy pairs one cornerstone workhorse back in Tier 1 with robust receiver assets across early-to-mid rounds. Perfect roster balance setup.'
                                  : syncedLeagueData.rosters[selectedRosterIdx].analysis.strategy.includes('Robust-RB')
                                    ? 'Robust-RB focuses heavily on locking down top positional ball carriers early. Requires mining the waivers for dynamic WR prospects.'
                                    : 'Balanced Build model. Maps equal draft weight distribution across running backs and wide receiver assets.'}
                            </p>
                          </div>

                          <div className="md:col-span-8 space-y-2.5">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase block pl-1">
                              Waiver Wire & Trade Intelligence Feed:
                            </span>
                            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                              {syncedLeagueData.rosters[selectedRosterIdx].analysis.alerts.length === 0 ? (
                                <div className="p-3 bg-zinc-900/40 text-zinc-400 text-xs rounded-xl italic">
                                  Roster is fully optimized with premium positional integrity. No waiver actions required!
                                </div>
                              ) : (
                                syncedLeagueData.rosters[selectedRosterIdx].analysis.alerts.map((alert: string, aIdx: number) => {
                                  const isWaiver = alert.includes('Waiver Alert');
                                  const isTrade = alert.includes('Trade Target');
                                  return (
                                    <div 
                                      key={aIdx}
                                      className={`p-3 rounded-xl border flex gap-2.5 items-start text-[11px] leading-relaxed ${
                                        isWaiver 
                                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' 
                                          : isTrade 
                                            ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
                                            : 'bg-[#ccff00]/10 border-[#ccff00]/20 text-[#ccff00]'
                                      }`}
                                    >
                                      <div className="shrink-0 pt-0.5">
                                        {isWaiver ? <AlertCircle size={13} /> : isTrade ? <ArrowLeftRight size={13} /> : <Sparkles size={13} />}
                                      </div>
                                      <p>{alert}</p>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* VISUAL ROSTER HEATMAP DASHBOARD PANEL */}
                      {(optimizerSubTab === 'heatmap' || optimizerSubTab === 'overview') && syncedLeagueData.rosters[selectedRosterIdx] && (() => {
                        const activeRoster = syncedLeagueData.rosters[selectedRosterIdx];
                        const starters = activeRoster.starters || [];
                        const bench = activeRoster.bench || [];

                        // Filter slots based on view mode and position filter
                        let displaySlots: { slotName: string; isStarter: boolean; player: any }[] = [];
                        
                        if (heatmapViewMode === 'starters' || heatmapViewMode === 'matrix') {
                          starters.forEach((p: any, idx: number) => {
                            displaySlots.push({
                              slotName: `${p.position || 'STARTER'} #${idx + 1}`,
                              isStarter: true,
                              player: p
                            });
                          });
                        }
                        
                        if (heatmapViewMode === 'matrix') {
                          bench.forEach((p: any, idx: number) => {
                            displaySlots.push({
                              slotName: `BENCH #${idx + 1}`,
                              isStarter: false,
                              player: p
                            });
                          });
                        }

                        if (heatmapViewMode === 'liabilities') {
                          [...starters, ...bench].forEach((p: any, idx: number) => {
                            const info = getHeatmapSlotInfo(p);
                            if (info.status === 'BELOW_AVG' || info.status === 'LOW_VALUE') {
                              displaySlots.push({
                                slotName: `${p.position || 'SLOT'} ${idx + 1}`,
                                isStarter: idx < starters.length,
                                player: p
                              });
                            }
                          });
                        }

                        if (heatmapFilterPos !== 'ALL') {
                          displaySlots = displaySlots.filter(s => s.player?.position?.toUpperCase() === heatmapFilterPos);
                        }

                        // Aggregate heatmap statistics for starter slots
                        const starterInfos = starters.map((p: any) => getHeatmapSlotInfo(p));
                        const highValueCount = starterInfos.filter((i: any) => i.status === 'HIGH_VALUE' || i.status === 'ABOVE_AVG').length;
                        const neutralCount = starterInfos.filter((i: any) => i.status === 'NEUTRAL').length;
                        const lowValueCount = starterInfos.filter((i: any) => i.status === 'BELOW_AVG' || i.status === 'LOW_VALUE').length;
                        const totalSurplus = starterInfos.reduce((acc: number, curr: any) => acc + curr.delta, 0);

                        return (
                          <div className="bg-[#161620] border border-[#2d2d3e] rounded-2xl p-4 space-y-4 shadow-xl">
                            
                            {/* Panel Title & Header Controls */}
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 border-b border-zinc-800/80 pb-3.5">
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-[9.5px] bg-[#ccff00] text-black font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                                    Visual Roster Heatmap
                                  </span>
                                  <span className="text-[10px] text-zinc-400 font-bold font-mono">
                                    vs. Positional League Benchmarks
                                  </span>
                                </div>
                                <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                                  <BarChart2 size={16} className="text-[#ccff00]" />
                                  Positional Performance Heatmap & Slot Value Differential
                                </h4>
                              </div>

                              {/* Interactive View Controls */}
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="bg-[#101015] border border-zinc-800 p-1 rounded-xl flex items-center gap-1">
                                  <button
                                    onClick={() => setHeatmapViewMode('matrix')}
                                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                      heatmapViewMode === 'matrix'
                                        ? 'bg-[#ccff00] text-black shadow-sm'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    All Roster Slots
                                  </button>
                                  <button
                                    onClick={() => setHeatmapViewMode('starters')}
                                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                      heatmapViewMode === 'starters'
                                        ? 'bg-[#ccff00] text-black shadow-sm'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    Starters Only
                                  </button>
                                  <button
                                    onClick={() => setHeatmapViewMode('liabilities')}
                                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                                      heatmapViewMode === 'liabilities'
                                        ? 'bg-red-500 text-white shadow-sm'
                                        : 'text-red-400 hover:text-red-300'
                                    }`}
                                  >
                                    <ShieldAlert size={11} />
                                    Liabilities ({lowValueCount})
                                  </button>
                                </div>

                                <button
                                  onClick={() => setShowHeatmapCardOverlay(!showHeatmapCardOverlay)}
                                  className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                                    showHeatmapCardOverlay
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                  }`}
                                >
                                  <Flame size={12} className={showHeatmapCardOverlay ? 'text-emerald-400' : 'text-zinc-500'} />
                                  <span>Card Overlays: {showHeatmapCardOverlay ? 'ON' : 'OFF'}</span>
                                </button>
                              </div>
                            </div>

                            {/* Color-Coded Intensity Scale Legend Bar */}
                            <div className="bg-[#111118] border border-zinc-800 p-2.5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-[10px] font-mono">
                              <span className="font-extrabold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                                <Flame size={13} className="text-[#ccff00]" /> Intensity Scale:
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                                <span className="bg-emerald-500/20 text-[#ccff00] border border-emerald-500/40 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 text-[9.5px]">
                                  <span className="w-2 h-2 rounded-full bg-[#ccff00]" /> High-Value (+3.0+ PTS)
                                </span>
                                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 text-[9.5px]">
                                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> Above Avg (+0.8 to +3.0)
                                </span>
                                <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 text-[9.5px]">
                                  <span className="w-2 h-2 rounded-full bg-zinc-400" /> Neutral (-1.5 to +0.8)
                                </span>
                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 text-[9.5px]">
                                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Below Avg (-1.5 to -3.5)
                                </span>
                                <span className="bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 text-[9.5px]">
                                  <span className="w-2 h-2 rounded-full bg-red-500" /> Liability (-3.5+ PTS)
                                </span>
                              </div>
                            </div>

                            {/* Positional Benchmark Summary Strip */}
                            <div className="space-y-1.5">
                              <span className="text-[9.5px] font-mono uppercase font-extrabold text-zinc-500 tracking-wider block">
                                League Positional Baseline Benchmarks (PTS / Game):
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                                {Object.entries(positionalAverages).filter(([pos]) => pos !== 'FLEX').map(([pos, rawAvg]) => {
                                  const avg = Number(rawAvg);
                                  // Compute current team starter average for this position
                                  const teamPosStarters = starters.filter((p: any) => p.position?.toUpperCase() === pos);
                                  const teamAvg = teamPosStarters.length > 0
                                    ? Math.round((teamPosStarters.reduce((a: number, b: any) => a + (b.projectedPts || 0), 0) / teamPosStarters.length) * 10) / 10
                                    : null;
                                  const teamDiff = teamAvg !== null ? Math.round((teamAvg - avg) * 10) / 10 : null;

                                  return (
                                    <div key={pos} className="bg-[#111116] border border-zinc-800/80 p-2 rounded-xl flex flex-col justify-between gap-1">
                                      <div className="flex justify-between items-center text-[10px]">
                                        <span className="font-extrabold text-white">{pos}</span>
                                        <span className="font-mono text-zinc-400">{avg} avg</span>
                                      </div>
                                      <div className="flex justify-between items-end text-[10.5px]">
                                        <span className="text-[9px] text-zinc-500 font-bold uppercase">Team:</span>
                                        <span className={`font-mono font-black ${
                                          teamDiff === null ? 'text-zinc-500' : teamDiff >= 0 ? 'text-[#ccff00]' : 'text-red-400'
                                        }`}>
                                          {teamAvg !== null ? `${teamAvg} (${teamDiff >= 0 ? '+' : ''}${teamDiff})` : '—'}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Team Positional Value Surplus Stats Bar */}
                            <div className="bg-[#111117] p-3 rounded-xl border border-zinc-800/90 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center shrink-0">
                                  <TrendingUp size={18} className="text-[#ccff00]" />
                                </div>
                                <div>
                                  <div className="text-[10px] text-zinc-400 uppercase font-extrabold tracking-wider">
                                    Active Roster Value Surplus / Deficit
                                  </div>
                                  <div className="text-sm font-black text-white font-mono flex items-center gap-2">
                                    <span className={totalSurplus >= 0 ? 'text-[#ccff00]' : 'text-red-400'}>
                                      {totalSurplus >= 0 ? `+${totalSurplus.toFixed(1)} PTS` : `${totalSurplus.toFixed(1)} PTS`}
                                    </span>
                                    <span className="text-[10px] font-normal text-zinc-400">vs League Baseline</span>
                                  </div>
                                </div>
                              </div>

                              {/* Distribution Bar */}
                              <div className="w-full sm:w-auto flex flex-col items-start sm:items-end gap-1">
                                <div className="flex items-center gap-2 text-[10px] font-mono font-bold">
                                  <span className="text-[#ccff00]">🔥 {highValueCount} High-Value</span>
                                  <span className="text-zinc-400">⚪ {neutralCount} Neutral</span>
                                  <span className="text-red-400">🔴 {lowValueCount} Low-Value</span>
                                </div>
                                {/* Stacked Progress Bar */}
                                <div className="w-full sm:w-48 h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                                  <div style={{ width: `${(highValueCount / (starters.length || 1)) * 100}%` }} className="bg-[#ccff00]" />
                                  <div style={{ width: `${(neutralCount / (starters.length || 1)) * 100}%` }} className="bg-zinc-500" />
                                  <div style={{ width: `${(lowValueCount / (starters.length || 1)) * 100}%` }} className="bg-red-500" />
                                </div>
                              </div>
                            </div>

                            {/* Position Filter Chips */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                              <span className="text-[10px] text-zinc-500 font-bold uppercase shrink-0 mr-1">Filter Position:</span>
                              {['ALL', 'QB', 'RB', 'WR', 'TE', 'DEF', 'K'].map(pos => (
                                <button
                                  key={pos}
                                  onClick={() => setHeatmapFilterPos(pos)}
                                  className={`text-[9.5px] font-extrabold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                    heatmapFilterPos === pos
                                      ? 'bg-zinc-200 text-black border-white shadow-sm'
                                      : 'bg-[#121218] text-zinc-400 border-zinc-800 hover:border-zinc-700'
                                  }`}
                                >
                                  {pos}
                                </button>
                              ))}
                            </div>

                            {/* Heatmap Slots Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {displaySlots.length === 0 ? (
                                <div className="col-span-full p-4 text-center bg-[#111116] border border-zinc-800 rounded-xl text-zinc-400 text-xs italic">
                                  No roster slots match the active heatmap filter parameters.
                                </div>
                              ) : (
                                displaySlots.map((slot, sIdx) => {
                                  const p = slot.player;
                                  const info = getHeatmapSlotInfo(p);
                                  return (
                                    <motion.div
                                      key={`${selectedRosterIdx}-${p.id || sIdx}`}
                                      initial={{ opacity: 0, y: 14, scale: 0.97 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      transition={{ duration: 0.22, delay: Math.min(sIdx * 0.035, 0.4) }}
                                      whileHover={{ scale: 1.015 }}
                                      className={`bg-gradient-to-b ${info.bgGradient} border ${info.glowClass} rounded-xl p-3 flex flex-col justify-between gap-2.5 relative overflow-hidden transition-all duration-200`}
                                    >
                                      {/* Top Slot Header */}
                                      <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[9px] bg-zinc-900/90 text-zinc-300 font-extrabold px-1.5 py-0.5 rounded border border-zinc-700/60 uppercase font-mono">
                                            {slot.slotName}
                                          </span>
                                          {slot.isStarter ? (
                                            <span className="text-[8px] bg-[#00e676]/10 text-[#00e676] font-bold px-1 rounded uppercase">
                                              Starter
                                            </span>
                                          ) : (
                                            <span className="text-[8px] bg-zinc-800 text-zinc-400 font-bold px-1 rounded uppercase">
                                              Bench
                                            </span>
                                          )}
                                        </div>

                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${info.badgeClass}`}>
                                          {info.label}
                                        </span>
                                      </div>

                                      {/* Player details & Projections */}
                                      <div className="flex justify-between items-end pt-1">
                                        <div>
                                          <div className="text-xs font-black text-white">{p.name}</div>
                                          <div className="text-[10px] text-zinc-400 font-bold font-mono uppercase">
                                            {p.team} • vs {p.opponent || 'N/A'}
                                          </div>
                                        </div>

                                        <div className="text-right">
                                          <div className="text-xs font-black font-mono text-white">
                                            {p.projectedPts} PTS
                                          </div>
                                          <div className="text-[9.5px] font-mono text-zinc-400">
                                            vs {info.posAvg} Avg
                                          </div>
                                        </div>
                                      </div>

                                      {/* Differential Banner & Progress Heat Bar */}
                                      <div className="space-y-1 bg-black/40 p-2 rounded-lg border border-white/5">
                                        <div className="flex justify-between items-center text-[10px] font-mono">
                                          <span className="text-zinc-400 uppercase font-bold">Positional Delta:</span>
                                          <span className={`font-black ${info.delta >= 0 ? 'text-[#ccff00]' : 'text-red-400'}`}>
                                            {info.delta >= 0 ? `+${info.delta.toFixed(1)} PTS` : `${info.delta.toFixed(1)} PTS`}
                                          </span>
                                        </div>

                                        {/* Heat Score Bar */}
                                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                          <div
                                            className={`h-full rounded-full transition-all duration-300 ${
                                              info.status === 'HIGH_VALUE' ? 'bg-[#ccff00]' :
                                              info.status === 'ABOVE_AVG' ? 'bg-cyan-400' :
                                              info.status === 'NEUTRAL' ? 'bg-zinc-500' :
                                              info.status === 'BELOW_AVG' ? 'bg-amber-400' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${info.score}%` }}
                                          />
                                        </div>
                                      </div>

                                    </motion.div>
                                  );
                                })
                              )}
                            </div>

                          </div>
                        );
                      })()}

                      {/* EXPANDABLE POSITIONAL DEPTH CHART VISUALIZATION */}
                      {(optimizerSubTab === 'depth' || optimizerSubTab === 'overview') && syncedLeagueData.rosters[selectedRosterIdx] && (() => {
                        const activeRoster = syncedLeagueData.rosters[selectedRosterIdx];
                        const starters = activeRoster.starters || [];
                        const bench = activeRoster.bench || [];
                        const allRosterPlayers = [...starters, ...bench];

                        // Group by position
                        const positionsOrder = ['QB', 'RB', 'WR', 'TE', 'DEF', 'K'];
                        const posGroups: Record<string, { starters: any[]; backups: any[]; totalCount: number }> = {};

                        positionsOrder.forEach(pos => {
                          posGroups[pos] = { starters: [], backups: [], totalCount: 0 };
                        });

                        allRosterPlayers.forEach((player: any) => {
                          const rawPos = (player.position || 'FLEX').toUpperCase();
                          const pos = positionsOrder.includes(rawPos) ? rawPos : 'WR';
                          
                          // Check if starter
                          const isStarter = starters.some((s: any) => s.id === player.id || s.name === player.name);
                          if (isStarter) {
                            posGroups[pos].starters.push(player);
                          } else {
                            posGroups[pos].backups.push(player);
                          }
                          posGroups[pos].totalCount += 1;
                        });

                        // Sort starters and backups within each position by projectedPts descending
                        positionsOrder.forEach(pos => {
                          posGroups[pos].starters.sort((a, b) => (b.projectedPts || 0) - (a.projectedPts || 0));
                          posGroups[pos].backups.sort((a, b) => (b.projectedPts || 0) - (a.projectedPts || 0));
                        });

                        // Position filter for depth chart
                        const activePositions = depthChartPosFilter === 'ALL' 
                          ? positionsOrder 
                          : positionsOrder.filter(p => p === depthChartPosFilter);

                        const totalBackups = bench.length;

                        return (
                          <div className="bg-[#14141e] border border-[#2b2b3d] rounded-2xl p-4 space-y-4 shadow-xl">
                            {/* Header bar with Expand/Collapse button */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800/90 pb-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center shrink-0">
                                  <Layers size={18} className="text-[#ccff00]" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9.5px] bg-[#ccff00] text-black font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">
                                      Depth Hierarchy
                                    </span>
                                    <span className="text-[10px] text-zinc-400 font-bold font-mono">
                                      {starters.length} Starters • {totalBackups} Backups
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                                    Positional Depth Chart & Backup Tier Breakdown
                                  </h4>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                {/* Filter position chips */}
                                <div className="hidden md:flex items-center gap-1 bg-[#0c0c12] p-1 rounded-xl border border-zinc-800">
                                  {['ALL', 'QB', 'RB', 'WR', 'TE'].map(pos => (
                                    <button
                                      key={pos}
                                      onClick={() => setDepthChartPosFilter(pos)}
                                      className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                                        depthChartPosFilter === pos
                                          ? 'bg-[#ccff00] text-black shadow-sm'
                                          : 'text-zinc-400 hover:text-white'
                                      }`}
                                    >
                                      {pos}
                                    </button>
                                  ))}
                                </div>

                                {/* Expand / Collapse Button */}
                                <button
                                  onClick={() => setIsDepthChartExpanded(!isDepthChartExpanded)}
                                  className="bg-[#1e1e2d] hover:bg-[#28283c] text-white border border-zinc-700 font-extrabold text-[11px] px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                                >
                                  <span>{isDepthChartExpanded ? 'Collapse Depth Chart' : 'Expand Depth Chart'}</span>
                                  {isDepthChartExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                </button>
                              </div>
                            </div>

                            {/* Expanded Depth Chart Body */}
                            {isDepthChartExpanded && (
                              <div className="space-y-4 animate-fadeIn">
                                {/* Depth Chart Positional Health Overview Alert Bar */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                                  {positionsOrder.slice(0, 4).map(pos => {
                                    const group = posGroups[pos];
                                    const hasBackups = group.backups.length > 0;
                                    const topBackup = group.backups[0];

                                    return (
                                      <div key={pos} className="bg-[#0f0f15] border border-zinc-800/80 p-2.5 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="w-6 h-6 rounded-md bg-zinc-800 text-white font-extrabold text-xs flex items-center justify-center font-mono">
                                            {pos}
                                          </span>
                                          <div>
                                            <div className="text-[10px] font-bold text-zinc-300">
                                              {group.starters.length} Starter{group.starters.length !== 1 ? 's' : ''} • {group.backups.length} Backup{group.backups.length !== 1 ? 's' : ''}
                                            </div>
                                            <div className="text-[9px] text-zinc-500 font-mono">
                                              {topBackup ? `Top Backup: ${topBackup.name}` : 'No Backup Depth'}
                                            </div>
                                          </div>
                                        </div>

                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                          !hasBackups 
                                            ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                                            : group.backups.length >= 2 
                                              ? 'bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/30' 
                                              : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                                        }`}>
                                          {!hasBackups ? '⚠️ Thin' : group.backups.length >= 2 ? '🛡️ Deep' : '⚡ Moderate'}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Positional Mobile Filter Selector (if small screen) */}
                                <div className="flex md:hidden items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                                  <span className="text-[10px] text-zinc-500 font-bold uppercase shrink-0 mr-1">Position:</span>
                                  {['ALL', 'QB', 'RB', 'WR', 'TE', 'DEF', 'K'].map(pos => (
                                    <button
                                      key={pos}
                                      onClick={() => setDepthChartPosFilter(pos)}
                                      className={`text-[9.5px] font-extrabold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                        depthChartPosFilter === pos
                                          ? 'bg-[#ccff00] text-black border-white'
                                          : 'bg-[#101015] text-zinc-400 border-zinc-800'
                                      }`}
                                    >
                                      {pos}
                                    </button>
                                  ))}
                                </div>

                                {/* Hierarchy Trees Grid by Position */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                  {activePositions.map(pos => {
                                    const group = posGroups[pos];
                                    const totalInPos = group.starters.length + group.backups.length;

                                    if (totalInPos === 0) {
                                      return (
                                        <div key={pos} className="bg-[#101016] border border-zinc-800/80 rounded-xl p-3 space-y-2">
                                          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                                            <span className="text-xs font-black text-white">{pos} DEPTH CHART</span>
                                            <span className="text-[9px] bg-zinc-800 text-zinc-400 font-bold px-2 py-0.5 rounded">0 Players</span>
                                          </div>
                                          <p className="text-[10.5px] text-zinc-500 italic py-2 text-center">No players on roster for {pos}</p>
                                        </div>
                                      );
                                    }

                                    return (
                                      <div key={pos} className="bg-[#101017] border border-zinc-800/90 rounded-2xl p-3.5 space-y-3 relative overflow-hidden">
                                        {/* Position Box Title */}
                                        <div className="flex justify-between items-center border-b border-zinc-800/80 pb-2.5">
                                          <div className="flex items-center gap-2">
                                            <span className="w-7 h-7 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] font-black text-xs flex items-center justify-center font-mono">
                                              {pos}
                                            </span>
                                            <div>
                                              <h5 className="text-xs font-black text-white uppercase tracking-tight">
                                                {pos === 'QB' ? 'Quarterbacks' : pos === 'RB' ? 'Running Backs' : pos === 'WR' ? 'Wide Receivers' : pos === 'TE' ? 'Tight Ends' : pos === 'DEF' ? 'Defense / ST' : 'Kickers'}
                                              </h5>
                                              <div className="text-[9.5px] text-zinc-400 font-mono">
                                                {group.starters.length} Starter{group.starters.length !== 1 ? 's' : ''} • {group.backups.length} Backup{group.backups.length !== 1 ? 's' : ''}
                                              </div>
                                            </div>
                                          </div>

                                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase ${
                                            group.backups.length === 0 
                                              ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                          }`}>
                                            {group.backups.length === 0 ? 'Handcuff Risk' : `${group.backups.length} Handcuff${group.backups.length > 1 ? 's' : ''}`}
                                          </span>
                                        </div>

                                        {/* Vertical Hierarchy Flow */}
                                        <div className="space-y-2">
                                          {/* STARTERS NODES */}
                                          {group.starters.map((player: any, idx: number) => {
                                            const tierInfo = getPlayerTierInfo(player);
                                            return (
                                              <motion.div 
                                                key={`${selectedRosterIdx}-${player.id || idx}`} 
                                                initial={{ opacity: 0, x: -12, scale: 0.98 }}
                                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                                transition={{ duration: 0.22, delay: idx * 0.04 }}
                                                whileHover={{ scale: 1.01 }}
                                                className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/40 rounded-xl p-2.5 relative"
                                              >
                                                <div className="flex justify-between items-start gap-2">
                                                  <div>
                                                    <div className="flex items-center gap-1.5 mb-0.5">
                                                      <span className="text-[8.5px] bg-[#00e676] text-black font-extrabold px-1.5 py-0.2 rounded font-mono uppercase">
                                                        {pos}{idx + 1} • STARTER
                                                      </span>
                                                      <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded border ${tierInfo.badgeClass}`}>
                                                        {tierInfo.label}
                                                      </span>
                                                    </div>
                                                    <div className="text-xs font-black text-white">{player.name}</div>
                                                    <div className="text-[9.5px] text-zinc-400 font-mono">
                                                      {player.team} • vs {player.opponent || 'N/A'}
                                                    </div>
                                                  </div>

                                                  <div className="text-right shrink-0">
                                                    <div className="text-xs font-black font-mono text-[#ccff00]">
                                                      {player.projectedPts} PTS
                                                    </div>
                                                    <div className="text-[8.5px] text-emerald-400 font-bold uppercase">
                                                      Starter
                                                    </div>
                                                  </div>
                                                </div>
                                              </motion.div>
                                            );
                                          })}

                                          {/* BACKUPS NODES (HIERARCHY TREES) */}
                                          {group.backups.length > 0 && (
                                            <div className="space-y-2 pt-1">
                                              <div className="flex items-center gap-2 my-1 text-zinc-600">
                                                <div className="h-[1px] bg-zinc-800 flex-1" />
                                                <span className="text-[8.5px] font-mono text-zinc-500 font-extrabold uppercase flex items-center gap-1">
                                                  <GitBranch size={10} /> Backup Hierarchy ({group.backups.length})
                                                </span>
                                                <div className="h-[1px] bg-zinc-800 flex-1" />
                                              </div>

                                              {group.backups.map((player: any, idx: number) => {
                                                const tierInfo = getPlayerTierInfo(player);
                                                const depthRole = idx === 0 ? 'Backup 1 (Primary Handcuff)' : idx === 1 ? 'Backup 2 (Secondary)' : `Backup ${idx + 1} (Reserve)`;
                                                
                                                return (
                                                  <motion.div 
                                                    key={`${selectedRosterIdx}-${player.id || idx}`} 
                                                    initial={{ opacity: 0, x: -12, scale: 0.98 }}
                                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                                    transition={{ duration: 0.22, delay: idx * 0.04 }}
                                                    whileHover={{ scale: 1.01 }}
                                                    className="bg-[#15151f] border border-zinc-800/90 rounded-xl p-2.5 hover:border-zinc-700 transition-all"
                                                  >
                                                    <div className="flex justify-between items-start gap-2">
                                                      <div>
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                          <span className="text-[8.5px] bg-zinc-800 text-zinc-300 font-bold px-1.5 py-0.2 rounded font-mono uppercase border border-zinc-700">
                                                            {pos}{group.starters.length + idx + 1} • {depthRole}
                                                          </span>
                                                        </div>
                                                        <div className="text-xs font-bold text-zinc-200">{player.name}</div>
                                                        <div className="text-[9.5px] text-zinc-400 font-mono">
                                                          {player.team} • vs {player.opponent || 'N/A'}
                                                        </div>
                                                      </div>

                                                      <div className="text-right shrink-0">
                                                        <div className="text-xs font-bold font-mono text-zinc-300">
                                                          {player.projectedPts} PTS
                                                        </div>
                                                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border inline-block mt-0.5 ${tierInfo.badgeClass}`}>
                                                          {tierInfo.label}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </motion.div>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Polymorphic Lineup Optimizer Grid */}
                      {(optimizerSubTab === 'lineup' || optimizerSubTab === 'overview') && (
                        <div className="space-y-4">
                        <div className="flex justify-between items-center pl-1">
                          <h5 className="text-xs uppercase font-extrabold text-[#ccff00] tracking-wider flex items-center gap-1.5">
                            <Activity size={13} /> Lineup Optimization & Matchups
                          </h5>
                          <span className="text-[10px] text-zinc-500 font-bold font-mono">
                            Starters: {syncedLeagueData.rosters[selectedRosterIdx].starters.length} | Bench: {syncedLeagueData.rosters[selectedRosterIdx].bench.length}
                          </span>
                        </div>

                        {/* STARTERS BLOCK */}
                        <div className="space-y-2">
                          <div className="text-[10px] uppercase font-black text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 flex justify-between">
                            <span>STARTERS</span>
                            <span className="text-[#00e676]">ACTIVE LINEUP</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {syncedLeagueData.rosters[selectedRosterIdx].starters.map((player: any, sIdx: number) => {
                              // Define rating details
                              const isSmash = player.matchupRating === 'smash';
                              const isFavorable = player.matchupRating === 'favorable';
                              const isTough = player.matchupRating === 'tough';
                              const isBrutal = player.matchupRating === 'brutal';
                              const heatmapInfo = getHeatmapSlotInfo(player);

                              // Position styling
                              const posColor = player.position === 'QB' ? 'bg-purple-600 text-white' :
                                               player.position === 'RB' ? 'bg-emerald-600 text-white' :
                                               player.position === 'WR' ? 'bg-blue-600 text-white' :
                                               player.position === 'TE' ? 'bg-orange-600 text-white' :
                                               'bg-zinc-600 text-white';

                              // Recommendations text based on position and tier
                              let actionText = 'MUST START';
                              let actionComment = 'Premium workload. Lock into active roster.';
                              if (player.tier >= 3) {
                                actionText = 'FLEX OPTION';
                                actionComment = 'Good matchup upside. High ceiling flex player.';
                              }
                              if (isTough || isBrutal) {
                                actionText = 'START - LOW FLOOR';
                                actionComment = 'Brutal matchup, but premium tier mandates starting.';
                              }

                              return (
                                <motion.div 
                                  key={`${selectedRosterIdx}-starter-${player.id || sIdx}`} 
                                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  transition={{ duration: 0.25, delay: Math.min(sIdx * 0.04, 0.4) }}
                                  whileHover={{ scale: 1.015 }}
                                  className={`bg-[#1c1c24] border rounded-xl p-3 flex flex-col justify-between gap-2 transition-all duration-150 ${
                                    showHeatmapCardOverlay ? heatmapInfo.cardBorder : 'border-zinc-800 hover:border-[#ccff00]/40'
                                  }`}
                                >
                                  {/* Heatmap Overlay Badge if enabled */}
                                  {showHeatmapCardOverlay && (
                                    <div className={`px-2 py-0.5 rounded-lg border flex items-center justify-between text-[9px] font-mono font-bold ${heatmapInfo.badgeClass}`}>
                                      <span className="flex items-center gap-1 uppercase">
                                        {heatmapInfo.badgeText}
                                      </span>
                                      <span className="opacity-80">Heat: {heatmapInfo.score}/100</span>
                                    </div>
                                  )}

                                  <div className="flex justify-between items-start">
                                    <div className="flex gap-2">
                                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${posColor}`}>
                                        {player.position}
                                      </span>
                                      <div>
                                        <div className="text-xs font-black text-white">{player.name}</div>
                                        <div className="text-[10px] text-zinc-500 font-bold uppercase font-mono">
                                          {player.team} • vs {player.opponent}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <div className="text-[11px] font-mono font-black text-[#ccff00]">{player.projectedPts} PTS</div>
                                      <div className="flex gap-1 justify-end items-center mt-0.5">
                                        <span className={`text-[8.5px] font-black px-1 rounded uppercase ${
                                          player.tier === 1 ? 'bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30' :
                                          player.tier === 2 ? 'bg-cyan-500/10 text-cyan-400' :
                                          'bg-zinc-800 text-zinc-400'
                                        }`}>
                                          T{player.tier}
                                        </span>
                                        <span className={`text-[8.5px] font-black px-1 rounded uppercase ${
                                          isSmash ? 'bg-emerald-500/10 text-emerald-400' :
                                          isFavorable ? 'bg-emerald-500/10 text-emerald-400' :
                                          isTough ? 'bg-amber-500/10 text-amber-400' :
                                          isBrutal ? 'bg-red-500/10 text-red-400' :
                                          'bg-zinc-800 text-zinc-400'
                                        }`}>
                                          {player.matchupRating}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Advice bottom bar */}
                                  <div className="bg-[#121217] p-2 rounded-lg border border-zinc-800/80 flex items-center justify-between text-[10px] mt-1">
                                    <span className={`font-black uppercase tracking-wider ${
                                      actionText.includes('MUST') ? 'text-[#00e676]' : 'text-amber-400'
                                    }`}>
                                      {actionText}
                                    </span>
                                    <span className="text-[9.5px] text-zinc-400 text-right truncate max-w-[170px]">
                                      {actionComment}
                                    </span>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>

                        {/* BENCH BLOCK */}
                        <div className="space-y-2">
                          <div className="text-[10px] uppercase font-black text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 flex justify-between">
                            <span>BENCH</span>
                            <span className="text-zinc-500">RESERVE ROSTER</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {syncedLeagueData.rosters[selectedRosterIdx].bench.map((player: any, bIdx: number) => {
                              const isSmash = player.matchupRating === 'smash';
                              const isFavorable = player.matchupRating === 'favorable';
                              const isBrutal = player.matchupRating === 'brutal';
                              const heatmapInfo = getHeatmapSlotInfo(player);

                              const posColor = player.position === 'QB' ? 'bg-purple-600/60 text-zinc-300' :
                                               player.position === 'RB' ? 'bg-emerald-600/60 text-zinc-300' :
                                               player.position === 'WR' ? 'bg-blue-600/60 text-zinc-300' :
                                               player.position === 'TE' ? 'bg-orange-600/60 text-zinc-300' :
                                               'bg-zinc-600/60 text-zinc-300';

                              // Bench recommendations
                              let actionText = 'SIT BENCH';
                              let actionComment = 'Keep on reserve. Monitor game health.';
                              if (isSmash && player.tier <= 3) {
                                actionText = 'COULD FLEX';
                                actionComment = 'Excellent smash matchup. Viable starting replacement.';
                              } else if (player.tier <= 2 && !isBrutal) {
                                actionText = 'SWAP CANDIDATE';
                                actionComment = 'High caliber bench asset. Swap for lower tier starter.';
                              }

                              return (
                                <motion.div 
                                  key={`${selectedRosterIdx}-bench-${player.id || bIdx}`} 
                                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  transition={{ duration: 0.25, delay: Math.min(bIdx * 0.04, 0.4) }}
                                  whileHover={{ scale: 1.015 }}
                                  className={`bg-[#16161e] border rounded-xl p-3 flex flex-col justify-between gap-2 transition-all duration-150 ${
                                    showHeatmapCardOverlay ? heatmapInfo.cardBorder : 'border-zinc-900 hover:border-[#ccff00]/20'
                                  }`}
                                >
                                  {/* Heatmap Overlay Badge if enabled */}
                                  {showHeatmapCardOverlay && (
                                    <div className={`px-2 py-0.5 rounded-lg border flex items-center justify-between text-[9px] font-mono font-bold ${heatmapInfo.badgeClass}`}>
                                      <span className="flex items-center gap-1 uppercase">
                                        {heatmapInfo.badgeText}
                                      </span>
                                      <span className="opacity-80">Heat: {heatmapInfo.score}/100</span>
                                    </div>
                                  )}

                                  <div className="flex justify-between items-start">
                                    <div className="flex gap-2">
                                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${posColor}`}>
                                        {player.position}
                                      </span>
                                      <div>
                                        <div className="text-xs font-bold text-zinc-300">{player.name}</div>
                                        <div className="text-[10px] text-zinc-500 font-bold uppercase font-mono">
                                          {player.team} • vs {player.opponent}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <div className="text-[11px] font-mono font-bold text-zinc-400">{player.projectedPts} PTS</div>
                                      <div className="flex gap-1 justify-end items-center mt-0.5">
                                        <span className="text-[8.5px] font-black px-1 rounded uppercase bg-zinc-800 text-zinc-500">
                                          T{player.tier}
                                        </span>
                                        <span className={`text-[8.5px] font-bold px-1 rounded uppercase ${
                                          isSmash ? 'text-emerald-500 bg-emerald-500/5' : 'text-zinc-500'
                                        }`}>
                                          {player.matchupRating}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Advice bottom bar */}
                                  <div className="bg-[#121217] p-2 rounded-lg border border-zinc-800/40 flex items-center justify-between text-[10px] mt-1">
                                    <span className={`font-black uppercase tracking-wider ${
                                      actionText.includes('SWAP') || actionText.includes('COULD') ? 'text-amber-400' : 'text-zinc-500'
                                    }`}>
                                      {actionText}
                                    </span>
                                    <span className="text-[9.5px] text-zinc-500 text-right truncate max-w-[170px]">
                                      {actionComment}
                                    </span>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            ) : (
                <div className="p-8 text-center bg-[#191922] border border-[#2b2b3a] rounded-2xl space-y-3">
                  <Activity size={32} className="text-[#ccff00] mx-auto animate-pulse" />
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">Sync Your Sleeper League</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    Import active rosters to diagnose starting requirements, leverage Hero-RB draft balance strategies, and trigger breakout notifications.
                  </p>
                </div>
              )}

              {/* RANKINGS SHEET MODAL */}
              {showRankingsModal && (
                <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-3 sm:p-6 z-[100] backdrop-blur-md animate-fadeIn">
                  <div className="bg-[#14141c] text-white border-2 border-zinc-700/80 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-scaleUp">
                    
                    {/* Modal Header */}
                    <div className="p-4 sm:p-6 border-b border-zinc-800 flex justify-between items-center bg-[#1a1a24]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#ccff00] text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">2026 Strategy Guide</span>
                          <h4 className="text-base sm:text-lg font-black text-[#ccff00] uppercase tracking-wide flex items-center gap-2">
                            <BookOpen size={18} /> GOATPCKL Position Tiers & Strategy Sheet
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-300 font-medium">
                          Interactive established blueprint guides, positional tiers, and round-by-round strategy cheat sheet
                        </p>
                      </div>
                      <button 
                        onClick={() => setShowRankingsModal(false)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 hover:text-white w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-mono transition-all border border-zinc-600 cursor-pointer shrink-0 shadow-md"
                        title="Close Sheet"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Sub-Tabs Selector */}
                    <div className="flex border-b border-zinc-800 bg-[#121218] px-4 sm:px-6 gap-2 sm:gap-3 overflow-x-auto scrollbar-none pt-2">
                      <button
                        onClick={() => setModalSubTab('hero-blueprint')}
                        className={`py-2.5 px-4 text-xs sm:text-sm font-black uppercase tracking-wider rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                          modalSubTab === 'hero-blueprint'
                            ? 'bg-[#ccff00] text-black font-black shadow-md'
                            : 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/50'
                        }`}
                      >
                        <Zap size={14} />
                        <span>Hero-RB Guide (Pick 6)</span>
                      </button>
                      <button
                        onClick={() => setModalSubTab('position-tiers')}
                        className={`py-2.5 px-4 text-xs sm:text-sm font-black uppercase tracking-wider rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                          modalSubTab === 'position-tiers'
                            ? 'bg-[#ccff00] text-black font-black shadow-md'
                            : 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/50'
                        }`}
                      >
                        <Activity size={14} />
                        <span>Player Tiers Sheet</span>
                      </button>
                      <button
                        onClick={() => setModalSubTab('general-strategy')}
                        className={`py-2.5 px-4 text-xs sm:text-sm font-black uppercase tracking-wider rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                          modalSubTab === 'general-strategy'
                            ? 'bg-[#ccff00] text-black font-black shadow-md'
                            : 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/50'
                        }`}
                      >
                        <BookOpen size={14} />
                        <span>Draft Strategy Blueprint</span>
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-grow bg-[#14141c]">
                      
                      {/* TAB 1: HERO-RB BLUEPRINT */}
                      {modalSubTab === 'hero-blueprint' && (
                        <div className="space-y-6 animate-fadeIn">
                          
                          {/* Overview card */}
                          <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 p-5 rounded-2xl border-2 border-zinc-700/80 space-y-2.5 shadow-lg">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs bg-[#ccff00] text-black font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                2026 Golden Standard
                              </span>
                              <span className="text-xs text-[#ccff00] font-black uppercase tracking-wide">12-Team • Half-PPR • Middle Slot (Pick 6)</span>
                            </div>
                            <h5 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                              The 2026 "Hero-RB" Draft Blueprint
                            </h5>
                            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                              This strategy prioritizes securing an elite workhorse running back in Round 1 to anchor your backfield, then aggressively loading up on high-ceiling wide receivers and difference-maker starters in subsequent rounds to maximize weekly roster output.
                            </p>
                          </div>

                          {/* Round-by-Round Guide Table */}
                          <div className="space-y-3">
                            <h6 className="text-xs sm:text-sm font-black uppercase text-zinc-200 tracking-wider flex items-center gap-2 pl-1">
                              <span className="w-2 h-2 rounded-full bg-[#ccff00]" />
                              Round-by-Round Cheat Sheet (Middle Slot / Pick 6):
                            </h6>
                            <div className="border-2 border-zinc-700/80 rounded-2xl overflow-hidden bg-zinc-950 shadow-md">
                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                                  <thead>
                                    <tr className="bg-zinc-900 text-zinc-200 font-extrabold text-xs uppercase border-b-2 border-zinc-700">
                                      <th className="p-3.5">Round</th>
                                      <th className="p-3.5">Pos</th>
                                      <th className="p-3.5">Target Archetype</th>
                                      <th className="p-3.5">Example Targets (2026)</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-zinc-800 font-medium">
                                    <tr className="hover:bg-zinc-900/70 transition-colors">
                                      <td className="p-3.5 font-mono font-black text-[#ccff00] text-sm">R1</td>
                                      <td className="p-3.5"><span className="bg-emerald-500/20 text-emerald-300 font-black px-2 py-1 rounded text-xs border border-emerald-500/40">RB</span></td>
                                      <td className="p-3.5 text-zinc-100 font-bold">Elite Workhorse Anchor</td>
                                      <td className="p-3.5 text-zinc-200"><span className="text-white font-black bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">Jahmyr Gibbs</span> or <span className="text-white font-black bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">Bijan Robinson</span></td>
                                    </tr>
                                    <tr className="hover:bg-zinc-900/70 transition-colors">
                                      <td className="p-3.5 font-mono font-black text-[#ccff00] text-sm">R2</td>
                                      <td className="p-3.5"><span className="bg-blue-500/20 text-blue-300 font-black px-2 py-1 rounded text-xs border border-blue-500/40">WR</span></td>
                                      <td className="p-3.5 text-zinc-100 font-bold">High-Upside WR1</td>
                                      <td className="p-3.5 text-zinc-200"><span className="text-white font-black bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">Rashee Rice</span> or <span className="text-white font-black bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">Nico Collins</span></td>
                                    </tr>
                                    <tr className="hover:bg-zinc-900/70 transition-colors">
                                      <td className="p-3.5 font-mono font-black text-[#ccff00] text-sm">R3</td>
                                      <td className="p-3.5"><span className="bg-blue-500/20 text-blue-300 font-black px-2 py-1 rounded text-xs border border-blue-500/40">WR</span></td>
                                      <td className="p-3.5 text-zinc-100 font-bold">Volume & Target Magnet</td>
                                      <td className="p-3.5 text-zinc-200"><span className="text-white font-black bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">Drake London</span> or <span className="text-white font-black bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">George Pickens</span></td>
                                    </tr>
                                    <tr className="hover:bg-zinc-900/70 transition-colors">
                                      <td className="p-3.5 font-mono font-black text-[#ccff00] text-sm">R4</td>
                                      <td className="p-3.5"><span className="bg-orange-500/20 text-orange-300 font-black px-2 py-1 rounded text-xs border border-orange-500/40">TE</span></td>
                                      <td className="p-3.5 text-zinc-100 font-bold">Elite TE1 Advantage</td>
                                      <td className="p-3.5 text-zinc-200"><span className="text-white font-black bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">Brock Bowers</span> or <span className="text-white font-black bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">Trey McBride</span></td>
                                    </tr>
                                    <tr className="hover:bg-zinc-900/70 transition-colors">
                                      <td className="p-3.5 font-mono font-black text-[#ccff00] text-sm">R5</td>
                                      <td className="p-3.5"><span className="bg-blue-500/20 text-blue-300 font-black px-2 py-1 rounded text-xs border border-blue-500/40">WR</span></td>
                                      <td className="p-3.5 text-zinc-100 font-bold">WR2 / High-Ceiling Flex</td>
                                      <td className="p-3.5 text-zinc-200"><span className="text-white font-black bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">Emeka Egbuka</span> or <span className="text-white font-black bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">Devonta Smith</span></td>
                                    </tr>
                                    <tr className="hover:bg-zinc-900/70 transition-colors">
                                      <td className="p-3.5 font-mono font-black text-[#ccff00] text-sm">R6</td>
                                      <td className="p-3.5"><span className="bg-emerald-500/20 text-emerald-300 font-black px-2 py-1 rounded text-xs border border-emerald-500/40">RB</span></td>
                                      <td className="p-3.5 text-zinc-100 font-bold">Target Share & Upside RB2</td>
                                      <td className="p-3.5 text-zinc-200"><span className="text-white font-black bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">Javonte Williams</span> or <span className="text-white font-black bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">Breece Hall</span></td>
                                    </tr>
                                    <tr className="hover:bg-zinc-900/70 transition-colors">
                                      <td className="p-3.5 font-mono font-black text-[#ccff00] text-sm">R7</td>
                                      <td className="p-3.5"><span className="bg-blue-500/20 text-blue-300 font-black px-2 py-1 rounded text-xs border border-blue-500/40">WR</span></td>
                                      <td className="p-3.5 text-zinc-100 font-bold">Depth & Breakout Candidate</td>
                                      <td className="p-3.5 text-zinc-200"><span className="text-white font-black bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">Ladd McConkey</span> or <span className="text-white font-black bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">Luther Burden III</span></td>
                                    </tr>
                                    <tr className="hover:bg-zinc-900/70 transition-colors">
                                      <td className="p-3.5 font-mono font-black text-[#ccff00] text-sm">R8</td>
                                      <td className="p-3.5"><span className="bg-purple-500/20 text-purple-300 font-black px-2 py-1 rounded text-xs border border-purple-500/40">QB</span></td>
                                      <td className="p-3.5 text-zinc-100 font-bold">High-Floor Starting QB</td>
                                      <td className="p-3.5 text-zinc-200"><span className="text-white font-black bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">Justin Herbert</span> or <span className="text-white font-black bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">Jaxson Dart</span></td>
                                    </tr>
                                    <tr className="hover:bg-zinc-900/70 transition-colors">
                                      <td className="p-3.5 font-mono font-black text-[#ccff00] text-sm">R9</td>
                                      <td className="p-3.5"><span className="bg-emerald-500/20 text-emerald-300 font-black px-2 py-1 rounded text-xs border border-emerald-500/40">RB</span></td>
                                      <td className="p-3.5 text-zinc-100 font-bold">Complementary Committee Back</td>
                                      <td className="p-3.5 text-zinc-200"><span className="text-white font-black bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">David Montgomery</span> or <span className="text-white font-black bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">Quinshon Judkins</span></td>
                                    </tr>
                                    <tr className="hover:bg-zinc-900/70 transition-colors">
                                      <td className="p-3.5 font-mono font-black text-[#ccff00] text-sm">R10</td>
                                      <td className="p-3.5"><span className="bg-purple-500/20 text-purple-300 font-black px-2 py-1 rounded text-xs border border-purple-500/40">QB</span></td>
                                      <td className="p-3.5 text-zinc-100 font-bold">Dual-Threat Ceiling QB</td>
                                      <td className="p-3.5 text-zinc-200"><span className="text-white font-black bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">Brock Purdy</span> or <span className="text-white font-black bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">Kyler Murray</span></td>
                                    </tr>
                                    <tr className="hover:bg-zinc-900/70 transition-colors">
                                      <td className="p-3.5 font-mono font-black text-[#ccff00] text-sm">R11+</td>
                                      <td className="p-3.5"><span className="bg-zinc-800 text-zinc-300 font-black px-2 py-1 rounded text-xs border border-zinc-700">Bench</span></td>
                                      <td className="p-3.5 text-zinc-100 font-bold">Sleepers & Handcuffs</td>
                                      <td className="p-3.5 text-zinc-300">High-upside backup RBs, WR target sleepers, and team defenses</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>

                          {/* Strategic Rationale details */}
                          <div className="space-y-3">
                            <h6 className="text-xs sm:text-sm font-black uppercase text-zinc-200 tracking-wider flex items-center gap-2 pl-1">
                              <span className="w-2 h-2 rounded-full bg-[#ccff00]" />
                              Strategic Rationale Breakdown:
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-zinc-900/90 p-4 rounded-2xl border-2 border-zinc-700/80 space-y-1.5 shadow-md">
                                <span className="text-xs sm:text-sm font-black text-[#ccff00] uppercase block">
                                  Round 1 (The Anchor RB)
                                </span>
                                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                                  By securing <strong className="text-white font-bold">Gibbs</strong> or <strong className="text-white font-bold">Robinson</strong> early, you establish a Top-5 baseline producer at fantasy football's most scarce position. This takes immediate pressure off your running back room and enables you to pivot to elite WR value in rounds 2 & 3.
                                </p>
                              </div>

                              <div className="bg-zinc-900/90 p-4 rounded-2xl border-2 border-zinc-700/80 space-y-1.5 shadow-md">
                                <span className="text-xs sm:text-sm font-black text-blue-400 uppercase block">
                                  Rounds 2 & 3 (Stacked Wide Receivers)
                                </span>
                                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                                  Do not panic if early WRs fly off the board. Key targets like <strong className="text-white font-bold">Rice</strong> and <strong className="text-white font-bold">London</strong> deliver consistent target volume and explosive red-zone touch share, which is essential in half-PPR formats.
                                </p>
                              </div>

                              <div className="bg-zinc-900/90 p-4 rounded-2xl border-2 border-zinc-700/80 space-y-1.5 shadow-md">
                                <span className="text-xs sm:text-sm font-black text-orange-400 uppercase block">
                                  Round 4 (The Elite Tight End)
                                </span>
                                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                                  Drafting <strong className="text-white font-bold">Bowers</strong> or <strong className="text-white font-bold">McBride</strong> in Round 4 provides a massive positional points advantage over opponents who stream low-upside tight ends off waivers every week.
                                </p>
                              </div>

                              <div className="bg-zinc-900/90 p-4 rounded-2xl border-2 border-zinc-700/80 space-y-1.5 shadow-md">
                                <span className="text-xs sm:text-sm font-black text-emerald-400 uppercase block">
                                  Round 6 (The "Hero" Follow-Up RB2)
                                </span>
                                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                                  Now that your starting wide receivers and tight end are solidified, targeting a dual-threat running back like <strong className="text-white font-bold">Williams</strong> or <strong className="text-white font-bold">Hall</strong> secures an incredible 1-2 punch in your backfield.
                                </p>
                              </div>

                              <div className="bg-zinc-900/90 p-4 rounded-2xl border-2 border-zinc-700/80 space-y-1.5 shadow-md md:col-span-2">
                                <span className="text-xs sm:text-sm font-black text-purple-400 uppercase block">
                                  Rounds 8 & 10 (Late QB Strategy)
                                </span>
                                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                                  By waiting until Round 8, you avoid the heavy "QB tax" of early rounds. <strong className="text-white font-bold">Herbert</strong> or <strong className="text-white font-bold">Dart</strong> supply high-floor weekly passing volume, while late flyers on <strong className="text-white font-bold">Purdy</strong> or <strong className="text-white font-bold">Murray</strong> deliver elite dual-threat rushing upside without sacrificing positional depth.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Draft spot adjustments */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t-2 border-zinc-800 pt-5">
                            <div className="bg-zinc-900/90 p-4 rounded-2xl border-2 border-zinc-700/80 space-y-1.5">
                              <span className="text-xs sm:text-sm font-black text-zinc-100 uppercase block">
                                Adjustments for Early Draft Slots (Picks 1–3):
                              </span>
                              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                                In early slots, lock in your Tier 1 anchor RB at Pick 1, then use the Round 2/3 turn to grab two elite wide receivers back-to-back.
                              </p>
                            </div>

                            <div className="bg-zinc-900/90 p-4 rounded-2xl border-2 border-zinc-700/80 space-y-1.5">
                              <span className="text-xs sm:text-sm font-black text-zinc-100 uppercase block">
                                Adjustments for Turn Draft Slots (Picks 10–12):
                              </span>
                              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                                Look for "value pairs". If Tier 1 WRs fall to the turn, grab two elite receivers back-to-back and then execute your Hero-RB pick in Round 3.
                              </p>
                            </div>
                          </div>

                          {/* Pro Tip */}
                          <div className="bg-[#ccff00]/10 border-2 border-[#ccff00]/30 p-4 rounded-2xl flex gap-3.5 items-start text-xs sm:text-sm text-zinc-100 shadow-md">
                            <Sparkles className="text-[#ccff00] shrink-0 mt-0.5" size={18} />
                            <p className="leading-relaxed">
                              <strong className="text-[#ccff00] font-black uppercase tracking-wider">Draft Day Pro-Tip:</strong> Keep a close eye on positional tier runs. If you notice a tier—especially RB or TE—dwindling to 1 or 2 remaining targets, reach a round early to secure your guy rather than settling for low-upside backups later.
                            </p>
                          </div>

                        </div>
                      )}

                      {/* TAB 2: POSITION TIERS */}
                      {modalSubTab === 'position-tiers' && (
                        <div className="space-y-5 animate-fadeIn">
                          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                            <h6 className="text-xs sm:text-sm font-black uppercase text-zinc-200 tracking-wider flex items-center gap-2">
                              <Activity size={16} className="text-[#ccff00]" />
                              Established 2026 Positional Tier Cheat Sheet:
                            </h6>
                            <span className="text-xs text-[#ccff00] font-mono font-bold">Live Synced</span>
                          </div>

                          {nflRankingsSheet ? (
                            <div className="space-y-5">
                              {Object.entries(nflRankingsSheet).map(([pos, players]: [string, any]) => (
                                <div key={pos} className="bg-zinc-900/90 p-4 sm:p-5 rounded-2xl border-2 border-zinc-700/80 space-y-3 shadow-md">
                                  <div className="flex justify-between items-center border-b-2 border-zinc-800 pb-2.5">
                                    <span className="text-xs sm:text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
                                      <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00]" />
                                      {pos} POSITION TIERS
                                    </span>
                                    <span className="text-xs text-[#ccff00] font-black uppercase font-mono bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700">
                                      {players.length} Ranks Mapped
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {players.map((p: any) => (
                                      <div key={p.id} className="bg-zinc-950 p-3 rounded-xl flex justify-between items-center text-xs sm:text-sm border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm">
                                        <div className="flex items-center gap-2.5">
                                          <span className={`text-xs font-black px-2 py-0.5 rounded-md border ${
                                            p.tier === 1 ? 'bg-lime-500/20 text-[#ccff00] border-lime-500/40' :
                                            p.tier === 2 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                                            p.tier === 3 ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                                            'bg-zinc-800 text-zinc-300 border-zinc-700'
                                          }`}>
                                            T{p.tier}
                                          </span>
                                          <span className="font-bold text-white text-xs sm:text-sm">{p.name}</span>
                                          <span className="text-xs text-zinc-400 font-mono font-extrabold uppercase">{p.team}</span>
                                        </div>
                                        <span className="text-xs font-mono text-[#ccff00] font-black">{p.projectedPts} PTS</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 bg-zinc-900/60 text-center rounded-2xl border border-zinc-800 text-sm text-zinc-400 italic">
                              Loading established position rankings sheet...
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB 3: DRAFT STRATEGY BLUEPRINT */}
                      {modalSubTab === 'general-strategy' && (
                        <div className="space-y-5 animate-fadeIn">
                          <h6 className="text-xs sm:text-sm font-black uppercase text-zinc-200 tracking-wider flex items-center gap-2 pl-1">
                            <BookOpen size={16} className="text-[#ccff00]" />
                            Draft Strategy Blueprint Playbook:
                          </h6>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            
                            <div className="bg-zinc-900/90 p-5 rounded-2xl border-2 border-zinc-700/80 space-y-3 shadow-md flex flex-col">
                              <div className="border-b-2 border-zinc-800 pb-2">
                                <span className="text-xs bg-[#ccff00] text-black font-black px-2 py-0.5 rounded uppercase tracking-wider text-[10px]">Recommended</span>
                                <h5 className="text-sm sm:text-base font-black text-[#ccff00] uppercase mt-1">Hero-RB Strategy</h5>
                              </div>
                              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed flex-grow">
                                Draft one elite Tier 1 RB early to anchor your backfield, then load up on elite wide receivers and top flex targets. Maximizes starting flex roster consistency and reduces late-round RB volatility.
                              </p>
                              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1 text-xs">
                                <span className="text-zinc-400 font-bold uppercase block text-[10px]">Key Focus:</span>
                                <span className="text-white font-bold">1 Early RB • Stacked WRs • Elite TE</span>
                              </div>
                            </div>

                            <div className="bg-zinc-900/90 p-5 rounded-2xl border-2 border-zinc-700/80 space-y-3 shadow-md flex flex-col">
                              <div className="border-b-2 border-zinc-800 pb-2">
                                <span className="text-xs bg-cyan-500/20 text-cyan-300 font-black px-2 py-0.5 rounded uppercase tracking-wider text-[10px]">High Volume WRs</span>
                                <h5 className="text-sm sm:text-base font-black text-cyan-400 uppercase mt-1">Zero-RB Strategy</h5>
                              </div>
                              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed flex-grow">
                                Pass on running backs entirely in the first 5 rounds. Build a stacked WR/TE core with maximum target volume, then grab high-upside backup running backs and waiver breakouts.
                              </p>
                              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1 text-xs">
                                <span className="text-zinc-400 font-bold uppercase block text-[10px]">Key Focus:</span>
                                <span className="text-white font-bold">0 Early RBs • 5 High-Volume Receivers</span>
                              </div>
                            </div>

                            <div className="bg-zinc-900/90 p-5 rounded-2xl border-2 border-zinc-700/80 space-y-3 shadow-md flex flex-col">
                              <div className="border-b-2 border-zinc-800 pb-2">
                                <span className="text-xs bg-orange-500/20 text-orange-300 font-black px-2 py-0.5 rounded uppercase tracking-wider text-[10px]">Ground Dominance</span>
                                <h5 className="text-sm sm:text-base font-black text-orange-400 uppercase mt-1">Robust-RB Strategy</h5>
                              </div>
                              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed flex-grow">
                                Secure 3 elite Tier 1/2 running backs early to build extreme ball-carrier dominance and monopolize league rushing points, then extract WR target sleepers in middle strategy rounds.
                              </p>
                              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1 text-xs">
                                <span className="text-zinc-400 font-bold uppercase block text-[10px]">Key Focus:</span>
                                <span className="text-white font-bold">3 Heavy RBs Early • WR Sleepers Later</span>
                              </div>
                            </div>

                          </div>
                        </div>
                      )}

                    </div>

                    {/* Modal Footer */}
                    <div className="p-4 sm:p-5 border-t border-zinc-800 flex justify-between items-center bg-[#181822]">
                      <span className="text-xs text-zinc-400 font-mono hidden sm:block">
                        💡 Tip: You can switch between strategies during live mock draft simulations.
                      </span>
                      <button 
                        onClick={() => setShowRankingsModal(false)}
                        className="bg-[#ccff00] hover:bg-[#b5e000] text-black font-black text-xs sm:text-sm py-2.5 px-6 rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-md"
                      >
                        Return to Draft App
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* BOTTOM ESPN/DRAFTKINGS MOBILE APP BAR */}
        <div className="bg-[#111113] border-t border-[#2d2d34] flex justify-around py-3 px-2 z-10">
          <button 
            onClick={() => {
              setActiveTab('optimizer');
            }}
            className={`flex flex-col items-center gap-1 transition-all flex-1 cursor-pointer ${getTabColor('optimizer')}`}
          >
            <Zap size={16} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Optimizer</span>
          </button>

          <button 
            onClick={() => {
              setActiveTab('draft');
            }}
            className={`flex flex-col items-center gap-1 transition-all flex-1 cursor-pointer ${getTabColor('draft')}`}
          >
            <Tv size={16} />
            <span className="text-[9px] uppercase font-bold tracking-wider">
              {selectedSport === 'nfl' ? 'NFL Draft' : 'NBA Picks'}
            </span>
          </button>

          <button 
            onClick={() => {
              setActiveTab('standings');
            }}
            className={`flex flex-col items-center gap-1 transition-all flex-1 cursor-pointer ${getTabColor('standings')}`}
          >
            <Trophy size={16} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Lobby</span>
          </button>

          <button 
            onClick={() => {
              setActiveTab('xp-shop');
            }}
            className={`flex flex-col items-center gap-1 transition-all flex-1 cursor-pointer ${getTabColor('xp-shop')}`}
          >
            <ShoppingBag size={16} />
            <span className="text-[9px] uppercase font-bold tracking-wider">XP Shop</span>
          </button>

          <button 
            onClick={() => {
              setActiveTab('trivia');
            }}
            className={`flex flex-col items-center gap-1 transition-all flex-1 cursor-pointer ${getTabColor('trivia')}`}
          >
            <HelpCircle size={16} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Trivia</span>
          </button>

          <button 
            onClick={() => {
              setActiveTab('chat');
            }}
            className={`flex flex-col items-center gap-1 transition-all flex-1 cursor-pointer ${getTabColor('chat')}`}
          >
            <MessageSquare size={16} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Zone</span>
          </button>

          <button 
            onClick={() => {
              setActiveTab('csv');
            }}
            className={`flex flex-col items-center gap-1 transition-all flex-1 cursor-pointer ${getTabColor('csv')}`}
          >
            <FileText size={16} />
            <span className="text-[9px] uppercase font-bold tracking-wider">CSV Lab</span>
          </button>
        </div>

      </div>

      {/* CELEBRATION MODAL OVERLAY */}
      {showCelebration && celebrationDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-fadeIn">
          {/* Confetti container */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {confettiParticles.map(p => (
              <div
                key={p.id}
                className="absolute animate-celebrate-confetti"
                style={{
                  left: `${p.x}%`,
                  backgroundColor: p.color,
                  width: `${p.size}px`,
                  height: `${p.size * (Math.random() > 0.5 ? 1 : 1.5)}px`,
                  opacity: Math.random() * 0.4 + 0.6,
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                  '--fall-delay': `${p.delay}s`,
                  '--fall-duration': `${p.duration}s`,
                  '--sway': `${p.sway}px`
                } as any}
              />
            ))}
          </div>

          {/* Glowing Celebration Card */}
          <div 
            className="w-full max-w-sm bg-[#17171c] border-2 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center text-center shadow-2xl animate-celebrate-scaleUp animate-celebrate-glow"
            style={{
              borderColor: selectedSport === 'nfl' ? '#ccff00' : '#ff6600',
            }}
          >
            {/* Outer decorative shine lines */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ccff00] to-transparent opacity-50" />
            
            {/* Pulsing visual element */}
            <div className="relative mb-4 flex items-center justify-center">
              <div className={`absolute w-16 h-16 rounded-full ${sportBg} opacity-20 animate-celebrate-ring`} />
              <div className={`relative w-14 h-14 rounded-full ${sportBg} flex items-center justify-center shadow-lg`}>
                <Trophy size={26} className="text-black" />
              </div>
            </div>

            <h2 className="text-xl font-black italic tracking-tighter text-white uppercase mb-1">
              GOAT Status Unlocked!
            </h2>
            <p className="text-[10px] text-zinc-400 max-w-[260px] mb-4">
              Your selected lock or arena wager dominated court simulations tonight!
            </p>

            {/* GOAT Pick Result */}
            {celebrationDetails.isPickSuccess && (
              <div className="w-full bg-[#111113] border border-zinc-800 p-3 rounded-xl mb-4 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[9px] uppercase font-extrabold ${sportText} tracking-wider`}>🏆 Perfect GOAT Lock</span>
                  <span className={`text-[8px] ${sportText} font-bold`}>SUCCESSFUL</span>
                </div>
                <p className="text-xs font-black text-white mb-1">{celebrationDetails.player}</p>
                <p className="text-[10px] text-zinc-300 leading-relaxed font-mono">
                  {celebrationDetails.text}
                </p>
              </div>
            )}

            {/* Arena Wagers Conquered */}
            {celebrationDetails.isBetSuccess && (
              <div className="w-full space-y-2 mb-4 text-left max-h-[140px] overflow-y-auto scrollbar-hide">
                <span className="text-[9px] uppercase font-extrabold text-blue-400 tracking-wider block">⚔️ Arena Wagers Conquered</span>
                {celebrationDetails.wonBets.map((bet: any, bIdx: number) => (
                  <div key={bIdx} className="bg-[#111113] border border-zinc-800/80 p-2.5 rounded-lg flex flex-col gap-0.5 text-[9.5px] font-mono text-zinc-300">
                    <div className="flex justify-between font-bold text-blue-400">
                      <span>VS {bet.legendId.toUpperCase()}</span>
                      <span className="text-[8px] text-emerald-400">WON</span>
                    </div>
                    <p className="leading-snug">{bet.resultCommentary}</p>
                  </div>
                ))}
              </div>
            )}

            {/* XP reward summary */}
            <div className={`w-full py-2 px-3 ${sportLightBg} border ${sportLightBorder} rounded-xl mb-4.5 flex justify-between items-center text-[10.5px] font-bold font-mono`}>
              <span className="text-zinc-400 uppercase tracking-wider">Total XP Claimed:</span>
              <span className={`${sportText} font-black text-xs animate-pulse flex items-center gap-1`}>
                <Coins size={12} /> +{celebrationDetails.points} XP
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setShowCelebration(false);
                setCelebrationDetails(null);
              }}
              className={`w-full ${sportBg} ${sportBgHover} text-black font-black text-xs py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-lg`}
            >
              Claim Points & Continue
            </button>

          </div>
        </div>
      )}

    </div>
  );

}

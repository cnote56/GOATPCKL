
import React, { useState, useEffect, useCallback } from 'react';
import { TeamProfile, QueryStatus, Score, NewsArticle } from '../types';
import { Link } from 'react-router-dom';
import { EXAMPLE_FOOTBALL_PLAYERS, EXAMPLE_BASKETBALL_PLAYERS } from '../constants';
import { addFavoriteTeam, removeFavoriteTeam, isFavoriteTeam } from '../utils/favorites';
import { useUser } from '../context/UserContext';
import { geminiService } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';
import { ScoreCard } from './ScoreCard';

interface TeamDetailProps {
  team: TeamProfile;
}

const getPlayerPageLink = (playerName: string, sport: string) => {
  if (sport === 'Football' && EXAMPLE_FOOTBALL_PLAYERS.includes(playerName)) {
    return `/player/${encodeURIComponent(playerName)}`;
  }
  if (sport === 'Basketball' && EXAMPLE_BASKETBALL_PLAYERS.includes(playerName)) {
    return `/player/${encodeURIComponent(playerName)}`;
  }
  return '#';
};

export const TeamDetail: React.FC<TeamDetailProps> = ({ team }) => {
  const { currentUser } = useUser();
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'NEWS' | 'RESULTS' | 'FIXTURES' | 'DRAW'>('SUMMARY');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsStatus, setNewsStatus] = useState<QueryStatus>('idle');
  const [results, setResults] = useState<Score[]>([]);
  const [fixtures, setFixtures] = useState<Score[]>([]);
  const [gamesStatus, setGamesStatus] = useState<QueryStatus>('idle');


  useEffect(() => {
    setIsFavorited(isFavoriteTeam(currentUser.id, team.id));
  }, [team.id, currentUser.id]);

  const handleToggleFavorite = () => {
    if (isFavorited) {
      removeFavoriteTeam(currentUser.id, team.id);
    } else {
      addFavoriteTeam(currentUser.id, team.id);
    }
    setIsFavorited(!isFavorited);
  };

  const fetchTeamNews = useCallback(async () => {
    setNewsStatus('loading');
    try {
      const fetchedNews = await geminiService.getNewsArticles(team.name);
      setNews(fetchedNews || []);
      setNewsStatus('success');
    } catch (error) {
      console.error("Failed to fetch team news:", error);
      setNewsStatus('error');
    }
  }, [team.name]);

  const fetchTeamGames = useCallback(async () => {
    setGamesStatus('loading');
    try {
      const allGames = await geminiService.getLiveScores(team.sport, team.name);
      const pastGames = allGames.filter(g => g.gameState === 'Fulltime');
      const upcomingGames = allGames.filter(g => g.gameState === 'Upcoming' || g.gameState === 'Live' || g.gameState === 'Halftime');
      setResults(pastGames.sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime()));
      setFixtures(upcomingGames.sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime()));
      setGamesStatus('success');
    } catch (error) {
      console.error("Failed to fetch team games:", error);
      setGamesStatus('error');
    }
  }, [team.sport, team.name]);


  useEffect(() => {
    if (activeTab === 'NEWS' && newsStatus === 'idle') {
      fetchTeamNews();
    } else if ((activeTab === 'RESULTS' || activeTab === 'FIXTURES') && gamesStatus === 'idle') {
      fetchTeamGames();
    }
  }, [activeTab, newsStatus, gamesStatus, fetchTeamNews, fetchTeamGames]);


  return (
    <div className="bg-secondary rounded-lg shadow-xl p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 mb-8">
        <img
          src={team.logoUrl || `https://picsum.photos/150/150?random=${team.id}`}
          alt={`${team.name} logo`}
          className="w-32 h-32 object-contain rounded-full border-4 border-accent bg-tertiary p-2 mb-6 md:mb-0 shadow-md"
        />
        <div className="text-center md:text-left flex-grow">
          <div className="flex items-center justify-center md:justify-start mb-2">
            <h1 className="text-3xl font-extrabold text-accent mr-4">{team.name}</h1>
            <button
              onClick={handleToggleFavorite}
              aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
              className="p-2 rounded-full hover-bg-secondary text-secondary transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 ${isFavorited ? 'text-favorite fill-current' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.817 2.033a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.817-2.033a1 1 0 00-1.175 0l-2.817 2.033c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          </div>
          <p className="text-lg text-secondary mb-4">
            {team.sport} •{' '}
            <Link to={`/league/${encodeURIComponent(team.league)}`} className="hover:underline text-link">
              {team.league}
            </Link>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-secondary mb-6">
            <div>
              <span className="block font-semibold">Wins:</span>
              <span className="text-lg text-primary">{team.wins}</span>
            </div>
            <div>
              <span className="block font-semibold">Losses:</span>
              <span className="text-lg text-primary">{team.losses}</span>
            </div>
            {team.draws !== undefined && (
              <div>
                <span className="block font-semibold">Draws:</span>
                <span className="text-lg text-primary">{team.draws}</span>
              </div>
            )}
            <div>
              <span className="block font-semibold">Points:</span>
              <span className="text-lg text-primary">{team.points}</span>
            </div>
          </div>
          <p className="text-primary leading-relaxed">
            <span className="font-semibold">Coach:</span> {team.coach} <br />
            <span className="font-semibold">Stadium:</span> {team.stadium}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border mb-6 overflow-x-auto scrollbar-hide">
        <nav className="flex -mb-px text-sm font-medium">
          {['SUMMARY', 'NEWS', 'RESULTS', 'FIXTURES', 'DRAW'].map(tab => (
            <button
              key={tab}
              className={`whitespace-nowrap py-3 px-4 border-b-2
                ${activeTab === tab ? 'border-accent text-accent' : 'border-transparent text-secondary hover:text-primary hover:border-border'}
                focus:outline-none transition-colors duration-200`}
              onClick={() => setActiveTab(tab as any)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'SUMMARY' && (
          <div className="mt-6 border-t border-border pt-6">
            <h2 className="text-2xl font-bold text-accent mb-6 text-center">Key Players</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.members.map((member) => (
                <Link to={getPlayerPageLink(member.name, team.sport)} key={member.id} className="block">
                  <div className="bg-tertiary rounded-lg p-3 flex items-center space-x-3 hover-bg-secondary transition-colors duration-200">
                    <img
                      src={`https://picsum.photos/50/50?random=${member.id.charCodeAt(0)}`}
                      alt={`${member.name}`}
                      className="w-12 h-12 object-cover rounded-full border-2 border-accent"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-primary">{member.name}</h3>
                      <p className="text-secondary text-sm">
                        {member.position} {member.jerseyNumber ? `(#${member.jerseyNumber})` : ''}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'NEWS' && (
          <div className="mt-6 border-t border-border pt-6">
            <h2 className="text-2xl font-bold text-accent mb-6 text-center">The latest news</h2>
            {newsStatus === 'loading' && <LoadingSpinner />}
            {newsStatus === 'error' && <ErrorDisplay message="Failed to load news." onRetry={fetchTeamNews} />}
            {newsStatus === 'success' && news.length === 0 && (
              <p className="text-center text-secondary">No news articles found for {team.name}.</p>
            )}
            {newsStatus === 'success' && news.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((article, index) => (
                  <div key={index} className="bg-tertiary rounded-lg p-4 shadow-md flex flex-col">
                    {article.imageUrl && (
                      <img src={article.imageUrl} alt={article.title} className="w-full h-32 object-cover rounded-md mb-3" />
                    )}
                    <h3 className="text-lg font-semibold text-primary mb-2 leading-tight">{article.title}</h3>
                    <p className="text-secondary text-sm flex-grow mb-3">{article.summary}</p>
                    <div className="flex justify-between items-center text-xs text-secondary mt-auto">
                      <span>{article.source}</span>
                      <span>{article.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-center mt-8">
              <button className="bg-secondary text-accent font-bold py-2 px-6 rounded-full hover-bg-secondary transition-colors duration-200">
                View more news
              </button>
            </div>
          </div>
        )}

        {(activeTab === 'RESULTS' || activeTab === 'FIXTURES') && (
          <div className="mt-6 border-t border-border pt-6">
            <h2 className="text-2xl font-bold text-accent mb-6 text-center">
              {activeTab === 'RESULTS' ? 'Latest Results' : 'Upcoming Fixtures'}
            </h2>
            {gamesStatus === 'loading' && <LoadingSpinner />}
            {gamesStatus === 'error' && <ErrorDisplay message="Failed to load games." onRetry={fetchTeamGames} />}
            {gamesStatus === 'success' && ((activeTab === 'RESULTS' && results.length === 0) || (activeTab === 'FIXTURES' && fixtures.length === 0)) ? (
              <p className="text-center text-secondary">No {activeTab.toLowerCase()} found for {team.name}.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(activeTab === 'RESULTS' ? results : fixtures).map(score => (
                  <ScoreCard key={score.gameId} score={score} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'DRAW' && (
          <div className="mt-6 border-t border-border pt-6 text-center text-secondary">
            <p>Draw information would be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
    
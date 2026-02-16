
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PlayerPage } from './pages/PlayerPage';
import { TeamPage } from './pages/TeamPage';
import { LeaguePage } from './pages/LeaguePage';
import { MyWatchlistPage } from './pages/MyWatchlistPage';
import { MyScoreboardPage } from './pages/MyScoreboardPage'; // Import the new Scoreboard page
import { SearchPage } from './pages/SearchPage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ChatBot } from './components/ChatBot';
import { UserProvider } from './context/UserContext';

function App() {
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);

  const toggleChatBot = () => {
    setIsChatBotOpen(prev => !prev);
  };

  return (
    <UserProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
          <Header toggleChatBot={toggleChatBot} />
          <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/player/:playerName" element={<PlayerPage />} />
              <Route path="/team/:teamName" element={<TeamPage />} />
              <Route path="/league/:leagueName" element={<LeaguePage />} />
              <Route path="/watchlist" element={<MyWatchlistPage />} />
              <Route path="/scoreboard" element={<MyScoreboardPage />} /> {/* New Scoreboard Route */}
              <Route path="/search" element={<SearchPage />} />
            </Routes>
          </main>
          <Footer />
          <ChatBot isOpen={isChatBotOpen} onClose={() => setIsChatBotOpen(false)} />
        </div>
      </HashRouter>
    </UserProvider>
  );
}

export default App;


import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PlayerPage } from './pages/PlayerPage';
import { TeamPage } from './pages/TeamPage';
import { LeaguePage } from './pages/LeaguePage';
import { MyWatchlistPage } from './pages/MyWatchlistPage';
import { SearchPage } from './pages/SearchPage'; // Import the new SearchPage
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ChatBot } from './components/ChatBot'; // Import the new ChatBot

function App() {
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);

  const toggleChatBot = () => {
    setIsChatBotOpen(prev => !prev);
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
        <Header toggleChatBot={toggleChatBot} /> {/* Pass toggle function to Header */}
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/player/:playerName" element={<PlayerPage />} />
            <Route path="/team/:teamName" element={<TeamPage />} />
            <Route path="/league/:leagueName" element={<LeaguePage />} />
            <Route path="/watchlist" element={<MyWatchlistPage />} />
            <Route path="/search" element={<SearchPage />} /> {/* New Search Route for generic queries */}
          </Routes>
        </main>
        <Footer />
        <ChatBot isOpen={isChatBotOpen} onClose={() => setIsChatBotOpen(false)} />
      </div>
    </HashRouter>
  );
}

export default App;

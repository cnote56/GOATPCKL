
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PlayerPage } from './pages/PlayerPage';
import { TeamPage } from './pages/TeamPage';
import { LeaguePage } from './pages/LeaguePage';
import { MyWatchlistPage } from './pages/MyWatchlistPage';
import { MyScoreboardPage } from './pages/MyScoreboardPage';
import { SearchPage } from './pages/SearchPage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ChatBot } from './components/ChatBot';
import { Sidebar } from './components/Sidebar'; // Import Sidebar
import { UserProvider } from './context/UserContext';

function App() {
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // New state for sidebar
  const [theme, setTheme] = useState<'dark' | 'light'>('dark'); // New state for theme

  // Set initial theme from localStorage or default to dark
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setTheme('light');
      document.body.classList.add('light-theme');
    } else {
      setTheme('dark');
      document.body.classList.remove('light-theme');
    }
  }, []);

  const toggleChatBot = () => {
    setIsChatBotOpen(prev => !prev);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
      if (newTheme === 'light') {
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  return (
    <UserProvider>
      <HashRouter>
        <div className={`min-h-screen flex flex-col bg-primary text-primary`}>
          <Header
            toggleChatBot={toggleChatBot}
            toggleSidebar={toggleSidebar} // Pass toggleSidebar
            toggleTheme={toggleTheme} // Pass toggleTheme
            currentTheme={theme} // Pass currentTheme
          />
          <div className="flex flex-grow">
            <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} /> {/* Render Sidebar */}
            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-4 transition-all duration-300 ease-in-out">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/player/:playerName" element={<PlayerPage />} />
                <Route path="/team/:teamName" element={<TeamPage />} />
                <Route path="/league/:leagueName" element={<LeaguePage />} />
                <Route path="/watchlist" element={<MyWatchlistPage />} />
                <Route path="/scoreboard" element={<MyScoreboardPage />} />
                <Route path="/search" element={<SearchPage />} />
              </Routes>
            </main>
          </div>
          <Footer />
          <ChatBot isOpen={isChatBotOpen} onClose={() => setIsChatBotOpen(false)} />
        </div>
      </HashRouter>
    </UserProvider>
  );
}

export default App;
    
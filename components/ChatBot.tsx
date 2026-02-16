
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat } from '@google/genai';
import { geminiService } from '../services/geminiService';
import { ChatMessage, GroundingLink } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { useUser } from '../context/UserContext';
import { addFavoriteTeam, addFollowedGame } from '../utils/favorites';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useUser();

  // Initialize chat session
  useEffect(() => {
    if (isOpen && !chat) {
      try {
        const newChat = geminiService.startChat();
        setChat(newChat);
        setMessages([
          { role: 'model', text: "Hello! I'm URScoreCard's AI assistant. How can I help you with sports today?", timestamp: new Date() }
        ]);
      } catch (error) {
        console.error("Failed to start chat session:", error);
        setMessages(prev => [...prev, { role: 'model', text: "Sorry, I couldn't start the chat. Please try again later.", timestamp: new Date() }]);
      }
    }
  }, [isOpen, chat]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chat || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await geminiService.sendChatMessage(chat, input);
      if (result) {
        const modelMessage: ChatMessage = {
          role: 'model',
          text: result.answer,
          timestamp: new Date(),
          groundingLinks: result.groundingLinks,
          suggestedAction: result.suggestedAction, // Pass suggested action to message
        };
        setMessages(prev => [...prev, modelMessage]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: "Sorry, I didn't get a response. Please try again.", timestamp: new Date() }]);
      }
    } catch (error) {
      console.error("Error sending message to chat:", error);
      setMessages(prev => [...prev, { role: 'model', text: "An error occurred while sending your message. Please try again.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, chat, isLoading]);

  const handleSuggestedAction = useCallback((actionType: 'followTeam' | 'followGame', id: string, name: string, homeTeam?: string, awayTeam?: string) => {
    if (actionType === 'followTeam') {
      addFavoriteTeam(currentUser.id, id);
      setMessages(prev => [...prev, { role: 'user', text: `Added "${name}" to your watchlist!`, timestamp: new Date() }]);
    } else if (actionType === 'followGame' && homeTeam && awayTeam) {
      addFollowedGame(currentUser.id, id);
      setMessages(prev => [...prev, { role: 'user', text: `Added "${name}" to your scoreboard!`, timestamp: new Date() }]);
    }
    // Optionally close chatbot or provide further instruction
  }, [currentUser.id]);


  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-sm bg-gray-800 rounded-lg shadow-2xl flex flex-col z-50 animate-fade-in-up"
         style={{ height: 'calc(100vh - 8rem)', maxHeight: '600px' }}>
      <div className="flex justify-between items-center bg-gray-700 p-4 rounded-t-lg shadow-md">
        <h2 className="text-xl font-bold text-emerald-400">URScoreCard AI Chat</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-600" aria-label="Close Chatbot">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-grow p-4 overflow-y-auto space-y-4 custom-scrollbar">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-3 rounded-lg shadow-md ${
              msg.role === 'user' ? 'bg-emerald-700 text-white' : 'bg-gray-700 text-gray-100'
            }`}>
              <p className="text-sm break-words">{msg.text}</p>
              {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-300">
                  <p className="font-semibold mb-1">Sources:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {msg.groundingLinks.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a href={link.uri} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">
                          {link.title || link.uri}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {msg.suggestedAction && (
                <div className="mt-2 pt-2 border-t border-gray-600">
                  <button
                    onClick={() => handleSuggestedAction(
                      msg.suggestedAction!.type,
                      msg.suggestedAction!.id,
                      msg.suggestedAction!.name,
                      msg.suggestedAction!.homeTeam,
                      msg.suggestedAction!.awayTeam
                    )}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                  >
                    {msg.suggestedAction.type === 'followTeam' ? `Add "${msg.suggestedAction.name}" to Watchlist` : `Add "${msg.suggestedAction.name}" to Scoreboard`}
                  </button>
                </div>
              )}
              <span className="block text-right text-xs text-gray-400 mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-lg bg-gray-700 shadow-md">
              <LoadingSpinner />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about sports..."
            className="flex-grow bg-gray-700 text-gray-100 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            disabled={!chat || isLoading}
            aria-label="Chat input"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!chat || isLoading || !input.trim()}
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </form>
      {/* Removed jsx="true" prop from the style tag */}
      <style>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151; /* gray-700 */
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #059669; /* emerald-600 */
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #047857; /* emerald-700 */
        }
      `}</style>
    </div>
  );
};
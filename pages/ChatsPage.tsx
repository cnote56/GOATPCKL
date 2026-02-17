
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getPrivateChatMessages } from '../utils/social';
import { ChatSession, PrivateChatMessage } from '../types';

export const ChatsPage: React.FC = () => {
  const { currentUser, availableUsers, getOtherUsers } = useUser();
  const navigate = useNavigate();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    const activeSessions: ChatSession[] = [];
    const otherUsers = getOtherUsers(currentUser.id);

    otherUsers.forEach(otherUser => {
      const messages = getPrivateChatMessages(currentUser.id, otherUser.id);
      if (messages.length > 0) {
        activeSessions.push({
          otherUserId: otherUser.id,
          lastMessage: messages[messages.length - 1],
          unreadCount: 0, // Placeholder for future unread count logic
        });
      }
    });

    // Sort by last message timestamp
    activeSessions.sort((a, b) => (b.lastMessage?.timestamp?.getTime() || 0) - (a.lastMessage?.timestamp?.getTime() || 0));
    setChatSessions(activeSessions);
  }, [currentUser.id, getOtherUsers]);

  const handleStartNewChat = () => {
    // For now, navigate to the first other user without an existing chat
    const usersWithoutChat = getOtherUsers(currentUser.id).filter(
      otherUser => !chatSessions.some(session => session.otherUserId === otherUser.id)
    );
    if (usersWithoutChat.length > 0) {
      navigate(`/chats/${usersWithoutChat[0].id}`);
    } else {
      alert("No other users available to start a new chat with!");
      // In a real app, you'd have a search/selection dialog
    }
  };

  return (
    <div className="p-4 bg-secondary rounded-lg shadow-xl h-full flex flex-col">
      <h1 className="text-2xl font-extrabold text-center text-accent mb-6">My Chats</h1>

      {chatSessions.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-secondary text-xl py-10">
          <p className="mb-4">You don't have any active chats yet.</p>
          <button
            onClick={handleStartNewChat}
            className="px-6 py-3 rounded-full font-bold bg-accent hover:bg-emerald-700 text-primary transition-colors duration-200"
          >
            Start a New Chat
          </button>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          <ul className="space-y-4">
            {chatSessions.map(session => {
              const otherUser = availableUsers.find(u => u.id === session.otherUserId);
              if (!otherUser) return null;

              return (
                <li key={session.otherUserId}>
                  <Link
                    to={`/chats/${session.otherUserId}`}
                    className="flex items-center space-x-4 bg-tertiary p-4 rounded-lg shadow-md hover-bg-secondary transition-colors"
                  >
                    <img
                      src={`https://picsum.photos/50/50?random=${otherUser.id.charCodeAt(0)}`}
                      alt={`${otherUser.name}'s avatar`}
                      className="w-12 h-12 object-cover rounded-full border-2 border-border"
                    />
                    <div className="flex-grow">
                      <h2 className="text-lg font-semibold text-primary">{otherUser.name}</h2>
                      {session.lastMessage && (
                        <p className="text-sm text-secondary truncate">
                          <span className="font-medium">
                            {session.lastMessage.senderId === currentUser.id ? 'You' : otherUser.name}:
                          </span>{' '}
                          {session.lastMessage.text}
                        </p>
                      )}
                    </div>
                    {session.lastMessage && (
                      <span className="text-xs text-secondary flex-shrink-0">
                        {session.lastMessage.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {chatSessions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border flex justify-center">
          <button
            onClick={handleStartNewChat}
            className="px-6 py-3 rounded-full font-bold bg-accent hover:bg-emerald-700 text-primary transition-colors duration-200"
          >
            Start a New Chat
          </button>
        </div>
      )}
    </div>
  );
};
    
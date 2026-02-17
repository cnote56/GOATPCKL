
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getPrivateChatMessages, addPrivateChatMessage } from '../utils/social';
import { PrivateChatMessage } from '../types';

export const IndividualChatPage: React.FC = () => {
  const { otherUserId } = useParams<{ otherUserId: string }>();
  const { currentUser, availableUsers } = useUser();
  const otherUser = availableUsers.find(u => u.id === otherUserId);

  const [messages, setMessages] = useState<PrivateChatMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (otherUser) {
      setMessages(getPrivateChatMessages(currentUser.id, otherUser.id));
    }
  }, [currentUser.id, otherUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !otherUser) return;

    const newMessage: PrivateChatMessage = {
      id: Date.now().toString(), // Simple unique ID
      senderId: currentUser.id,
      receiverId: otherUser.id,
      text: input,
      timestamp: new Date(),
    };

    addPrivateChatMessage(newMessage);
    setMessages(prev => [...prev, newMessage]);
    setInput('');
  }, [input, currentUser.id, otherUser]);

  if (!otherUser) {
    return (
      <div className="p-4 bg-secondary rounded-lg shadow-xl text-center text-red-400">
        User not found to chat with.
      </div>
    );
  }

  return (
    <div className="p-4 bg-secondary rounded-lg shadow-xl h-[calc(100vh-180px)] flex flex-col">
      <div className="flex items-center border-b border-border pb-4 mb-4">
        <Link to="/chats" className="text-secondary hover:text-primary mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10
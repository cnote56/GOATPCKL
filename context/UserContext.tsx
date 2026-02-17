
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

// Define the shape of the user object
interface User {
  id: string;
  name: string;
  profileId?: string; // Optional: Link to a more detailed user profile
}

// Define the shape of the context value
interface UserContextType {
  currentUser: User;
  switchUser: (userId: string) => void;
  availableUsers: User[];
  getOtherUsers: (currentUserId: string) => User[];
}

// Create the context with a default (undefined) value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Predefined users for testing
const predefinedUsers: User[] = [
  { id: 'user1', name: 'LeBronFan23', profileId: 'profile1' },
  { id: 'user2', name: 'MessiMagic10', profileId: 'profile2' },
  { id: 'user3', name: 'CurryMVP', profileId: 'profile3' },
  { id: 'user4', name: 'Ronaldo_CR7', profileId: 'profile4' },
  { id: 'user5', name: 'SerenaChamp', profileId: 'profile5' },
];

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    // Initialize from sessionStorage or default to user1
    const storedUserId = sessionStorage.getItem('currentUserId');
    const foundUser = predefinedUsers.find(user => user.id === storedUserId);
    return foundUser || predefinedUsers[0];
  });

  // Persist current user ID to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('currentUserId', currentUser.id);
  }, [currentUser]);

  const switchUser = useCallback((userId: string) => {
    const userToSwitch = predefinedUsers.find(user => user.id === userId);
    if (userToSwitch) {
      setCurrentUser(userToSwitch);
    } else {
      console.warn(`Attempted to switch to unknown user ID: ${userId}`);
    }
  }, []);

  const getOtherUsers = useCallback((currentUserId: string): User[] => {
    return predefinedUsers.filter(user => user.id !== currentUserId);
  }, []);

  const contextValue = {
    currentUser,
    switchUser,
    availableUsers: predefinedUsers,
    getOtherUsers,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
    
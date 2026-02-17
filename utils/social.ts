
import { PrivateChatMessage, WatchPartyMessage } from "../types";

// --- User Following ---
const getFollowingKey = (userId: string) => `urscorecard_user_${userId}_following`;
const getAllUsersFollowingKey = () => `urscorecard_all_users_following`; // Stores a map of follower -> [followed]

// This function gets the list of users that `userId` is following.
export const getFollowing = (userId: string): string[] => {
  try {
    const following = localStorage.getItem(getFollowingKey(userId));
    return following ? JSON.parse(following) : [];
  } catch (error) {
    console.error(`Error reading following for user ${userId} from localStorage:`, error);
    return [];
  }
};

export const addFollowing = (followerId: string, targetUserId: string): void => {
  try {
    const following = getFollowing(followerId);
    if (!following.includes(targetUserId)) {
      localStorage.setItem(getFollowingKey(followerId), JSON.stringify([...following, targetUserId]));
      // Also update the target user's followers (for simplicity, we'll just track who follows who directly)
      // This is less efficient for getting *all* followers for a user, but works for checking `isFollowing`
      const targetFollowers = getFollowers(targetUserId);
      if (!targetFollowers.includes(followerId)) {
        updateFollowers(targetUserId, [...targetFollowers, followerId]);
      }
    }
  } catch (error) {
    console.error(`Error adding following for user ${followerId} to target ${targetUserId} in localStorage:`, error);
  }
};

export const removeFollowing = (followerId: string, targetUserId: string): void => {
  try {
    const following = getFollowing(followerId);
    const updatedFollowing = following.filter(id => id !== targetUserId);
    localStorage.setItem(getFollowingKey(followerId), JSON.stringify(updatedFollowing));

    // Also update the target user's followers
    const targetFollowers = getFollowers(targetUserId);
    const updatedTargetFollowers = targetFollowers.filter(id => id !== followerId);
    updateFollowers(targetUserId, updatedTargetFollowers);

  } catch (error) {
    console.error(`Error removing following for user ${followerId} from target ${targetUserId} in localStorage:`, error);
  }
};

export const isFollowing = (followerId: string, targetUserId: string): boolean => {
  const following = getFollowing(followerId);
  return following.includes(targetUserId);
};

// --- Followers (derived or managed explicitly for simplicity here) ---
// For a frontend-only app, deriving followers from all users' 'following' lists can be complex.
// We'll simulate by having a separate "followers" array per user, updated when someone follows them.
const getFollowersKey = (userId: string) => `urscorecard_user_${userId}_followers`;

export const getFollowers = (userId: string): string[] => {
  try {
    const followers = localStorage.getItem(getFollowersKey(userId));
    return followers ? JSON.parse(followers) : [];
  } catch (error) {
    console.error(`Error reading followers for user ${userId} from localStorage:`, error);
    return [];
  }
};

const updateFollowers = (userId: string, followers: string[]): void => {
  try {
    localStorage.setItem(getFollowersKey(userId), JSON.stringify(followers));
  } catch (error) {
    console.error(`Error updating followers for user ${userId} in localStorage:`, error);
  }
}

// --- Private Chat Messages ---
const getPrivateChatKey = (user1Id: string, user2Id: string) => {
  // Ensure consistent key regardless of sender/receiver order
  const sortedIds = [user1Id, user2Id].sort();
  return `urscorecard_private_chat_${sortedIds[0]}_${sortedIds[1]}`;
};

export const getPrivateChatMessages = (user1Id: string, user2Id: string): PrivateChatMessage[] => {
  try {
    const messages = localStorage.getItem(getPrivateChatKey(user1Id, user2Id));
    // Re-parse timestamps as Date objects
    return messages ? JSON.parse(messages).map((msg: PrivateChatMessage) => ({ ...msg, timestamp: new Date(msg.timestamp) })) : [];
  } catch (error) {
    console.error(`Error reading private chat between ${user1Id} and ${user2Id} from localStorage:`, error);
    return [];
  }
};

export const addPrivateChatMessage = (message: PrivateChatMessage): void => {
  try {
    const messages = getPrivateChatMessages(message.senderId, message.receiverId);
    const updatedMessages = [...messages, message];
    localStorage.setItem(getPrivateChatKey(message.senderId, message.receiverId), JSON.stringify(updatedMessages));
  } catch (error) {
    console.error(`Error adding private chat message from ${message.senderId} to ${message.receiverId} in localStorage:`, error);
  }
};

// --- Watch Party Messages (per game) ---
const getWatchPartyChatKey = (gameId: string) => `urscorecard_watchparty_chat_${gameId}`;

export const getWatchPartyMessages = (gameId: string): WatchPartyMessage[] => {
  try {
    // Watch party messages are session-specific for now, to avoid polluting localStorage
    const messages = sessionStorage.getItem(getWatchPartyChatKey(gameId));
    // Re-parse timestamps as Date objects
    return messages ? JSON.parse(messages).map((msg: WatchPartyMessage) => ({ ...msg, timestamp: new Date(msg.timestamp) })) : [];
  } catch (error) {
    console.error(`Error reading watch party chat for game ${gameId} from sessionStorage:`, error);
    return [];
  }
};

export const addWatchPartyMessage = (message: WatchPartyMessage): void => {
  try {
    const messages = getWatchPartyMessages(message.gameId);
    const updatedMessages = [...messages, message];
    sessionStorage.setItem(getWatchPartyChatKey(message.gameId), JSON.stringify(updatedMessages));
  } catch (error) {
    console.error(`Error adding watch party message for game ${message.gameId} in sessionStorage:`, error);
  }
};
    
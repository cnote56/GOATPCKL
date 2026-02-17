
import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { isFollowing, addFollowing, removeFollowing } from '../utils/social';

export const AllUsersPage: React.FC = () => {
  const { currentUser, availableUsers } = useUser();

  const handleToggleFollow = (targetUserId: string, currentStatus: boolean) => {
    if (currentStatus) {
      removeFollowing(currentUser.id, targetUserId);
    } else {
      addFollowing(currentUser.id, targetUserId);
    }
    // Force re-render to update follow status without full page reload
    window.location.reload(); // Simple solution for frontend-only
  };

  return (
    <div className="p-4 bg-secondary rounded-lg shadow-xl">
      <h1 className="text-2xl font-extrabold text-center text-accent mb-6">All Users</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableUsers.filter(user => user.id !== currentUser.id).map(user => {
          const isUserFollowing = isFollowing(currentUser.id, user.id);
          return (
            <div key={user.id} className="bg-tertiary rounded-lg shadow-md p-4 flex flex-col items-center space-y-3 hover-bg-secondary transition-colors">
              <img
                src={`https://picsum.photos/80/80?random=${user.id.charCodeAt(0)}`}
                alt={`${user.name}'s avatar`}
                className="w-20 h-20 object-cover rounded-full border-2 border-accent"
              />
              <Link to={`/users/${user.id}`} className="text-xl font-semibold text-primary hover:underline">
                {user.name}
              </Link>
              <p className="text-secondary text-sm">@{user.id}</p>
              <button
                onClick={() => handleToggleFollow(user.id, isUserFollowing)}
                className={`mt-2 px-4 py-2 rounded-full font-bold text-sm transition-colors duration-200
                  ${isUserFollowing ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-accent hover:bg-emerald-700 text-primary'}`}
              >
                {isUserFollowing ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
    
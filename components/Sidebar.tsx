
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getFavoriteTeams } from '../utils/favorites';
import { TeamProfile } from '../types';
import { geminiService } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Hardcoded for now, these would ideally come from an API or user settings
const PINNED_LEAGUES = [
  { name: 'MLB', link: '/league/MLB' },
  { name: 'NBA', link: '/league/NBA' },
  { name: 'Premier League', link: '/league/Premier%20League' },
  { name: 'La Liga', link: '/league/La%20Liga' },
  { name: 'Serie A', link: '/league/Serie%20A' }
];

const COUNTRIES = [
  'USA', 'England', 'Spain', 'Germany', 'Italy', 'France', 'Brazil', 'Argentina',
  'Mexico', 'Canada', 'Australia', 'Japan', 'South Korea', 'China', 'India'
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useUser();
  const [favoriteTeams, setFavoriteTeams] = useState<TeamProfile[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);

  useEffect(() => {
    const fetchFavoriteTeams = async () => {
      setIsLoadingTeams(true);
      const teamIds = getFavoriteTeams(currentUser.id);
      const fetchedProfiles: TeamProfile[] = [];
      for (const id of teamIds) {
        // In a real app, you'd fetch by ID. Here, we're using the name as ID.
        // Also, fetch only minimal data if possible, or cache full profiles.
        const teamProfile = await geminiService.getTeamProfile(id); // Using ID as name
        if (teamProfile) {
          fetchedProfiles.push(teamProfile);
        }
      }
      setFavoriteTeams(fetchedProfiles);
      setIsLoadingTeams(false);
    };

    if (currentUser.id) {
      fetchFavoriteTeams();
    }
  }, [currentUser.id]);


  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-tertiary shadow-xl transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:h-auto lg:w-64 lg:flex-shrink-0 lg:shadow-none
          overflow-y-auto custom-scrollbar border-r border-border`}
      >
        <div className="p-4 flex justify-between items-center border-b border-border lg:hidden">
          <h2 className="text-xl font-bold text-accent">Menu</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover-bg-secondary text-secondary"
            aria-label="Close Sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* General Navigation */}
        <section className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-secondary uppercase mb-3">NAVIGATION</h3>
          <ul className="space-y-2">
            <li>
              <Link
                to={`/users/${currentUser.id}`}
                className="flex items-center text-primary hover:text-accent hover-bg-secondary p-2 rounded-lg transition-colors group"
                onClick={onClose}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium group-hover:underline">My Profile</span>
              </Link>
            </li>
            <li>
              <Link
                to="/users"
                className="flex items-center text-primary hover:text-accent hover-bg-secondary p-2 rounded-lg transition-colors group"
                onClick={onClose}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h.01M18.5 21a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM9 20h.01M10.5 21a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM5.636 10.636a9 9 0 0112.728 0m-2.828 2.828a5 5 0 01-7.072 0M2 12A10 10 0 0112 2v2A8 8 0 004 12v2a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5V12z" />
                </svg>
                <span className="text-sm font-medium group-hover:underline">Other Users</span>
              </Link>
            </li>
            <li>
              <Link
                to="/chats"
                className="flex items-center text-primary hover:text-accent hover-bg-secondary p-2 rounded-lg transition-colors group"
                onClick={onClose}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span className="text-sm font-medium group-hover:underline">My Chats</span>
              </Link>
            </li>
          </ul>
        </section>


        {/* MY TEAMS */}
        <section className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-secondary uppercase mb-3">MY TEAMS</h3>
          {isLoadingTeams ? (
            <div className="pl-2">
                <LoadingSpinner />
            </div>
          ) : favoriteTeams.length === 0 ? (
            <p className="text-secondary text-sm italic pl-2">No favorite teams added yet.</p>
          ) : (
            <ul className="space-y-2">
              {favoriteTeams.map(team => (
                <li key={team.id}>
                  <Link
                    to={`/team/${encodeURIComponent(team.name)}`}
                    className="flex items-center text-primary hover:text-accent hover-bg-secondary p-2 rounded-lg transition-colors group"
                    onClick={onClose} // Close sidebar on navigation for mobile
                  >
                    <img
                      src={team.logoUrl || `https://picsum.photos/20/20?random=${team.id.charCodeAt(0)}`}
                      alt={`${team.name} logo`}
                      className="w-5 h-5 object-contain mr-2"
                    />
                    <span className="text-sm font-medium group-hover:underline">{team.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <button className="mt-4 w-full flex items-center justify-center p-2 text-sm font-medium text-accent border border-border rounded-lg hover-bg-secondary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            ADD THE TEAM
          </button>
        </section>

        {/* PINNED LEAGUES */}
        <section className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-secondary uppercase mb-3">PINNED LEAGUES</h3>
          <ul className="space-y-2">
            {PINNED_LEAGUES.map(league => (
              <li key={league.name}>
                <Link
                  to={league.link}
                  className="flex items-center text-primary hover:text-accent hover-bg-secondary p-2 rounded-lg transition-colors group"
                  onClick={onClose}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l2 2m-2-2v10a1 1 0 01-1 1h-3" />
                  </svg>
                  <span className="text-sm font-medium group-hover:underline">{league.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* COUNTRIES */}
        <section className="p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase mb-3">COUNTRIES</h3>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {COUNTRIES.map(country => (
              <li key={country}>
                <Link
                  to={`/search?country=${encodeURIComponent(country)}`} {/* Placeholder link */}
                  className="block p-2 text-secondary hover:text-accent hover-bg-secondary rounded-lg transition-colors"
                  onClick={onClose}
                >
                  {country}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </>
  );
};
    
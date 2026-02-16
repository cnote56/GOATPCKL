
import React, { useEffect, useRef, useState } from 'react';
import { PlayerProfile } from '../types';
import Plotly from 'plotly.js-dist';
import { Link } from 'react-router-dom';
import { addFavoritePlayer, removeFavoritePlayer, isFavoritePlayer } from '../utils/favorites';
import { useUser } from '../context/UserContext'; // Import useUser

interface PlayerDetailProps {
  player: PlayerProfile;
}

export const PlayerDetail: React.FC<PlayerDetailProps> = ({ player }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useUser(); // Get the current user
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    // Check if player is favorited for the current user
    setIsFavorited(isFavoritePlayer(currentUser.id, player.id));
  }, [player.id, currentUser.id]);

  const handleToggleFavorite = () => {
    if (isFavorited) {
      removeFavoritePlayer(currentUser.id, player.id);
    } else {
      addFavoritePlayer(currentUser.id, player.id);
    }
    setIsFavorited(!isFavorited);
  };

  useEffect(() => {
    if (player && chartRef.current) {
      const seasons = player.stats.map(s => s.season);
      const points = player.stats.map(s => s.pointsPerGame);
      const assists = player.stats.map(s => s.assistsPerGame);
      const rebounds = player.stats.map(s => s.reboundsPerGame);

      const data: Plotly.Data[] = [
        {
          x: seasons,
          y: points,
          name: 'Points Per Game',
          type: 'bar',
          marker: { color: '#047857' }, // emerald-600
        },
        {
          x: seasons,
          y: assists,
          name: 'Assists Per Game',
          type: 'bar',
          marker: { color: '#34d399' }, // emerald-400
        },
        {
          x: seasons,
          y: rebounds,
          name: 'Rebounds Per Game',
          type: 'bar',
          marker: { color: '#a7f3d0' }, // emerald-200
        },
      ];

      const layout: Partial<Plotly.Layout> = {
        title: {
          text: `${player.name} Seasonal Averages`,
          font: {
            color: '#e0f2f7', // text-gray-50
          },
        },
        xaxis: {
          title: 'Season',
          automargin: true,
          tickfont: {
            color: '#9ca3af', // text-gray-400
          },
          titlefont: {
            color: '#e0f2f7',
          },
          gridcolor: '#4b5563', // gray-600
          linecolor: '#4b5563',
        },
        yaxis: {
          title: 'Average per Game',
          automargin: true,
          tickfont: {
            color: '#9ca3af',
          },
          titlefont: {
            color: '#e0f2f7',
          },
          gridcolor: '#4b5563',
          linecolor: '#4b5563',
        },
        barmode: 'group',
        plot_bgcolor: '#1f2937', // gray-800
        paper_bgcolor: '#1f2937', // gray-800
        legend: {
          font: {
            color: '#e0f2f7',
          },
          bgcolor: 'rgba(0,0,0,0)',
        },
        margin: {
          l: 50,
          r: 50,
          b: 50,
          t: 70,
          pad: 4
        },
        responsive: true,
      };

      Plotly.newPlot(chartRef.current, data, layout, { responsive: true });
    }

    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, [player]);

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 mb-8">
        <img
          src={player.imageUrl || `https://picsum.photos/200/200?random=${player.id}`}
          alt={`${player.name}`}
          className="w-48 h-48 object-cover rounded-full border-4 border-emerald-500 mb-6 md:mb-0 shadow-md"
        />
        <div className="text-center md:text-left flex-grow">
          <div className="flex items-center justify-center md:justify-start mb-2">
            <h1 className="text-4xl font-extrabold text-emerald-400 mr-4">{player.name}</h1>
            <button
              onClick={handleToggleFavorite}
              aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-8 w-8 ${isFavorited ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.817 2.033a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.817-2.033a1 1 0 00-1.175 0l-2.817 2.033c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          </div>
          <p className="text-xl text-gray-300 mb-4">
            <Link to={`/team/${encodeURIComponent(player.team)}`} className="hover:underline text-emerald-300">
              {player.team}
            </Link>
            {' '}• {player.sport} • {player.position}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-gray-400 mb-6">
            <div>
              <span className="block font-semibold">Age:</span>
              <span className="text-lg">{player.age}</span>
            </div>
            <div>
              <span className="block font-semibold">Nationality:</span>
              <span className="text-lg">{player.nationality}</span>
            </div>
            <div>
              <span className="block font-semibold">Current Season PPG:</span>
              <span className="text-lg">{player.stats[0]?.pointsPerGame || 'N/A'}</span>
            </div>
            <div>
              <span className="block font-semibold">Current Season APG:</span>
              <span className="text-lg">{player.stats[0]?.assistsPerGame || 'N/A'}</span>
            </div>
          </div>
          <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto md:mx-0">
            {player.bio}
          </p>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-700 pt-8">
        <h2 className="text-3xl font-bold text-emerald-400 mb-6 text-center">Career Statistics Overview</h2>
        <div ref={chartRef} className="w-full h-[400px]"></div>
      </div>
    </div>
  );
};

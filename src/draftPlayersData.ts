export interface DraftPlayer {
  id: string;
  name: string;
  team: string;
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'DEF' | 'K';
  tier: number;
  projectedPts: number;
  opponent: string;
  matchupRating: 'smash' | 'favorable' | 'neutral' | 'tough' | 'brutal';
  achievements: string[];
  adp: number;
  injuryHistory?: 'Durable' | 'Questionable' | 'Fragile';
}

export const draftPlayersDb: DraftPlayer[] = [
  // --- ROUND 1 (ADP 1 - 10) ---
  { id: '4018', name: 'Christian McCaffrey', team: 'SF', position: 'RB', tier: 1, projectedPts: 22.4, opponent: 'SEA', matchupRating: 'smash', achievements: ['Hero-RB Keystone', 'Dual Threat God'], adp: 1, injuryHistory: 'Fragile' },
  { id: '8151', name: 'Breece Hall', team: 'NYJ', position: 'RB', tier: 1, projectedPts: 19.8, opponent: 'NE', matchupRating: 'favorable', achievements: ['Breakaway Weapon', 'Volume King'], adp: 2, injuryHistory: 'Questionable' },
  { id: '9509', name: 'Bijan Robinson', team: 'ATL', position: 'RB', tier: 1, projectedPts: 18.9, opponent: 'CAR', matchupRating: 'smash', achievements: ['Tier 1 Anchor', 'Ankle Breaker'], adp: 3, injuryHistory: 'Durable' },
  { id: '4866', name: 'Saquon Barkley', team: 'PHI', position: 'RB', tier: 1, projectedPts: 20.1, opponent: 'NYG', matchupRating: 'smash', achievements: ['Workhorse Giant', 'Goal-line Monster'], adp: 4, injuryHistory: 'Questionable' },
  { id: '9229', name: 'Jahmyr Gibbs', team: 'DET', position: 'RB', tier: 1, projectedPts: 17.5, opponent: 'CHI', matchupRating: 'neutral', achievements: ['Lightning Bolt', 'Elusive Specialist'], adp: 5, injuryHistory: 'Durable' },
  { id: '6794', name: 'Justin Jefferson', team: 'MIN', position: 'WR', tier: 1, projectedPts: 21.8, opponent: 'GB', matchupRating: 'neutral', achievements: ['Gridiron Artist', 'Uncluttable'], adp: 6, injuryHistory: 'Durable' },
  { id: '6824', name: 'CeeDee Lamb', team: 'DAL', position: 'WR', tier: 1, projectedPts: 22.5, opponent: 'WAS', matchupRating: 'smash', achievements: ['Target Monster', 'YAC God'], adp: 7, injuryHistory: 'Durable' },
  { id: '3198', name: 'Tyreek Hill', team: 'MIA', position: 'WR', tier: 1, projectedPts: 20.9, opponent: 'BUF', matchupRating: 'neutral', achievements: ['Cheetah Speed', 'Deep Threat God'], adp: 8, injuryHistory: 'Durable' },
  { id: '7547', name: 'Amon-Ra St. Brown', team: 'DET', position: 'WR', tier: 1, projectedPts: 19.5, opponent: 'CHI', matchupRating: 'favorable', achievements: ['The Sun God', 'First-Down Machine'], adp: 9, injuryHistory: 'Durable' },
  { id: '7564', name: 'Ja\'Marr Chase', team: 'CIN', position: 'WR', tier: 1, projectedPts: 20.2, opponent: 'BAL', matchupRating: 'favorable', achievements: ['Explosive Weapon', 'YAC God'], adp: 10, injuryHistory: 'Durable' },

  // --- ROUND 2 (ADP 11 - 20) ---
  { id: '6813', name: 'Jonathan Taylor', team: 'IND', position: 'RB', tier: 2, projectedPts: 16.2, opponent: 'HOU', matchupRating: 'neutral', achievements: ['Pure Runner', 'Volume King'], adp: 11, injuryHistory: 'Questionable' },
  { id: '5846', name: 'A.J. Brown', team: 'PHI', position: 'WR', tier: 2, projectedPts: 17.8, opponent: 'NYG', matchupRating: 'smash', achievements: ['Physical Phenom'], adp: 12, injuryHistory: 'Durable' },
  { id: '8138', name: 'Kyren Williams', team: 'LAR', position: 'RB', tier: 2, projectedPts: 15.8, opponent: 'ARI', matchupRating: 'favorable', achievements: ['Goal-line Monster'], adp: 13, injuryHistory: 'Questionable' },
  { id: '10216', name: 'Puka Nacua', team: 'LAR', position: 'WR', tier: 2, projectedPts: 17.2, opponent: 'ARI', matchupRating: 'favorable', achievements: ['Record Breaker'], adp: 14, injuryHistory: 'Questionable' },
  { id: '4663', name: 'Derrick Henry', team: 'BAL', position: 'RB', tier: 2, projectedPts: 18.2, opponent: 'CIN', matchupRating: 'favorable', achievements: ['The King', 'Stiff-Arm King'], adp: 15, injuryHistory: 'Durable' },
  { id: '9226', name: 'Devon Achane', team: 'MIA', position: 'RB', tier: 2, projectedPts: 16.5, opponent: 'BUF', matchupRating: 'neutral', achievements: ['Home-Run Hitter', 'Speed Demon'], adp: 16, injuryHistory: 'Fragile' },
  { id: 'f-1', name: 'Marvin Harrison Jr.', team: 'ARI', position: 'WR', tier: 2, projectedPts: 16.1, opponent: 'LAR', matchupRating: 'favorable', achievements: ['Elite Pedigree', 'Redzone Target'], adp: 17, injuryHistory: 'Durable' },
  { id: '8155', name: 'Garrett Wilson', team: 'NYJ', position: 'WR', tier: 2, projectedPts: 16.9, opponent: 'NE', matchupRating: 'neutral', achievements: ['Route Technician'], adp: 18, injuryHistory: 'Durable' },
  { id: '11565', name: 'Malik Nabers', team: 'NYG', position: 'WR', tier: 2, projectedPts: 16.8, opponent: 'PHI', matchupRating: 'tough', achievements: ['Highlight Reel', 'Breakout Candidate'], adp: 19, injuryHistory: 'Durable' },
  { id: '9221', name: 'Rashee Rice', team: 'KC', position: 'WR', tier: 3, projectedPts: 15.1, opponent: 'LV', matchupRating: 'smash', achievements: ['YAC Specialist'], adp: 20, injuryHistory: 'Durable' },

  // --- ROUND 3 (ADP 21 - 30) ---
  { id: 'f-2', name: 'Drake London', team: 'ATL', position: 'WR', tier: 3, projectedPts: 14.8, opponent: 'CAR', matchupRating: 'smash', achievements: ['Contested Catch Specialist'], adp: 21, injuryHistory: 'Durable' },
  { id: '4984', name: 'Josh Allen', team: 'BUF', position: 'QB', tier: 1, projectedPts: 23.8, opponent: 'MIA', matchupRating: 'favorable', achievements: ['Dual Threat King', 'Redzone Bulldozer'], adp: 22, injuryHistory: 'Durable' },
  { id: '6820', name: 'Brandon Aiyuk', team: 'SF', position: 'WR', tier: 2, projectedPts: 15.4, opponent: 'SEA', matchupRating: 'neutral', achievements: ['YAC Specialist'], adp: 23, injuryHistory: 'Durable' },
  { id: '4881', name: 'Lamar Jackson', team: 'BAL', position: 'QB', tier: 1, projectedPts: 24.2, opponent: 'CIN', matchupRating: 'neutral', achievements: ['Speed Demon', 'MVP Playmaker'], adp: 24, injuryHistory: 'Durable' },
  { id: '8153', name: 'Chris Olave', team: 'NO', position: 'WR', tier: 3, projectedPts: 14.5, opponent: 'CAR', matchupRating: 'favorable', achievements: ['Smooth Route Runner'], adp: 25, injuryHistory: 'Questionable' },
  { id: '6828', name: 'Jalen Hurts', team: 'PHI', position: 'QB', tier: 1, projectedPts: 22.1, opponent: 'NYG', matchupRating: 'smash', achievements: ['Tush Push Legend', 'Dual Threat King'], adp: 26, injuryHistory: 'Durable' },
  { id: '1466', name: 'Travis Kelce', team: 'KC', position: 'TE', tier: 1, projectedPts: 14.8, opponent: 'LV', matchupRating: 'smash', achievements: ['Gold Standard', 'Redzone General'], adp: 27, injuryHistory: 'Durable' },
  { id: '8129', name: 'Isiah Pacheco', team: 'KC', position: 'RB', tier: 3, projectedPts: 14.5, opponent: 'LV', matchupRating: 'smash', achievements: ['Angry Runner'], adp: 28, injuryHistory: 'Durable' },
  { id: '9756', name: 'Sam LaPorta', team: 'DET', position: 'TE', tier: 1, projectedPts: 13.9, opponent: 'CHI', matchupRating: 'neutral', achievements: ['Elite Target', 'Safety Valve'], adp: 29, injuryHistory: 'Durable' },
  { id: '4046', name: 'Patrick Mahomes', team: 'KC', position: 'QB', tier: 1, projectedPts: 21.5, opponent: 'LV', matchupRating: 'smash', achievements: ['Gunslinger', 'Clutch General'], adp: 30, injuryHistory: 'Durable' },

  // --- ROUND 4 (ADP 31 - 40) ---
  { id: '8150_te', name: 'Trey McBride', team: 'ARI', position: 'TE', tier: 1, projectedPts: 14.2, opponent: 'LAR', matchupRating: 'favorable', achievements: ['Volume Monster', 'Target Magnet'], adp: 31, injuryHistory: 'Durable' },
  { id: '7525', name: 'Jaylen Waddle', team: 'MIA', position: 'WR', tier: 3, projectedPts: 14.2, opponent: 'BUF', matchupRating: 'neutral', achievements: ['Cheetah Jr'], adp: 32, injuryHistory: 'Questionable' },
  { id: 'f-3', name: 'Nico Collins', team: 'HOU', position: 'WR', tier: 2, projectedPts: 15.8, opponent: 'IND', matchupRating: 'favorable', achievements: ['Big Bodied WR', 'YAC Machine'], adp: 33, injuryHistory: 'Durable' },
  { id: '8150', name: 'James Cook', team: 'BUF', position: 'RB', tier: 3, projectedPts: 14.1, opponent: 'MIA', matchupRating: 'neutral', achievements: ['Zone Weapon'], adp: 34, injuryHistory: 'Durable' },
  { id: '4211', name: 'George Kittle', team: 'SF', position: 'TE', tier: 1, projectedPts: 14.5, opponent: 'SEA', matchupRating: 'neutral', achievements: ['YAC Beast', 'Run Block Giant'], adp: 35, injuryHistory: 'Fragile' },
  { id: 'f-4', name: 'Deebo Samuel', team: 'SF', position: 'WR', tier: 2, projectedPts: 15.2, opponent: 'SEA', matchupRating: 'neutral', achievements: ['Swiss Army Knife'], adp: 36, injuryHistory: 'Questionable' },
  { id: 'f-5', name: 'Travis Etienne', team: 'JAX', position: 'RB', tier: 2, projectedPts: 14.8, opponent: 'TEN', matchupRating: 'favorable', achievements: ['Explosive Workhorse'], adp: 37, injuryHistory: 'Durable' },
  { id: '4973', name: 'DJ Moore', team: 'CHI', position: 'WR', tier: 3, projectedPts: 13.9, opponent: 'DET', matchupRating: 'tough', achievements: ['Reliable Target'], adp: 38, injuryHistory: 'Durable' },
  { id: 'f-6', name: 'Kenneth Walker III', team: 'SEA', position: 'RB', tier: 3, projectedPts: 14.6, opponent: 'SF', matchupRating: 'neutral', achievements: ['Home-Run Hitter'], adp: 39, injuryHistory: 'Questionable' },
  { id: 'f-7', name: 'George Pickens', team: 'PIT', position: 'WR', tier: 3, projectedPts: 13.5, opponent: 'CLE', matchupRating: 'neutral', achievements: ['Contested Catch Specialist'], adp: 40, injuryHistory: 'Durable' },

  // --- ROUND 5 (ADP 41 - 50) ---
  { id: 'f-8', name: 'Rhamondre Stevenson', team: 'NE', position: 'RB', tier: 3, projectedPts: 13.2, opponent: 'NYJ', matchupRating: 'tough', achievements: ['Bellcow Role'], adp: 41, injuryHistory: 'Durable' },
  { id: '5022', name: 'Rachaad White', team: 'TB', position: 'RB', tier: 3, projectedPts: 12.8, opponent: 'ATL', matchupRating: 'neutral', achievements: ['PPR Specialty'], adp: 42, injuryHistory: 'Durable' },
  { id: 'f-9', name: 'Alvin Kamara', team: 'NO', position: 'RB', tier: 3, projectedPts: 14.2, opponent: 'CAR', matchupRating: 'favorable', achievements: ['PPR Legend'], adp: 43, injuryHistory: 'Durable' },
  { id: 'f-10', name: 'Joe Mixon', team: 'HOU', position: 'RB', tier: 3, projectedPts: 13.9, opponent: 'IND', matchupRating: 'favorable', achievements: ['Volume Anchor'], adp: 44, injuryHistory: 'Durable' },
  { id: '4950', name: 'Mark Andrews', team: 'BAL', position: 'TE', tier: 2, projectedPts: 11.8, opponent: 'CIN', matchupRating: 'neutral', achievements: ['Redzone Threat'], adp: 45, injuryHistory: 'Questionable' },
  { id: 'f-11', name: 'DK Metcalf', team: 'SEA', position: 'WR', tier: 2, projectedPts: 14.4, opponent: 'SF', matchupRating: 'neutral', achievements: ['Physical Marvel'], adp: 46, injuryHistory: 'Durable' },
  { id: 'f-12', name: 'Devonta Smith', team: 'PHI', position: 'WR', tier: 3, projectedPts: 13.8, opponent: 'NYG', matchupRating: 'smash', achievements: ['Route Precision'], adp: 47, injuryHistory: 'Durable' },
  { id: '6151', name: 'Joe Burrow', team: 'CIN', position: 'QB', tier: 2, projectedPts: 18.5, opponent: 'BAL', matchupRating: 'tough', achievements: ['Pocket Sniper'], adp: 48, injuryHistory: 'Fragile' },
  { id: 'f-13', name: 'Brock Bowers', team: 'LV', position: 'TE', tier: 2, projectedPts: 12.5, opponent: 'KC', matchupRating: 'tough', achievements: ['YAC Monster', 'Generational Rookie'], adp: 49, injuryHistory: 'Durable' },
  { id: 'f-14', name: 'Davante Adams', team: 'NYJ', position: 'WR', tier: 3, projectedPts: 14.1, opponent: 'NE', matchupRating: 'favorable', achievements: ['Veteran Masterclass'], adp: 50, injuryHistory: 'Durable' },

  // --- ROUND 6 (ADP 51 - 60) ---
  { id: 'f-15', name: 'Aaron Jones', team: 'MIN', position: 'RB', tier: 3, projectedPts: 13.0, opponent: 'GB', matchupRating: 'neutral', achievements: ['Dual Threat Vet'], adp: 51, injuryHistory: 'Questionable' },
  { id: '9758', name: 'C.J. Stroud', team: 'HOU', position: 'QB', tier: 2, projectedPts: 17.9, opponent: 'IND', matchupRating: 'favorable', achievements: ['Deep Ball Artist'], adp: 52, injuryHistory: 'Durable' },
  { id: 'f-16', name: 'Amari Cooper', team: 'CLE', position: 'WR', tier: 3, projectedPts: 12.9, opponent: 'PIT', matchupRating: 'neutral', achievements: ['Deep Route Runner'], adp: 53, injuryHistory: 'Durable' },
  { id: 'f-17', name: 'Mike Evans', team: 'TB', position: 'WR', tier: 3, projectedPts: 13.5, opponent: 'ATL', matchupRating: 'neutral', achievements: ['1000 Yd Standard', 'Redzone Weapon'], adp: 54, injuryHistory: 'Durable' },
  { id: 'f-18', name: 'Stefon Diggs', team: 'HOU', position: 'WR', tier: 3, projectedPts: 12.4, opponent: 'IND', matchupRating: 'neutral', achievements: ['PPR Security'], adp: 55, injuryHistory: 'Durable' },
  { id: 'f-19', name: 'David Montgomery', team: 'DET', position: 'RB', tier: 3, projectedPts: 13.1, opponent: 'CHI', matchupRating: 'neutral', achievements: ['Goal-line Plunderer'], adp: 56, injuryHistory: 'Durable' },
  { id: 'f-20', name: 'Kyler Murray', team: 'ARI', position: 'QB', tier: 2, projectedPts: 18.2, opponent: 'LAR', matchupRating: 'favorable', achievements: ['Scrambler Specialist'], adp: 57, injuryHistory: 'Questionable' },
  { id: '10222', name: 'Tank Dell', team: 'HOU', position: 'WR', tier: 4, projectedPts: 11.2, opponent: 'IND', matchupRating: 'neutral', achievements: ['Pocket Rocket'], adp: 58, injuryHistory: 'Fragile' },
  { id: 'f-21', name: 'Anthony Richardson', team: 'IND', position: 'QB', tier: 2, projectedPts: 18.9, opponent: 'HOU', matchupRating: 'neutral', achievements: ['Cheatcode Rusher'], adp: 59, injuryHistory: 'Fragile' },
  { id: 'f-22', name: 'Zay Flowers', team: 'BAL', position: 'WR', tier: 3, projectedPts: 12.8, opponent: 'CIN', matchupRating: 'neutral', achievements: ['YAC Specialist'], adp: 60, injuryHistory: 'Durable' },

  // --- ROUND 7 (ADP 61 - 70) ---
  { id: 'f-23', name: 'Jordan Love', team: 'GB', position: 'QB', tier: 2, projectedPts: 17.6, opponent: 'MIN', matchupRating: 'neutral', achievements: ['Gunslinger Jr'], adp: 61, injuryHistory: 'Durable' },
  { id: '7561', name: 'Kyle Pitts', team: 'ATL', position: 'TE', tier: 3, projectedPts: 9.8, opponent: 'CAR', matchupRating: 'favorable', achievements: ['Athletic Specimen'], adp: 62, injuryHistory: 'Questionable' },
  { id: 'f-24', name: 'Jared Goff', team: 'DET', position: 'QB', tier: 3, projectedPts: 16.8, opponent: 'CHI', matchupRating: 'favorable', achievements: ['Dome Comfort'], adp: 63, injuryHistory: 'Durable' },
  { id: 'f-25', name: 'Tee Higgins', team: 'CIN', position: 'WR', tier: 3, projectedPts: 12.5, opponent: 'BAL', matchupRating: 'tough', achievements: ['High-point Target'], adp: 64, injuryHistory: 'Questionable' },
  { id: 'f-26', name: 'Terry McLaurin', team: 'WAS', position: 'WR', tier: 4, projectedPts: 12.1, opponent: 'DAL', matchupRating: 'tough', achievements: ['Scary Speed'], adp: 65, injuryHistory: 'Durable' },
  { id: 'f-27', name: 'D\'Andre Swift', team: 'CHI', position: 'RB', tier: 4, projectedPts: 11.5, opponent: 'DET', matchupRating: 'tough', achievements: ['Dynamic Flex'], adp: 66, injuryHistory: 'Questionable' },
  { id: 'f-28', name: 'Najee Harris', team: 'PIT', position: 'RB', tier: 4, projectedPts: 11.8, opponent: 'CLE', matchupRating: 'neutral', achievements: ['Iron Man'], adp: 67, injuryHistory: 'Durable' },
  { id: '6845', name: 'D\'Andre Swift', team: 'CHI', position: 'RB', tier: 4, projectedPts: 11.5, opponent: 'DET', matchupRating: 'tough', achievements: ['Dynamic Flex'], adp: 68, injuryHistory: 'Questionable' },
  { id: 'f-29', name: 'Christian Watson', team: 'GB', position: 'WR', tier: 4, projectedPts: 11.0, opponent: 'MIN', matchupRating: 'neutral', achievements: ['Deep Threat Weapon'], adp: 69, injuryHistory: 'Fragile' },
  { id: 'f-30', name: 'Jayden Reed', team: 'GB', position: 'WR', tier: 3, projectedPts: 12.6, opponent: 'MIN', matchupRating: 'neutral', achievements: ['YAC Specialist'], adp: 70, injuryHistory: 'Durable' },

  // --- ROUND 8 (ADP 71 - 80) ---
  { id: 'f-31', name: 'Ladd McConkey', team: 'LAC', position: 'WR', tier: 4, projectedPts: 11.5, opponent: 'OAK', matchupRating: 'favorable', achievements: ['Slot Sniper'], adp: 71, injuryHistory: 'Durable' },
  { id: 'f-32', name: 'Jaxon Smith-Njigba', team: 'SEA', position: 'WR', tier: 4, projectedPts: 11.2, opponent: 'SF', matchupRating: 'neutral', achievements: ['Volume Slot'], adp: 72, injuryHistory: 'Durable' },
  { id: 'f-33', name: 'Khalil Shakir', team: 'BUF', position: 'WR', tier: 4, projectedPts: 10.9, opponent: 'MIA', matchupRating: 'favorable', achievements: ['Mr. Reliable'], adp: 73, injuryHistory: 'Durable' },
  { id: 'f-34', name: 'Rome Odunze', team: 'CHI', position: 'WR', tier: 4, projectedPts: 10.8, opponent: 'DET', matchupRating: 'neutral', achievements: ['Super Rookie'], adp: 74, injuryHistory: 'Durable' },
  { id: 'f-35', name: 'Brian Thomas Jr.', team: 'JAX', position: 'WR', tier: 4, projectedPts: 11.4, opponent: 'TEN', matchupRating: 'favorable', achievements: ['Vertical Weapon'], adp: 75, injuryHistory: 'Durable' },
  { id: 'f-36', name: 'Zamir White', team: 'LV', position: 'RB', tier: 5, projectedPts: 9.2, opponent: 'KC', matchupRating: 'brutal', achievements: ['Breakout Candidate'], adp: 76, injuryHistory: 'Durable' },
  { id: 'f-37', name: 'Javonte Williams', team: 'DEN', position: 'RB', tier: 4, projectedPts: 11.1, opponent: 'LAC', matchupRating: 'neutral', achievements: ['Angry Runner Jr'], adp: 77, injuryHistory: 'Questionable' },
  { id: 'f-38', name: 'Trey Benson', team: 'ARI', position: 'RB', tier: 5, projectedPts: 9.5, opponent: 'LAR', matchupRating: 'neutral', achievements: ['Sleeper Target'], adp: 78, injuryHistory: 'Durable' },
  { id: 'f-39', name: 'Jake Ferguson', team: 'DAL', position: 'TE', tier: 3, projectedPts: 10.2, opponent: 'WAS', matchupRating: 'smash', achievements: ['Redzone Safety Valve'], adp: 79, injuryHistory: 'Durable' },
  { id: 'f-40', name: 'Evan Engram', team: 'JAX', position: 'TE', tier: 3, projectedPts: 10.5, opponent: 'TEN', matchupRating: 'favorable', achievements: ['PPR Vacuum'], adp: 80, injuryHistory: 'Durable' },

  // --- ROUND 9 (ADP 81 - 90) ---
  { id: 'f-41', name: 'Dak Prescott', team: 'DAL', position: 'QB', tier: 3, projectedPts: 16.5, opponent: 'WAS', matchupRating: 'smash', achievements: ['PPR King'], adp: 81, injuryHistory: 'Questionable' },
  { id: '8183', name: 'Brock Purdy', team: 'SF', position: 'QB', tier: 3, projectedPts: 16.4, opponent: 'SEA', matchupRating: 'neutral', achievements: ['High Efficiency Pilot'], adp: 82, injuryHistory: 'Durable' },
  { id: 'f-42', name: 'Tua Tagovailoa', team: 'MIA', position: 'QB', tier: 3, projectedPts: 15.8, opponent: 'BUF', matchupRating: 'neutral', achievements: ['Quick Release Pilot'], adp: 83, injuryHistory: 'Fragile' },
  { id: 'f-43', name: 'Justin Herbert', team: 'LAC', position: 'QB', tier: 4, projectedPts: 14.5, opponent: 'LV', matchupRating: 'neutral', achievements: ['Rocket Arm'], adp: 84, injuryHistory: 'Questionable' },
  { id: 'f-44', name: 'Dallas Goedert', team: 'PHI', position: 'TE', tier: 3, projectedPts: 9.5, opponent: 'NYG', matchupRating: 'smash', achievements: ['First-Down Weapon'], adp: 85, injuryHistory: 'Questionable' },
  { id: 'f-45', name: 'David Njoku', team: 'CLE', position: 'TE', tier: 3, projectedPts: 9.8, opponent: 'PIT', matchupRating: 'neutral', achievements: ['Athletic Redzone Beast'], adp: 86, injuryHistory: 'Durable' },
  { id: 'f-46', name: 'Jonathon Brooks', team: 'CAR', position: 'RB', tier: 4, projectedPts: 10.5, opponent: 'ATL', matchupRating: 'neutral', achievements: ['Rookie Bellcow'], adp: 87, injuryHistory: 'Questionable' },
  { id: 'f-47', name: 'Blake Corum', team: 'LAR', position: 'RB', tier: 5, projectedPts: 8.5, opponent: 'ARI', matchupRating: 'favorable', achievements: ['Touchdown Thief'], adp: 88, injuryHistory: 'Durable' },
  { id: 'f-48', name: 'Tony Pollard', team: 'TEN', position: 'RB', tier: 4, projectedPts: 10.2, opponent: 'JAX', matchupRating: 'neutral', achievements: ['PPR Speedster'], adp: 89, injuryHistory: 'Durable' },
  { id: 'f-49', name: 'Austin Ekeler', team: 'WAS', position: 'RB', tier: 5, projectedPts: 9.1, opponent: 'DAL', matchupRating: 'neutral', achievements: ['Receiving Threat'], adp: 90, injuryHistory: 'Questionable' },

  // --- ROUND 10 (ADP 91 - 100) ---
  { id: 'f-50', name: 'Jayden Daniels', team: 'WAS', position: 'QB', tier: 3, projectedPts: 17.5, opponent: 'DAL', matchupRating: 'tough', achievements: ['Phenom Runner'], adp: 91, injuryHistory: 'Durable' },
  { id: 'f-51', name: 'Jaxson Dart', team: 'MIA', position: 'QB', tier: 4, projectedPts: 13.9, opponent: 'BUF', matchupRating: 'neutral', achievements: ['Sleeper Arm'], adp: 92, injuryHistory: 'Durable' },
  { id: 'f-52', name: 'Courtland Sutton', team: 'DEN', position: 'WR', tier: 4, projectedPts: 10.5, opponent: 'LAC', matchupRating: 'neutral', achievements: ['Redzone Target'], adp: 93, injuryHistory: 'Durable' },
  { id: '8146', name: 'Zamir White', team: 'LV', position: 'RB', tier: 5, projectedPts: 9.2, opponent: 'KC', matchupRating: 'brutal', achievements: ['Breakout Candidate'], adp: 94, injuryHistory: 'Durable' },
  { id: '1234', name: 'Caleb Williams', team: 'CHI', position: 'QB', tier: 4, projectedPts: 14.8, opponent: 'DET', matchupRating: 'tough', achievements: ['Breakout Prospect'], adp: 95, injuryHistory: 'Durable' },
  { id: 'f-53', name: 'Keon Coleman', team: 'BUF', position: 'WR', tier: 4, projectedPts: 10.4, opponent: 'MIA', matchupRating: 'neutral', achievements: ['Rookie Physical'], adp: 96, injuryHistory: 'Durable' },
  { id: 'f-54', name: 'T.J. Hockenson', team: 'MIN', position: 'TE', tier: 3, projectedPts: 9.2, opponent: 'GB', matchupRating: 'neutral', achievements: ['Elite Target (Inured)'], adp: 97, injuryHistory: 'Fragile' },
  { id: 'f-55', name: 'Pat Freiermuth', team: 'PIT', position: 'TE', tier: 4, projectedPts: 8.4, opponent: 'CLE', matchupRating: 'neutral', achievements: ['Muth Value'], adp: 98, injuryHistory: 'Questionable' },
  { id: 'f-56', name: 'Kirk Cousins', team: 'ATL', position: 'QB', tier: 4, projectedPts: 14.2, opponent: 'CAR', matchupRating: 'smash', achievements: ['Captain Kirk'], adp: 99, injuryHistory: 'Fragile' },
  { id: 'f-57', name: 'Devin Singletary', team: 'NYG', position: 'RB', tier: 4, projectedPts: 10.1, opponent: 'PHI', matchupRating: 'tough', achievements: ['Underdog Bellcow'], adp: 100, injuryHistory: 'Durable' },

  // --- ROUND 11-15 (ADP 101 - 130) ---
  { id: '6843', name: 'Cole Kmet', team: 'CHI', position: 'TE', tier: 4, projectedPts: 8.5, opponent: 'DET', matchupRating: 'tough', achievements: ['Goal-line Option'], adp: 105, injuryHistory: 'Durable' },
  { id: 'SF', name: 'San Francisco 49ers', team: 'SF', position: 'DEF', tier: 1, projectedPts: 8.5, opponent: 'SEA', matchupRating: 'neutral', achievements: ['Pass Rush Heavy', 'Turnover Artists'], adp: 110, injuryHistory: 'Durable' },
  { id: 'BAL', name: 'Baltimore Ravens', team: 'BAL', position: 'DEF', tier: 1, projectedPts: 9.2, opponent: 'CIN', matchupRating: 'neutral', achievements: ['Lockdown Secondary', 'Blitz Masters'], adp: 112, injuryHistory: 'Durable' },
  { id: 'NYJ', name: 'New York Jets', team: 'NYJ', position: 'DEF', tier: 1, projectedPts: 8.8, opponent: 'NE', matchupRating: 'smash', achievements: ['Shutout Special'], adp: 114, injuryHistory: 'Durable' },
  { id: 'DAL', name: 'Dallas Cowboys', team: 'DAL', position: 'DEF', tier: 2, projectedPts: 7.8, opponent: 'WAS', matchupRating: 'favorable', achievements: ['Sack Monsters'], adp: 118, injuryHistory: 'Durable' },
  { id: '11435', name: 'Brandon Aubrey', team: 'DAL', position: 'K', tier: 1, projectedPts: 10.5, opponent: 'WAS', matchupRating: 'smash', achievements: ['Leg of Gold', 'Automatic'], adp: 120, injuryHistory: 'Durable' },
  { id: 'CLE', name: 'Cleveland Browns', team: 'CLE', position: 'DEF', tier: 2, projectedPts: 7.5, opponent: 'PIT', matchupRating: 'neutral', achievements: ['Home Field Lockdown'], adp: 121, injuryHistory: 'Durable' },
  { id: '1264', name: 'Justin Tucker', team: 'BAL', position: 'K', tier: 1, projectedPts: 9.2, opponent: 'CIN', matchupRating: 'neutral', achievements: ['Historic Great', 'Clutch Leg'], adp: 122, injuryHistory: 'Durable' },
  { id: 'KC', name: 'Kansas City Chiefs', team: 'KC', position: 'DEF', tier: 2, projectedPts: 8.2, opponent: 'LV', matchupRating: 'smash', achievements: ['Championship Caliber'], adp: 124, injuryHistory: 'Durable' },
  { id: '4227', name: 'Harrison Butker', team: 'KC', position: 'K', tier: 2, projectedPts: 8.9, opponent: 'LV', matchupRating: 'smash', achievements: ['Superbowl Champ'], adp: 125, injuryHistory: 'Durable' },
  { id: '3451', name: 'Ka\'imi Fairbairn', team: 'HOU', position: 'K', tier: 2, projectedPts: 8.5, opponent: 'IND', matchupRating: 'favorable', achievements: ['Dome Kicker'], adp: 130, injuryHistory: 'Durable' }
];

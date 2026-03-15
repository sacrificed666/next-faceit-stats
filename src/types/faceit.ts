export interface FaceitPlayerResponse {
  player_id: string;
  nickname: string;
  avatar: string;
  country: string;
  games: {
    cs2?: {
      faceit_elo: number;
      skill_level: number;
    };
  };
}

export interface FaceitMatchStatsRaw {
  "Match Id": string;
  "Match Finished At": number;
  Map: string;
  "Game Mode": string;
  Kills: string;
  Deaths: string;
  Assists: string;
  "K/D Ratio": string;
  "K/R Ratio": string;
  ADR: string;
  "Headshots %": string;
  Result: string;
  Score: string;
  Rounds: string;
  "Triple Kills": string;
  "Quadro Kills": string;
  "Penta Kills": string;
  MVPs: string;
  "First Half Score": string;
  "Second Half Score": string;
  "Overtime score": string;
}

export interface FaceitStatsResponse {
  items: Array<{
    stats: FaceitMatchStatsRaw;
  }>;
}

export interface ProcessedMatch {
  matchId: string;
  finishedAt: number;
  date: string;
  map: string;
  mapKey: string;
  kills: number;
  deaths: number;
  assists: number;
  kd: number;
  kr: number;
  adr: number;
  hsPercent: number;
  result: boolean;
  score: string;
  rounds: number;
  tripleKills: number;
  quadroKills: number;
  pentaKills: number;
  mvps: number;
  firstHalfScore: number;
  secondHalfScore: number;
  overtimeScore: number;
}

export interface PlayerData {
  playerId: string;
  nickname: string;
  avatar: string;
  country: string;
  elo: number;
  level: number;
  matches: ProcessedMatch[];
  colorIndex: number;
}

export interface AggregatedStats {
  avgKd: number;
  avgKr: number;
  avgAdr: number;
  avgHsPercent: number;
  winPercent: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  totalMatches: number;
}

export interface PlayerWithStats extends PlayerData {
  filteredMatches: ProcessedMatch[];
  stats: AggregatedStats;
}

export type RangeFilter = 5 | 10 | 20 | 30 | 50 | 100;
export type SortDirection = "asc" | "desc";
export type MetricKey = "kd" | "kr" | "adr" | "hsPercent" | "winPercent";

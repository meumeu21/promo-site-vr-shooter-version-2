import type { HistoryMatchListItem, MatchClub, MatchDetail, MatchPlayerStats, MatchTeam, MatchTeamSummary, PaginatedHistoryMatchesResponse, PaginationMeta } from '@/types/api';
export type { HistoryMatchListItem } from '@/types/api';
export const API_PROXY_BASE = '/backend';
const backendBase = process.env.BACKEND_URL ?? 'http://backend:4000';
const MAP_LABELS: Record<string, string> = {
  de_mirage: 'Мираж',
  de_inferno: 'Инферно',
  de_nuke: 'Нюк',
  de_ancient: 'Эншент',
  de_dust2: 'Даст 2',
  de_overpass: 'Оверпасс',
  de_train: 'Трейн'
};
const MODE_LABELS: Record<string, string> = {
  competitive: 'Соревновательный',
  'team-deathmatch': 'Командный бой',
  'bomb-defuse': 'Обезвреживание бомбы',
  deathmatch: 'Deathmatch'
};
export interface HistoryMatchesQuery {
  clubId?: string;
  clubSlug?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}
export interface HistoryMatchesResult {
  data: HistoryMatchListItem[];
  meta: PaginationMeta;
}
export interface MatchesByClubGroup {
  clubId: string;
  clubSlug: string;
  clubName: string;
  clubAddress: string;
  matches: HistoryMatchListItem[];
}
export const apiUrl = (path: string): string => `${API_PROXY_BASE}${path}`;
export const backendApiUrl = (path: string): string => `${backendBase}/api${path}`;
export const parseError = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as {
      error?: string;
      message?: string;
    };
    return payload.error ?? payload.message ?? `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
};
const fetchBackend = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const isBrowser = typeof window !== 'undefined';
  const url = isBrowser ? apiUrl(path) : backendApiUrl(path);
  const response = await fetch(url, {
    ...init,
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json() as Promise<T>;
};
export const buildHistoryMatchesQuery = (filters: HistoryMatchesQuery = {}): string => {
  const params = new URLSearchParams();
  if (filters.clubId) params.set('clubId', filters.clubId);
  if (filters.clubSlug) params.set('clubSlug', filters.clubSlug);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (typeof filters.limit === 'number') params.set('limit', String(filters.limit));
  if (typeof filters.offset === 'number') params.set('offset', String(filters.offset));
  const query = params.toString();
  return query ? `?${query}` : '';
};
export interface GroupedHistoryMatches {
  club: MatchClub;
  matches: HistoryMatchListItem[];
  hasMoreMatches: boolean;
  totalMatches: number;
}
export interface PaginatedGroupedHistoryMatchesResponse {
  data: GroupedHistoryMatches[];
  meta: {
    totalClubs: number;
    clubLimit: number;
    clubOffset: number;
  };
}
export const getHistoryMatches = async (filters: HistoryMatchesQuery = {}): Promise<HistoryMatchesResult> => {
  const payload = await fetchBackend<PaginatedHistoryMatchesResponse>(`/matches${buildHistoryMatchesQuery(filters)}`);
  return {
    data: payload.data,
    meta: payload.meta
  };
};
export const getGroupedHistoryMatches = async (filters: {
  clubLimit?: number;
  clubOffset?: number;
  matchLimit?: number;
  from?: string;
  to?: string;
  clubId?: string;
  clubSlug?: string;
} = {}): Promise<PaginatedGroupedHistoryMatchesResponse> => {
  const params = new URLSearchParams();
  if (filters.clubLimit) params.set('clubLimit', String(filters.clubLimit));
  if (filters.clubOffset) params.set('clubOffset', String(filters.clubOffset));
  if (filters.matchLimit) params.set('matchLimit', String(filters.matchLimit));
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.clubId) params.set('clubId', filters.clubId);
  if (filters.clubSlug) params.set('clubSlug', filters.clubSlug);
  const query = params.toString();
  return fetchBackend<PaginatedGroupedHistoryMatchesResponse>(`/matches/grouped${query ? `?${query}` : ''}`);
};
export const groupMatchesByClub = (matches: HistoryMatchListItem[]): MatchesByClubGroup[] => {
  const groups = new Map<string, MatchesByClubGroup>();
  matches.forEach(match => {
    const key = match.club.id;
    const existing = groups.get(key);
    if (existing) {
      existing.matches.push(match);
      return;
    }
    groups.set(key, {
      clubId: match.club.id,
      clubSlug: match.club.slug,
      clubName: match.club.name,
      clubAddress: match.club.address,
      matches: [match]
    });
  });
  return Array.from(groups.values());
};
export const getMatchDetail = async (id: string): Promise<MatchDetail> => {
  const payload = await fetchBackend<{
    data: MatchDetail;
  }>(`/matches/${id}`);
  return payload.data;
};
export const sortTeamsBySide = <T extends MatchTeamSummary | MatchTeam,>(teams: T[]): T[] => [...teams].sort((left, right) => {
  if (left.side === right.side) return 0;
  return left.side === 'home' ? -1 : 1;
});
export const formatMapLabel = (value: string): string => MAP_LABELS[value] ?? value.replace(/^de_/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
export const formatModeLabel = (value: string): string => MODE_LABELS[value] ?? value.replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
export const formatMatchDateTimeDots = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${d}.${m}.${y} ${h}:${min}`;
};
export const formatMatchDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
export const formatMatchDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};
export const formatTeamSide = (side: MatchTeamSummary['side']): string => side === 'home' ? 'Команда A' : 'Команда B';
export const formatKdaLine = (player: MatchPlayerStats): string => `${player.kills} / ${player.deaths} / ${player.assists}`;
export const getMatchScoreline = (teams: MatchTeamSummary[]): string => {
  const [home, away] = sortTeamsBySide(teams);
  return home && away ? `${home.score}:${away.score}` : '—';
};
export const getPaginationWindow = (meta: PaginationMeta): {
  start: number;
  end: number;
  hasMore: boolean;
} => {
  const total = meta.total ?? 0;
  if (total === 0) {
    return {
      start: 0,
      end: 0,
      hasMore: false
    };
  }
  const start = meta.offset + 1;
  const end = Math.min(meta.offset + meta.limit, total);
  return {
    start,
    end,
    hasMore: meta.offset + meta.limit < total
  };
};

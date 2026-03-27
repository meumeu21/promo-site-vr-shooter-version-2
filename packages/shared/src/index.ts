export type AdminRole = "viewer" | "operator";
export type MatchTeamSide = "home" | "away";
export type MatchTeamResult = "winner" | "loser" | "draw";
export interface PaginationMeta {
  limit: number;
  offset: number;
  total: number;
}
export interface MatchPlayerStats {
  id: string;
  playerId: string | null;
  nickname: string;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
}
export interface MatchTeamSummary {
  id: string;
  side: MatchTeamSide;
  name: string;
  score: number;
  result: MatchTeamResult;
}
export interface MatchTeam extends MatchTeamSummary {
  players: MatchPlayerStats[];
}
export interface MatchClub {
  id: string;
  slug: string;
  name: string;
  address: string;
}
export interface HistoryMatchListFilters {
  clubId?: string;
  clubSlug?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}
export interface HistoryMatchListItem {
  id: string;
  externalMatchId: string | null;
  club: MatchClub;
  map: string;
  mode: string;
  bestOf: number;
  playedAt: string;
  winnerTeamId: string | null;
  teams: MatchTeamSummary[];
}
export interface PaginatedHistoryMatchesResponse {
  data: HistoryMatchListItem[];
  meta: PaginationMeta;
}
export interface MatchDetail extends HistoryMatchListItem {
  teams: MatchTeam[];
}
export interface ImportMatchClubInput {
  id?: string;
  slug?: string;
  name: string;
  address: string;
}
export interface ImportMatchPlayerStatsInput {
  playerId?: string;
  nickname: string;
  kills: number;
  deaths: number;
  assists: number;
}
export interface ImportMatchTeamInput {
  side: MatchTeamSide;
  name: string;
  score: number;
  players: ImportMatchPlayerStatsInput[];
}
interface BaseImportCompletedMatchRequest {
  club: ImportMatchClubInput;
  map: string;
  mode: string;
  bestOf: number;
  playedAt: string;
  teams: [ImportMatchTeamInput, ImportMatchTeamInput];
}
export interface AdminImportCompletedMatchRequest extends BaseImportCompletedMatchRequest {
  externalMatchId?: string;
}
export interface HistoryIngestMatchRequest extends BaseImportCompletedMatchRequest {
  externalMatchId: string;
}
export type ImportCompletedMatchRequest = AdminImportCompletedMatchRequest;
export { ADMIN_ROLES, MATCH_TEAM_RESULTS, MATCH_TEAM_SIDES, isAdminRole, isMatchTeamResult, isMatchTeamSide, validateAdminImportCompletedMatchRequest, validateHistoryIngestMatchRequest } from "./runtime-contracts";
export type { ValidationFailure, ValidationResult, ValidationSuccess } from "./runtime-contracts";

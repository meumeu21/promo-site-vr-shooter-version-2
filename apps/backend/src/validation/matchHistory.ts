import type { HistoryMatchListFilters, ImportCompletedMatchRequest, ImportMatchClubInput, ImportMatchPlayerStatsInput, ImportMatchTeamInput, MatchTeamSide } from "../types";
import { ValidationError } from "../errors/httpError";
import { asObject, asOptionalString, asString } from "./common";
const TEAM_SIDES: MatchTeamSide[] = ["home", "away"];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const asNonNegativeInteger = (value: unknown, fieldName: string): number => {
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    throw new ValidationError(`${fieldName} must be a non-negative integer`);
  }
  return value;
};
const asPositiveInteger = (value: unknown, fieldName: string): number => {
  const parsed = asNonNegativeInteger(value, fieldName);
  if (parsed < 1) {
    throw new ValidationError(`${fieldName} must be a positive integer`);
  }
  return parsed;
};
const asOptionalTrimmedString = (value: unknown, fieldName: string): string | undefined => {
  const parsed = asOptionalString(value, fieldName);
  return parsed?.trim() || undefined;
};
const asIsoDateTime = (value: unknown, fieldName: string): string => {
  const raw = asString(value, fieldName);
  if (Number.isNaN(Date.parse(raw))) {
    throw new ValidationError(`${fieldName} must be a valid ISO datetime string`);
  }
  return new Date(raw).toISOString();
};
const asOptionalIsoDateTime = (value: unknown, fieldName: string): string | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string" || !value.trim()) {
    throw new ValidationError(`${fieldName} must be a valid ISO datetime string`);
  }
  return asIsoDateTime(value, fieldName);
};
const asTeamSide = (value: unknown, fieldName: string): MatchTeamSide => {
  const side = asString(value, fieldName) as MatchTeamSide;
  if (!TEAM_SIDES.includes(side)) {
    throw new ValidationError(`${fieldName} must be one of: ${TEAM_SIDES.join(", ")}`);
  }
  return side;
};
const asPaginationNumber = (value: string | undefined, fieldName: "limit" | "offset"): number | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (!/^\d+$/.test(value)) {
    throw new ValidationError(`${fieldName} must be a non-negative integer`);
  }
  return Number(value);
};
const normalizeClub = (value: unknown): ImportMatchClubInput => {
  const club = asObject(value, "club");
  return {
    id: asOptionalTrimmedString(club.id, "club.id"),
    slug: asOptionalTrimmedString(club.slug, "club.slug"),
    name: asString(club.name, "club.name"),
    address: asString(club.address, "club.address")
  };
};
const normalizePlayer = (value: unknown, teamIndex: number, playerIndex: number): ImportMatchPlayerStatsInput => {
  const player = asObject(value, `teams[${teamIndex}].players[${playerIndex}]`);
  return {
    playerId: asOptionalString(player.playerId, `teams[${teamIndex}].players[${playerIndex}].playerId`),
    nickname: asString(player.nickname, `teams[${teamIndex}].players[${playerIndex}].nickname`),
    kills: asNonNegativeInteger(player.kills, `teams[${teamIndex}].players[${playerIndex}].kills`),
    deaths: asNonNegativeInteger(player.deaths, `teams[${teamIndex}].players[${playerIndex}].deaths`),
    assists: asNonNegativeInteger(player.assists, `teams[${teamIndex}].players[${playerIndex}].assists`)
  };
};
const normalizeTeam = (value: unknown, teamIndex: number): ImportMatchTeamInput => {
  const team = asObject(value, `teams[${teamIndex}]`);
  const playersRaw = team.players;
  if (!Array.isArray(playersRaw) || playersRaw.length === 0) {
    throw new ValidationError(`teams[${teamIndex}].players must be a non-empty array`);
  }
  return {
    side: asTeamSide(team.side, `teams[${teamIndex}].side`),
    name: asString(team.name, `teams[${teamIndex}].name`),
    score: asNonNegativeInteger(team.score, `teams[${teamIndex}].score`),
    players: playersRaw.map((player, playerIndex) => normalizePlayer(player, teamIndex, playerIndex))
  };
};
export const normalizeImportedMatch = (input: unknown): ImportCompletedMatchRequest => {
  const body = asObject(input);
  const teamsRaw = body.teams;
  if (!Array.isArray(teamsRaw) || teamsRaw.length !== 2) {
    throw new ValidationError("teams must contain exactly 2 teams");
  }
  const teams = teamsRaw.map((team, index) => normalizeTeam(team, index)) as [ImportMatchTeamInput, ImportMatchTeamInput];
  const sides = new Set(teams.map(team => team.side));
  if (sides.size !== 2) {
    throw new ValidationError("teams must contain one home team and one away team");
  }
  return {
    externalMatchId: asOptionalTrimmedString(body.externalMatchId, "externalMatchId"),
    club: normalizeClub(body.club),
    map: asString(body.map, "map"),
    mode: asString(body.mode, "mode"),
    bestOf: asPositiveInteger(body.bestOf, "bestOf"),
    playedAt: asIsoDateTime(body.playedAt, "playedAt"),
    teams
  };
};
export const normalizeAdminImportedMatch = (input: unknown): ImportCompletedMatchRequest => {
  const payload = normalizeImportedMatch(input);
  if (!payload.externalMatchId) {
    throw new ValidationError("externalMatchId is required");
  }
  return payload;
};
export const normalizeHistoryMatchListFilters = (input: unknown): Required<Pick<HistoryMatchListFilters, "limit" | "offset">> & Omit<HistoryMatchListFilters, "limit" | "offset"> => {
  const query = asObject(input, "query");
  const limit = asPaginationNumber(typeof query.limit === "string" ? query.limit : undefined, "limit") ?? DEFAULT_LIMIT;
  const offset = asPaginationNumber(typeof query.offset === "string" ? query.offset : undefined, "offset") ?? 0;
  if (limit < 1) {
    throw new ValidationError("limit must be a positive integer");
  }
  if (limit > MAX_LIMIT) {
    throw new ValidationError(`limit must be less than or equal to ${MAX_LIMIT}`);
  }
  return {
    clubId: asOptionalTrimmedString(query.clubId, "clubId"),
    clubSlug: asOptionalTrimmedString(query.clubSlug, "clubSlug"),
    from: asOptionalIsoDateTime(query.from, "from"),
    to: asOptionalIsoDateTime(query.to, "to"),
    limit,
    offset
  };
};

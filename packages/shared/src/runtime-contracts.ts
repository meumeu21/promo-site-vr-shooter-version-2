import type { AdminImportCompletedMatchRequest, AdminRole, HistoryIngestMatchRequest, ImportMatchClubInput, ImportMatchPlayerStatsInput, ImportMatchTeamInput, MatchTeamResult, MatchTeamSide } from "./index";
export type ValidationSuccess<T> = {
  success: true;
  data: T;
};
export type ValidationFailure = {
  success: false;
  errors: string[];
};
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;
type UnknownRecord = Record<string, unknown>;
type BaseImportRuntimeShape = {
  club: ImportMatchClubInput;
  map: string;
  mode: string;
  bestOf: number;
  playedAt: string;
  teams: [ImportMatchTeamInput, ImportMatchTeamInput];
};
export const ADMIN_ROLES = Object.freeze(["viewer", "operator"] as const satisfies readonly AdminRole[]);
export const MATCH_TEAM_SIDES = Object.freeze(["home", "away"] as const satisfies readonly MatchTeamSide[]);
export const MATCH_TEAM_RESULTS = Object.freeze(["winner", "loser", "draw"] as const satisfies readonly MatchTeamResult[]);
const adminRoleSet = new Set<string>(ADMIN_ROLES);
const matchTeamSideSet = new Set<string>(MATCH_TEAM_SIDES);
const matchTeamResultSet = new Set<string>(MATCH_TEAM_RESULTS);
const success = <T,>(data: T): ValidationSuccess<T> => ({
  success: true,
  data
});
const failure = (errors: string[]): ValidationFailure => ({
  success: false,
  errors
});
const resultErrors = <T,>(result: ValidationResult<T>): string[] => result.success ? [] : result.errors;
const isRecord = (value: unknown): value is UnknownRecord => typeof value === "object" && value !== null && !Array.isArray(value);
const isNonEmptyString = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const isPositiveInteger = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value > 0;
const isNonNegativeInteger = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0;
const readRequiredString = (value: unknown, fieldPath: string): ValidationResult<string> => isNonEmptyString(value) ? success(value.trim()) : failure([`${fieldPath} must be a non-empty string`]);
const readIsoDateString = (value: unknown, fieldPath: string): ValidationResult<string> => {
  const stringResult = readRequiredString(value, fieldPath);
  if (!stringResult.success) {
    return stringResult;
  }
  const timestamp = stringResult.data;
  const isIsoDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(timestamp);
  if (!isIsoDateTime || Number.isNaN(Date.parse(timestamp))) {
    return failure([`${fieldPath} must be a valid ISO-8601 date-time string`]);
  }
  return success(timestamp);
};
const readOptionalString = (value: unknown, fieldPath: string): ValidationResult<string | undefined> => value === undefined ? success(undefined) : readRequiredString(value, fieldPath);
const readPositiveInteger = (value: unknown, fieldPath: string): ValidationResult<number> => isPositiveInteger(value) ? success(value) : failure([`${fieldPath} must be a positive integer`]);
const readNonNegativeInteger = (value: unknown, fieldPath: string): ValidationResult<number> => isNonNegativeInteger(value) ? success(value) : failure([`${fieldPath} must be a non-negative integer`]);
const readEnum = <T extends string,>(value: unknown, allowedValues: readonly T[], fieldPath: string): ValidationResult<T> => typeof value === "string" && allowedValues.includes(value as T) ? success(value as T) : failure([`${fieldPath} must be one of: ${allowedValues.join(", ")}`]);
const parseClub = (value: unknown): ValidationResult<ImportMatchClubInput> => {
  if (!isRecord(value)) {
    return failure(["club must be an object"]);
  }
  const idResult = readOptionalString(value.id, "club.id");
  const slugResult = readOptionalString(value.slug, "club.slug");
  const nameResult = readRequiredString(value.name, "club.name");
  const addressResult = readRequiredString(value.address, "club.address");
  const errors = [...resultErrors(idResult), ...resultErrors(slugResult), ...resultErrors(nameResult), ...resultErrors(addressResult)];
  if (errors.length > 0) {
    return failure(errors);
  }
  if (!idResult.success || !slugResult.success || !nameResult.success || !addressResult.success) {
    return failure(errors);
  }
  return success({
    ...(idResult.data === undefined ? {} : {
      id: idResult.data
    }),
    ...(slugResult.data === undefined ? {} : {
      slug: slugResult.data
    }),
    name: nameResult.data,
    address: addressResult.data
  });
};
const parsePlayer = (value: unknown, playerIndex: number, teamIndex: number): ValidationResult<ImportMatchPlayerStatsInput> => {
  const fieldPrefix = `teams[${teamIndex}].players[${playerIndex}]`;
  if (!isRecord(value)) {
    return failure([`${fieldPrefix} must be an object`]);
  }
  const playerIdResult = readOptionalString(value.playerId, `${fieldPrefix}.playerId`);
  const nicknameResult = readRequiredString(value.nickname, `${fieldPrefix}.nickname`);
  const killsResult = readNonNegativeInteger(value.kills, `${fieldPrefix}.kills`);
  const deathsResult = readNonNegativeInteger(value.deaths, `${fieldPrefix}.deaths`);
  const assistsResult = readNonNegativeInteger(value.assists, `${fieldPrefix}.assists`);
  const errors = [...resultErrors(playerIdResult), ...resultErrors(nicknameResult), ...resultErrors(killsResult), ...resultErrors(deathsResult), ...resultErrors(assistsResult)];
  if (errors.length > 0) {
    return failure(errors);
  }
  if (!playerIdResult.success || !nicknameResult.success || !killsResult.success || !deathsResult.success || !assistsResult.success) {
    return failure(errors);
  }
  return success({
    ...(playerIdResult.data === undefined ? {} : {
      playerId: playerIdResult.data
    }),
    nickname: nicknameResult.data,
    kills: killsResult.data,
    deaths: deathsResult.data,
    assists: assistsResult.data
  });
};
const parsePlayers = (value: unknown, teamIndex: number): ValidationResult<ImportMatchPlayerStatsInput[]> => {
  if (!Array.isArray(value) || value.length === 0) {
    return failure([`teams[${teamIndex}].players must contain at least one player`]);
  }
  const parsed = value.reduce((accumulator, player, playerIndex) => {
    const playerResult = parsePlayer(player, playerIndex, teamIndex);
    return playerResult.success ? {
      errors: accumulator.errors,
      players: [...accumulator.players, playerResult.data]
    } : {
      errors: [...accumulator.errors, ...playerResult.errors],
      players: accumulator.players
    };
  }, {
    errors: [] as string[],
    players: [] as ImportMatchPlayerStatsInput[]
  });
  return parsed.errors.length > 0 ? failure(parsed.errors) : success(parsed.players);
};
const parseTeam = (value: unknown, teamIndex: number): ValidationResult<ImportMatchTeamInput> => {
  const fieldPrefix = `teams[${teamIndex}]`;
  if (!isRecord(value)) {
    return failure([`${fieldPrefix} must be an object`]);
  }
  const sideResult = readEnum(value.side, MATCH_TEAM_SIDES, `${fieldPrefix}.side`);
  const nameResult = readRequiredString(value.name, `${fieldPrefix}.name`);
  const scoreResult = readNonNegativeInteger(value.score, `${fieldPrefix}.score`);
  const playersResult = parsePlayers(value.players, teamIndex);
  const errors = [...resultErrors(sideResult), ...resultErrors(nameResult), ...resultErrors(scoreResult), ...resultErrors(playersResult)];
  if (errors.length > 0) {
    return failure(errors);
  }
  if (!sideResult.success || !nameResult.success || !scoreResult.success || !playersResult.success) {
    return failure(errors);
  }
  return success({
    side: sideResult.data,
    name: nameResult.data,
    score: scoreResult.data,
    players: playersResult.data
  });
};
const parseTeams = (value: unknown): ValidationResult<[ImportMatchTeamInput, ImportMatchTeamInput]> => {
  if (!Array.isArray(value) || value.length !== 2) {
    return failure(["teams must contain exactly 2 teams"]);
  }
  const parsedTeams = value.map((team, teamIndex) => parseTeam(team, teamIndex));
  const validSides = value.every(team => isRecord(team) && isMatchTeamSide(team.side));
  const uniqueSides = new Set(value.map(team => isRecord(team) ? team.side : undefined)).size === 2;
  const errors = [...(validSides && uniqueSides ? [] : ["teams must contain one home team and one away team"]), ...parsedTeams.flatMap(teamResult => resultErrors(teamResult))];
  if (errors.length > 0) {
    return failure(errors);
  }
  const [firstTeam, secondTeam] = parsedTeams;
  if (!firstTeam.success || !secondTeam.success) {
    return failure(errors);
  }
  return success([firstTeam.data, secondTeam.data]);
};
const parseBaseImportRequest = (value: unknown): ValidationResult<BaseImportRuntimeShape> => {
  if (!isRecord(value)) {
    return failure(["payload must be an object"]);
  }
  const clubResult = parseClub(value.club);
  const mapResult = readRequiredString(value.map, "map");
  const modeResult = readRequiredString(value.mode, "mode");
  const bestOfResult = readPositiveInteger(value.bestOf, "bestOf");
  const playedAtResult = readIsoDateString(value.playedAt, "playedAt");
  const teamsResult = parseTeams(value.teams);
  const errors = [...resultErrors(bestOfResult), ...resultErrors(clubResult), ...resultErrors(mapResult), ...resultErrors(modeResult), ...resultErrors(playedAtResult), ...resultErrors(teamsResult)];
  if (errors.length > 0) {
    return failure(errors);
  }
  if (!clubResult.success || !mapResult.success || !modeResult.success || !bestOfResult.success || !playedAtResult.success || !teamsResult.success) {
    return failure(errors);
  }
  return success({
    club: clubResult.data,
    map: mapResult.data,
    mode: modeResult.data,
    bestOf: bestOfResult.data,
    playedAt: playedAtResult.data,
    teams: teamsResult.data
  });
};
export const isAdminRole = (value: unknown): value is AdminRole => typeof value === "string" && adminRoleSet.has(value);
export const isMatchTeamSide = (value: unknown): value is MatchTeamSide => typeof value === "string" && matchTeamSideSet.has(value);
export const isMatchTeamResult = (value: unknown): value is MatchTeamResult => typeof value === "string" && matchTeamResultSet.has(value);
export const validateAdminImportCompletedMatchRequest = (value: unknown): ValidationResult<AdminImportCompletedMatchRequest> => {
  const baseResult = parseBaseImportRequest(value);
  if (!baseResult.success) {
    return baseResult;
  }
  if (!isRecord(value)) {
    return failure(["payload must be an object"]);
  }
  const externalMatchIdResult = readOptionalString(value.externalMatchId, "externalMatchId");
  if (!externalMatchIdResult.success) {
    return externalMatchIdResult;
  }
  return success({
    ...baseResult.data,
    ...(externalMatchIdResult.data === undefined ? {} : {
      externalMatchId: externalMatchIdResult.data
    })
  });
};
export const validateHistoryIngestMatchRequest = (value: unknown): ValidationResult<HistoryIngestMatchRequest> => {
  const adminResult = validateAdminImportCompletedMatchRequest(value);
  if (!adminResult.success) {
    return adminResult;
  }
  if (!isRecord(value)) {
    return failure(["payload must be an object"]);
  }
  const externalMatchIdResult = readRequiredString(value.externalMatchId, "externalMatchId");
  if (!externalMatchIdResult.success) {
    return externalMatchIdResult;
  }
  return success({
    ...adminResult.data,
    externalMatchId: externalMatchIdResult.data
  });
};

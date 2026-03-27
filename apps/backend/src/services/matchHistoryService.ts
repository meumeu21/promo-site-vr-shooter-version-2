import type { PoolClient } from "pg";
import { ConflictError, NotFoundError, ValidationError } from "../errors/httpError";
import { pool } from "../db/pool";
import type { HistoryIngestMatchRequest, HistoryMatchListFilters, HistoryMatchListItem, ImportCompletedMatchRequest, MatchClub, MatchDetail, MatchPlayerStats, MatchTeam, MatchTeamResult, MatchTeamSide, MatchTeamSummary, PaginatedHistoryMatchesResponse } from "../types";
import { logInfo, logWarn } from "../utils/logger";
interface PgConflictErrorLike {
  code?: string;
  constraint?: string;
}
interface MatchListRow {
  id: string;
  externalMatchId: string | null;
  clubId: string;
  clubSlug: string;
  clubName: string;
  clubAddress: string;
  map: string;
  mode: string;
  bestOf: number;
  playedAt: string;
  totalCount: string;
  teamId: string;
  teamSide: MatchTeamSide;
  teamName: string;
  teamScore: number;
  teamResult: MatchTeamResult;
}
interface MatchDetailRow {
  id: string;
  externalMatchId: string | null;
  clubId: string;
  clubSlug: string;
  clubName: string;
  clubAddress: string;
  map: string;
  mode: string;
  bestOf: number;
  playedAt: string;
  teamId: string;
  teamSide: MatchTeamSide;
  teamName: string;
  teamScore: number;
  teamResult: MatchTeamResult;
  playerStatsId: string;
  playerId: string | null;
  nickname: string;
  kills: number;
  deaths: number;
  assists: number;
}
interface ImportCompletedMatchOptions {
  source?: "admin" | "mock-server" | "seed";
}
export interface IngestCompletedMatchResult {
  match: MatchDetail;
  imported: boolean;
}
const DEFAULT_LIST_LIMIT = 20;
const DEFAULT_LIST_OFFSET = 0;
const teamSideWeight = (side: MatchTeamSide): number => side === "home" ? 0 : 1;
const calculateKda = (kills: number, deaths: number, assists: number): number => {
  return Number((kills / Math.max(deaths, 1)).toFixed(2));
};
const summarizeTeams = <T extends {
  side: MatchTeamSide;
},>(teams: T[]): T[] => {
  return [...teams].sort((left, right) => teamSideWeight(left.side) - teamSideWeight(right.side));
};
const resolveWinnerTeamId = (teams: Array<{
  id: string;
  result: MatchTeamResult;
}>): string | null => {
  return teams.find(team => team.result === "winner")?.id ?? null;
};
const slugifyClub = (value: string): string => {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || "club";
};
const normalizePublicClubId = (value: string): string => {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || slugifyClub(value);
};
const mapClub = (row: Pick<MatchListRow, "clubId" | "clubSlug" | "clubName" | "clubAddress">): MatchClub => ({
  id: row.clubId,
  slug: row.clubSlug,
  name: row.clubName,
  address: row.clubAddress
});
const mapListRows = (rows: MatchListRow[]): PaginatedHistoryMatchesResponse => {
  const matches = new Map<string, HistoryMatchListItem>();
  const total = rows[0] ? Number(rows[0].totalCount) : 0;
  for (const row of rows) {
    const team: MatchTeamSummary = {
      id: row.teamId,
      side: row.teamSide,
      name: row.teamName,
      score: row.teamScore,
      result: row.teamResult
    };
    const existing = matches.get(row.id);
    if (!existing) {
      matches.set(row.id, {
        id: row.id,
        externalMatchId: row.externalMatchId,
        club: mapClub(row),
        map: row.map,
        mode: row.mode,
        bestOf: row.bestOf,
        playedAt: row.playedAt,
        winnerTeamId: row.teamResult === "winner" ? row.teamId : null,
        teams: [team]
      });
      continue;
    }
    existing.teams.push(team);
    if (row.teamResult === "winner") {
      existing.winnerTeamId = row.teamId;
    }
  }
  return {
    data: [...matches.values()].map(match => {
      const teams: MatchTeamSummary[] = summarizeTeams(match.teams);
      return {
        ...match,
        teams,
        winnerTeamId: resolveWinnerTeamId(teams)
      };
    }),
    meta: {
      total,
      limit: DEFAULT_LIST_LIMIT,
      offset: DEFAULT_LIST_OFFSET
    }
  };
};
const mapDetailRows = (rows: MatchDetailRow[]): MatchDetail => {
  if (rows.length === 0) {
    throw new NotFoundError("Match not found");
  }
  const firstRow = rows[0];
  const teams = new Map<string, MatchTeam>();
  for (const row of rows) {
    const player: MatchPlayerStats = {
      id: row.playerStatsId,
      playerId: row.playerId,
      nickname: row.nickname,
      kills: row.kills,
      deaths: row.deaths,
      assists: row.assists,
      kda: calculateKda(row.kills, row.deaths, row.assists)
    };
    const existingTeam = teams.get(row.teamId);
    if (!existingTeam) {
      teams.set(row.teamId, {
        id: row.teamId,
        side: row.teamSide,
        name: row.teamName,
        score: row.teamScore,
        result: row.teamResult,
        players: [player]
      });
      continue;
    }
    existingTeam.players.push(player);
  }
  const normalizedTeams = summarizeTeams([...teams.values()]).map(team => ({
    ...team,
    players: [...team.players].sort((left, right) => right.kills - left.kills || left.nickname.localeCompare(right.nickname))
  }));
  return {
    id: firstRow.id,
    externalMatchId: firstRow.externalMatchId,
    club: mapClub(firstRow),
    map: firstRow.map,
    mode: firstRow.mode,
    bestOf: firstRow.bestOf,
    playedAt: firstRow.playedAt,
    winnerTeamId: resolveWinnerTeamId(normalizedTeams),
    teams: normalizedTeams
  };
};
const findOrCreateClub = async (client: PoolClient, club: ImportCompletedMatchRequest["club"]): Promise<number> => {
  const clubId = normalizePublicClubId(club.id ?? club.slug ?? club.name);
  const clubSlug = slugifyClub(club.slug ?? club.name);
  const result = await client.query<{
    id: number;
  }>(`INSERT INTO clubs (public_id, slug, name, address)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (public_id) DO UPDATE
       SET slug = EXCLUDED.slug,
           name = EXCLUDED.name,
           address = EXCLUDED.address
     RETURNING id`, [clubId, clubSlug, club.name, club.address]);
  return result.rows[0].id;
};
const findOrCreatePlayer = async (client: PoolClient, player: ImportCompletedMatchRequest["teams"][number]["players"][number]): Promise<number> => {
  if (player.playerId) {
    const result = await client.query<{
      id: number;
    }>(`INSERT INTO players (external_player_id, nickname)
       VALUES ($1, $2)
       ON CONFLICT (external_player_id) DO UPDATE SET nickname = EXCLUDED.nickname
       RETURNING id`, [player.playerId, player.nickname]);
    return result.rows[0].id;
  }
  const inserted = await client.query<{
    id: number;
  }>(`INSERT INTO players (nickname)
     VALUES ($1)
     RETURNING id`, [player.nickname]);
  return inserted.rows[0].id;
};
const isPgUniqueViolation = (error: unknown): error is PgConflictErrorLike => {
  return error instanceof Error && "code" in error && (error as PgConflictErrorLike).code === "23505";
};
const mapImportConflict = (error: PgConflictErrorLike): ConflictError => {
  switch (error.constraint) {
    case "matches_external_match_id_key":
      return new ConflictError("Match with this externalMatchId already exists");
    case "clubs_public_id_key":
      return new ConflictError("Club public id conflicts with an existing club");
    case "clubs_slug_key":
      return new ConflictError("Club slug conflicts with an existing club");
    case "match_teams_match_id_side_key":
      return new ConflictError("Match teams conflict: duplicate team side for the same match");
    case "match_player_stats_match_team_id_player_id_key":
      return new ConflictError("Match player stats conflict: duplicate player in the same team");
    case "players_external_player_id_key":
      return new ConflictError("Player external id conflicts with an existing player");
    default:
      return new ConflictError("Completed match import conflicts with existing history data");
  }
};
const resolveTeamResult = (side: MatchTeamSide, homeScore: number, awayScore: number): MatchTeamResult => {
  if (homeScore === awayScore) {
    return "draw";
  }
  if (side === "home") {
    return homeScore > awayScore ? "winner" : "loser";
  }
  return awayScore > homeScore ? "winner" : "loser";
};
const getMatchDetailByExternalMatchId = async (externalMatchId: string): Promise<MatchDetail | null> => {
  const result = await pool.query<{
    id: string;
  }>(`SELECT id::text AS id
     FROM matches
     WHERE external_match_id = $1
     LIMIT 1`, [externalMatchId]);
  const matchId = result.rows[0]?.id;
  return matchId ? getMatchDetail(matchId) : null;
};
const buildListFilters = (filters: HistoryMatchListFilters): {
  whereSql: string;
  params: Array<string | number>;
} => {
  const conditions: string[] = [];
  const params: Array<string | number> = [];
  if (filters.clubId) {
    params.push(filters.clubId);
    conditions.push(`c.public_id = $${params.length}`);
  }
  if (filters.clubSlug) {
    params.push(filters.clubSlug);
    conditions.push(`c.slug = $${params.length}`);
  }
  if (filters.from) {
    params.push(filters.from);
    conditions.push(`m.played_at >= $${params.length}::timestamptz`);
  }
  if (filters.to) {
    params.push(filters.to);
    conditions.push(`m.played_at < ($${params.length}::timestamptz + interval '1 day')`);
  }
  return {
    whereSql: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    params
  };
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
const DEFAULT_CLUB_LIMIT = 5;
const DEFAULT_MATCH_LIMIT = 5;
export const listGroupedHistoryMatches = async (filters: {
  clubLimit?: number;
  clubOffset?: number;
  matchLimit?: number;
  from?: string;
  to?: string;
  clubId?: string;
  clubSlug?: string;
} = {}): Promise<PaginatedGroupedHistoryMatchesResponse> => {
  const clubLimit = filters.clubLimit ?? DEFAULT_CLUB_LIMIT;
  const clubOffset = filters.clubOffset ?? 0;
  const matchLimit = filters.matchLimit ?? DEFAULT_MATCH_LIMIT;
  const {
    whereSql,
    params
  } = buildListFilters({
    from: filters.from,
    to: filters.to,
    clubId: filters.clubId,
    clubSlug: filters.clubSlug
  });
  const clubsResult = await pool.query<{
    id: string;
    slug: string;
    name: string;
    address: string;
    totalClubs: string;
  }>(`WITH club_stats AS (
       SELECT
         c.public_id AS id,
         c.slug,
         c.name,
         c.address,
         MAX(m.played_at) as last_match_at,
         COUNT(*) OVER() AS total_clubs
       FROM clubs c
       INNER JOIN matches m ON m.club_id = c.id
       ${whereSql}
       GROUP BY c.public_id, c.slug, c.name, c.address
     )
     SELECT * FROM club_stats
     ORDER BY last_match_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, clubLimit, clubOffset]);
  const totalClubs = clubsResult.rows[0] ? Number(clubsResult.rows[0].totalClubs) : 0;
  const groupedData: GroupedHistoryMatches[] = [];
  for (const clubRow of clubsResult.rows) {
    const matchesResult = await listHistoryMatches({
      clubId: clubRow.id,
      from: filters.from,
      to: filters.to,
      limit: matchLimit + 1,
      offset: 0
    });
    const hasMoreMatches = matchesResult.data.length > matchLimit;
    const matches = matchesResult.data.slice(0, matchLimit);
    groupedData.push({
      club: {
        id: clubRow.id,
        slug: clubRow.slug,
        name: clubRow.name,
        address: clubRow.address
      },
      matches,
      hasMoreMatches,
      totalMatches: matchesResult.meta.total
    });
  }
  return {
    data: groupedData,
    meta: {
      totalClubs,
      clubLimit,
      clubOffset
    }
  };
};
export const listHistoryMatches = async (filters: HistoryMatchListFilters = {}): Promise<PaginatedHistoryMatchesResponse> => {
  const limit = filters.limit ?? DEFAULT_LIST_LIMIT;
  const offset = filters.offset ?? DEFAULT_LIST_OFFSET;
  const {
    whereSql,
    params
  } = buildListFilters(filters);
  const limitParamIndex = params.length + 1;
  const offsetParamIndex = params.length + 2;
  const result = await pool.query<MatchListRow>(`WITH filtered_matches AS (
       SELECT
         m.id,
         m.external_match_id,
         m.map,
         m.mode,
         m.best_of,
         m.played_at,
         c.public_id,
         c.slug,
         c.name,
         c.address,
         COUNT(*) OVER() AS total_count
       FROM matches m
       INNER JOIN clubs c ON c.id = m.club_id
       ${whereSql}
       ORDER BY m.played_at DESC, m.id DESC
       LIMIT $${limitParamIndex}
       OFFSET $${offsetParamIndex}
     )
     SELECT
       fm.id::text AS id,
       fm.external_match_id AS "externalMatchId",
       fm.public_id AS "clubId",
       fm.slug AS "clubSlug",
       fm.name AS "clubName",
       fm.address AS "clubAddress",
       fm.map,
       fm.mode,
       fm.best_of AS "bestOf",
       fm.played_at AS "playedAt",
       fm.total_count::text AS "totalCount",
       mt.id::text AS "teamId",
       mt.side AS "teamSide",
       mt.name AS "teamName",
       mt.score AS "teamScore",
       mt.result AS "teamResult"
     FROM filtered_matches fm
     INNER JOIN match_teams mt ON mt.match_id = fm.id
     ORDER BY fm.played_at DESC, fm.id DESC, CASE WHEN mt.side = 'home' THEN 0 ELSE 1 END ASC`, [...params, limit, offset]);
  const mapped = mapListRows(result.rows);
  return {
    data: mapped.data,
    meta: {
      total: mapped.meta.total,
      limit,
      offset
    }
  };
};
export const getMatchDetail = async (matchId: string): Promise<MatchDetail> => {
  const result = await pool.query<MatchDetailRow>(`SELECT
       m.id::text AS id,
       m.external_match_id AS "externalMatchId",
       c.public_id AS "clubId",
       c.slug AS "clubSlug",
       c.name AS "clubName",
       c.address AS "clubAddress",
       m.map,
       m.mode,
       m.best_of AS "bestOf",
       m.played_at AS "playedAt",
       mt.id::text AS "teamId",
       mt.side AS "teamSide",
       mt.name AS "teamName",
       mt.score AS "teamScore",
       mt.result AS "teamResult",
       mps.id::text AS "playerStatsId",
       p.external_player_id AS "playerId",
       p.nickname,
       mps.kills,
       mps.deaths,
       mps.assists
     FROM matches m
     INNER JOIN clubs c ON c.id = m.club_id
     INNER JOIN match_teams mt ON mt.match_id = m.id
     INNER JOIN match_player_stats mps ON mps.match_team_id = mt.id
     INNER JOIN players p ON p.id = mps.player_id
     WHERE m.id = $1::bigint
     ORDER BY CASE WHEN mt.side = 'home' THEN 0 ELSE 1 END ASC, mps.kills DESC, p.nickname ASC`, [matchId]);
  return mapDetailRows(result.rows);
};
export const importCompletedMatch = async (payload: ImportCompletedMatchRequest, options: ImportCompletedMatchOptions = {}): Promise<MatchDetail> => {
  const client = await pool.connect();
  const source = options.source ?? "admin";
  try {
    await client.query("BEGIN");
    const clubId = await findOrCreateClub(client, payload.club);
    const matchResult = await client.query<{
      id: number;
    }>(`INSERT INTO matches (external_match_id, club_id, map, mode, best_of, played_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`, [payload.externalMatchId ?? null, clubId, payload.map, payload.mode, payload.bestOf, payload.playedAt]);
    const matchId = matchResult.rows[0].id;
    const homeTeam = payload.teams.find((team: ImportCompletedMatchRequest["teams"][number]) => team.side === "home");
    const awayTeam = payload.teams.find((team: ImportCompletedMatchRequest["teams"][number]) => team.side === "away");
    const homeScore = homeTeam?.score ?? 0;
    const awayScore = awayTeam?.score ?? 0;
    for (const team of payload.teams) {
      const teamResult = resolveTeamResult(team.side, homeScore, awayScore);
      const insertedTeam = await client.query<{
        id: number;
      }>(`INSERT INTO match_teams (match_id, side, name, score, result)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`, [matchId, team.side, team.name, team.score, teamResult]);
      const matchTeamId = insertedTeam.rows[0].id;
      for (const player of team.players) {
        const playerDbId = await findOrCreatePlayer(client, player);
        await client.query(`INSERT INTO match_player_stats (match_team_id, player_id, kills, deaths, assists)
           VALUES ($1, $2, $3, $4, $5)`, [matchTeamId, playerDbId, player.kills, player.deaths, player.assists]);
      }
    }
    await client.query("COMMIT");
    logInfo("match_imported", "Completed match imported", {
      source,
      matchId,
      externalMatchId: payload.externalMatchId ?? null,
      clubId: payload.club.id ?? null,
      clubSlug: payload.club.slug ?? null,
      clubName: payload.club.name,
      teamCount: payload.teams.length,
      playerCount: payload.teams.reduce((total: number, team: ImportCompletedMatchRequest["teams"][number]) => total + team.players.length, 0)
    });
    return await getMatchDetail(String(matchId));
  } catch (error) {
    await client.query("ROLLBACK");
    if (isPgUniqueViolation(error)) {
      throw mapImportConflict(error);
    }
    throw error;
  } finally {
    client.release();
  }
};
export const ingestCompletedMatch = async (payload: HistoryIngestMatchRequest): Promise<IngestCompletedMatchResult> => {
  const externalMatchId = payload.externalMatchId.trim();
  if (!externalMatchId) {
    throw new ValidationError("externalMatchId is required for ingest");
  }
  const existingMatch = await getMatchDetailByExternalMatchId(externalMatchId);
  if (existingMatch) {
    logInfo("match_ingest_deduplicated", "Duplicate completed match skipped", {
      externalMatchId,
      matchId: existingMatch.id,
      clubId: payload.club.id ?? null,
      clubSlug: payload.club.slug ?? null,
      clubName: payload.club.name
    });
    return {
      match: existingMatch,
      imported: false
    };
  }
  try {
    const match = await importCompletedMatch(payload, {
      source: "mock-server"
    });
    return {
      match,
      imported: true
    };
  } catch (error) {
    if (error instanceof ConflictError) {
      const deduplicatedMatch = await getMatchDetailByExternalMatchId(externalMatchId);
      if (deduplicatedMatch) {
        logWarn("match_ingest_race_deduplicated", "Concurrent duplicate ingest resolved to existing match", {
          externalMatchId,
          matchId: deduplicatedMatch.id
        });
        return {
          match: deduplicatedMatch,
          imported: false
        };
      }
    }
    throw error;
  }
};

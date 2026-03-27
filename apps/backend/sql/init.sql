-- FILE: apps/backend/sql/init.sql
-- VERSION: 1.3.0
-- START_MODULE_CONTRACT
--   PURPOSE: Bootstraps the canonical PostgreSQL schema for history-first match persistence.
--   SCOPE:
--     - Defines relational tables, constraints, and indexes for clubs, players, matches, teams, and player stats.
--     - Serves as the schema bootstrap source executed by the backend migration entrypoint.
--     - Preserves seed-compatible defaults and relational ownership expected by backend operational scripts and services.
--     - Does not perform data backfill, fixture insertion, or runtime migration orchestration by itself.
--   INPUTS:
--     - execution context: PostgreSQL session invoked by the backend migration runner.
--   OUTPUTS:
--     - side effects: creates or updates persistent schema objects when they do not already exist.
--   DEPENDS: M-DB, PostgreSQL, apps/backend/src/db/migrate.ts
--   LINKS: M-DB, M-BACKEND, file-init-sql, file-db-migrate
--   FAILURE_MODES:
--     - PostgreSQL rejects DDL because of syntax, permissions, or incompatible existing objects.
--     - Migration execution stops before the full schema contour is materialized.
--   IDEMPOTENCY: DDL is designed for repeated execution through IF NOT EXISTS guards on tables and indexes.
--   SAFETY_GUARDS:
--     - Uses IF NOT EXISTS for table and index creation to reduce duplicate-object failures.
--     - Keeps history storage blocks explicit for reviewer navigation and operational auditability.
-- END_MODULE_CONTRACT
--
-- START_MODULE_MAP
--   schema bootstrap — canonical DDL for matches, teams, players, clubs, and supporting indexes
-- END_MODULE_MAP
--
-- START_CHANGE_SUMMARY
--   LAST_CHANGE: [v1.3.0] — удалены booking/partner request tables и индексы; сохранена history-first schema.
-- END_CHANGE_SUMMARY

-- START_BLOCK_HISTORY_STORAGE_SCHEMA
CREATE TABLE IF NOT EXISTS clubs (
  id BIGSERIAL PRIMARY KEY,
  public_id TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS players (
  id BIGSERIAL PRIMARY KEY,
  external_player_id TEXT UNIQUE,
  nickname TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
  id BIGSERIAL PRIMARY KEY,
  external_match_id TEXT UNIQUE,
  club_id BIGINT NOT NULL REFERENCES clubs(id) ON DELETE RESTRICT,
  map TEXT NOT NULL,
  mode TEXT NOT NULL,
  best_of INTEGER NOT NULL CHECK (best_of >= 1),
  played_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_teams (
  id BIGSERIAL PRIMARY KEY,
  match_id BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  side TEXT NOT NULL CHECK (side IN ('home', 'away')),
  name TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  result TEXT NOT NULL CHECK (result IN ('winner', 'loser', 'draw')),
  UNIQUE (match_id, side)
);

CREATE TABLE IF NOT EXISTS match_player_stats (
  id BIGSERIAL PRIMARY KEY,
  match_team_id BIGINT NOT NULL REFERENCES match_teams(id) ON DELETE CASCADE,
  player_id BIGINT NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
  kills INTEGER NOT NULL CHECK (kills >= 0),
  deaths INTEGER NOT NULL CHECK (deaths >= 0),
  assists INTEGER NOT NULL CHECK (assists >= 0),
  UNIQUE (match_team_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_played_at ON matches(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_club_id ON matches(club_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_teams_match_id ON match_teams(match_id);
CREATE INDEX IF NOT EXISTS idx_match_player_stats_match_team_id ON match_player_stats(match_team_id);
CREATE INDEX IF NOT EXISTS idx_players_external_player_id ON players(external_player_id);
CREATE INDEX IF NOT EXISTS idx_clubs_public_id ON clubs(public_id);
CREATE INDEX IF NOT EXISTS idx_clubs_slug ON clubs(slug);
-- END_BLOCK_HISTORY_STORAGE_SCHEMA

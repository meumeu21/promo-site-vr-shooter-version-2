import type { HistoryIngestMatchRequest, ImportMatchClubInput } from "@packages/shared";
export interface FixtureBlueprint {
  club: ImportMatchClubInput;
  map: string;
  mode: string;
  bestOf: number;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
}
export interface PublisherState {
  running: boolean;
  intervalMs: number;
  fixtureSet: string;
  totalFixtures: number;
  sentCount: number;
  nextIndex: number;
  lastPublishedAt: string | null;
  lastPublishedExternalMatchId: string | null;
  lastResult: "imported" | "duplicate" | "error" | null;
  lastError: string | null;
}
export interface PublishResponse {
  ok: boolean;
  status: number;
  imported: boolean;
  payload: unknown;
}
export type MatchFixture = HistoryIngestMatchRequest;

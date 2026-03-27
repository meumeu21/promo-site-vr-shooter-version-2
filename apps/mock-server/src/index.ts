import dotenv from "dotenv";
import express from "express";
import type { Express, Request } from "express";
import path from "node:path";
import type { ImportMatchClubInput } from "@packages/shared";
import type { FixtureBlueprint, MatchFixture, PublishResponse, PublisherState } from "./types";
const SERVICE_NAME = "mock-server";
const INVALID_CONFIGURATION_EXIT_CODE = 2;
const DEPENDENCY_UNAVAILABLE_EXIT_CODE = 3;
const STARTUP_FAILURE_EXIT_CODE = 1;
type MockServerFailureKind = "invalid-configuration" | "dependency-unavailable" | "unexpected-failure";
type MockServerFailure = Error & {
  kind: MockServerFailureKind;
};
type RuntimeConfig = {
  port: number;
  backendHistoryIngestUrl: string;
  historyIngestToken: string;
  publishIntervalMs: number;
  autoStart: boolean;
  controlToken: string | null;
  fixtureSet: string;
  fixtureCount: number;
  fixtureSeed: string;
};
type PublishNextResult = {
  ok: true;
} | {
  ok: false;
  error: string;
};
const sanitizePublishError = (): string => "publish failed";
const toPublicPublisherState = (state: PublisherState): PublisherState => {
  if (state.lastError === null) {
    return {
      ...state
    };
  }
  return {
    ...state,
    lastError: sanitizePublishError()
  };
};
const isMockServerFailure = (error: unknown): error is MockServerFailure => {
  return error instanceof Error && "kind" in error && typeof (error as {
    kind?: unknown;
  }).kind === "string";
};
const createMockServerFailure = (kind: MockServerFailureKind, message: string): MockServerFailure => {
  const error = new Error(message) as MockServerFailure;
  error.kind = kind;
  return error;
};
const envFilePath = process.env.ENV_FILE?.trim();
dotenv.config(envFilePath ? {
  path: path.resolve(process.cwd(), envFilePath)
} : undefined);
const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (!value) {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
};
const requireEnv = (value: string | undefined, name: string): string => {
  if (!value?.trim()) {
    throw createMockServerFailure("invalid-configuration", `${name} is required`);
  }
  return value.trim();
};
const loadRuntimeConfig = (env: NodeJS.ProcessEnv): RuntimeConfig => {
  return {
    port: toNumber(env.PORT, 5001),
    backendHistoryIngestUrl: requireEnv(env.BACKEND_HISTORY_INGEST_URL, "BACKEND_HISTORY_INGEST_URL"),
    historyIngestToken: requireEnv(env.HISTORY_INGEST_TOKEN, "HISTORY_INGEST_TOKEN"),
    publishIntervalMs: toNumber(env.PUBLISH_INTERVAL_MS, 15_000),
    autoStart: toBoolean(env.AUTO_START, false),
    controlToken: env.CONTROL_TOKEN?.trim() || null,
    fixtureSet: env.FIXTURE_SET?.trim() || "default",
    fixtureCount: toNumber(env.FIXTURE_COUNT, 24),
    fixtureSeed: env.FIXTURE_SEED?.trim() || "default-seed"
  };
};
const validateRuntime = (config: RuntimeConfig): void => {
  if (!Number.isInteger(config.port) || config.port <= 0) {
    throw createMockServerFailure("invalid-configuration", "PORT must resolve to a positive integer");
  }
  try {
    new URL(config.backendHistoryIngestUrl);
  } catch {
    throw createMockServerFailure("invalid-configuration", "BACKEND_HISTORY_INGEST_URL must be a valid absolute URL");
  }
  if (typeof fetch !== "function") {
    throw createMockServerFailure("dependency-unavailable", "Global fetch API is not available in the current runtime");
  }
};
const runPrechecks = (config: RuntimeConfig): void => {
  void config;
};
const getHeaderValue = (value: string | string[] | undefined): string | null => {
  if (Array.isArray(value)) {
    return value[0]?.trim() || null;
  }
  return value?.trim() || null;
};
const isAuthorizedControlRequest = (request: Request, controlToken: string | null): {
  ok: true;
  mode: "token";
} | {
  ok: false;
  reason: string;
} => {
  if (!controlToken) {
    return {
      ok: false,
      reason: "control token is not configured"
    };
  }
  const bearerToken = getHeaderValue(request.headers.authorization)?.replace(/^Bearer\s+/i, "").trim() || null;
  const headerToken = getHeaderValue(request.headers["x-mock-control-token"]);
  const requestToken = bearerToken || headerToken;
  if (requestToken === controlToken) {
    return {
      ok: true,
      mode: "token"
    };
  }
  return {
    ok: false,
    reason: "missing or invalid control token"
  };
};
const rejectUnauthorizedAccess = (req: Request, res: express.Response, authorization: {
  ok: false;
  reason: string;
}): void => {
  log("WARN", "control_rejected", "Mock control request rejected", {
    path: req.path,
    method: req.method,
    reason: authorization.reason,
    ip: req.ip,
    remoteAddress: req.socket.remoteAddress ?? null
  });
  res.status(403).json({
    error: "Control plane access denied"
  });
};
const requireAuthorizedAccess = (req: Request, res: express.Response, next: express.NextFunction, authorization: {
  ok: true;
  mode: "token";
} | {
  ok: false;
  reason: string;
}): void => {
  if (authorization.ok) {
    log("INFO", "control_authorized", "Mock control request accepted", {
      path: req.path,
      method: req.method,
      mode: authorization.mode
    });
    next();
    return;
  }
  rejectUnauthorizedAccess(req, res, authorization);
};
const log = (level: "INFO" | "WARN" | "ERROR", event: string, message: string, meta?: Record<string, unknown>): void => {
  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    service: SERVICE_NAME,
    event,
    message,
    meta
  });
  if (level === "ERROR") {
    console.error(payload);
    return;
  }
  console.log(payload);
};
type FixturePreset = "default" | "competitive" | "expanded";
type ScorePattern = {
  homeScore: number;
  awayScore: number;
};
type FixtureGenerationProfile = {
  clubPool: ImportMatchClubInput[];
  mapPool: string[];
  modePool: string[];
  bestOfPool: number[];
  teamPool: string[];
  nicknamePool: string[];
  scorePatterns: ScorePattern[];
  rosterSizePool: number[];
};
const CLUB_POOL: ImportMatchClubInput[] = [{
  id: "arena-prime",
  slug: "arena-prime",
  name: "Arena Prime",
  address: "Москва, ул. Тверская, 18"
}, {
  id: "cyber-loft",
  slug: "cyber-loft",
  name: "Cyber Loft",
  address: "Санкт-Петербург, Лиговский проспект, 74"
}, {
  id: "vr-dominion",
  slug: "vr-dominion",
  name: "VR Dominion",
  address: "Санкт-Петербург, Невский проспект, 110"
}, {
  id: "gg-point",
  slug: "gg-point",
  name: "GG Point",
  address: "Казань, ул. Баумана, 51"
}, {
  id: "pulse-hangar",
  slug: "pulse-hangar",
  name: "Pulse Hangar",
  address: "Екатеринбург, ул. Малышева, 36"
}, {
  id: "nova-station",
  slug: "nova-station",
  name: "Nova Station",
  address: "Новосибирск, Красный проспект, 21"
}, {
  id: "respawn-factory",
  slug: "respawn-factory",
  name: "Respawn Factory",
  address: "Нижний Новгород, ул. Большая Покровская, 19"
}, {
  id: "frag-district",
  slug: "frag-district",
  name: "Frag District",
  address: "Самара, Московское шоссе, 41"
}, {
  id: "orbit-arena",
  slug: "orbit-arena",
  name: "Orbit Arena",
  address: "Ростов-на-Дону, Будённовский проспект, 59"
}, {
  id: "byte-bunker",
  slug: "byte-bunker",
  name: "Byte Bunker",
  address: "Краснодар, ул. Красная, 88"
}, {
  id: "glitch-garage",
  slug: "glitch-garage",
  name: "Glitch Garage",
  address: "Воронеж, ул. Плехановская, 23"
}, {
  id: "shadow-lab",
  slug: "shadow-lab",
  name: "Shadow Lab",
  address: "Пермь, ул. Ленина, 45"
}];
const DEFAULT_MAP_POOL = ["de_mirage", "de_inferno", "de_nuke", "de_overpass", "de_ancient", "de_train"];
const EXPANDED_MAP_POOL = [...DEFAULT_MAP_POOL, "de_dust2", "de_vertigo", "de_anubis", "de_cache", "de_cbble", "de_tuscan"];
const DEFAULT_MODE_POOL = ["competitive", "bomb-defuse", "team-deathmatch"];
const EXPANDED_MODE_POOL = [...DEFAULT_MODE_POOL, "wingman", "elimination", "control", "domination", "vip-escort"];
const COMPETITIVE_MODE_POOL = ["competitive"];
const TEAM_POOL = ["Night Raid", "Vector", "Pulse Core", "Northwind", "Quantum", "Signal", "Afterlight", "Aurora", "Zero Risk", "Orbit", "Forge", "Shadow Pulse", "Ion Wolves", "Crimson Sector", "Steel Echo", "Nova Unit", "Ghostline", "Titan Grid", "Delta Syndicate", "Iron Horizon", "Binary Storm", "Red Shift", "Silent Protocol", "Echo Division", "Phantom Array", "Blue Vortex", "Gamma Crew", "Black Comets", "Storm Ledger", "Chrome Falcons", "Rogue Circuit", "Firelink"];
const NICKNAME_POOL = ["Axe", "Nova", "Ghost", "Blaze", "Viper", "Pixel", "Rift", "Drift", "Hex", "Comet", "Flux", "Frost", "Trace", "Bolt", "Reaper", "Echo", "Pulse", "Onyx", "Cipher", "Kite", "Raven", "Mantis", "Quartz", "Zephyr", "Jinx", "Talon", "Proxy", "Glitch", "VectorX", "Shard", "Mako", "Skylark", "Nyx", "Rogue"];
const DEFAULT_SCORE_PATTERNS: ScorePattern[] = [{
  homeScore: 13,
  awayScore: 9
}, {
  homeScore: 16,
  awayScore: 12
}, {
  homeScore: 16,
  awayScore: 14
}, {
  homeScore: 13,
  awayScore: 10
}, {
  homeScore: 27,
  awayScore: 23
}, {
  homeScore: 11,
  awayScore: 11
}, {
  homeScore: 15,
  awayScore: 13
}, {
  homeScore: 16,
  awayScore: 8
}, {
  homeScore: 12,
  awayScore: 6
}, {
  homeScore: 21,
  awayScore: 19
}, {
  homeScore: 19,
  awayScore: 17
}, {
  homeScore: 22,
  awayScore: 20
}, {
  homeScore: 9,
  awayScore: 13
}, {
  homeScore: 8,
  awayScore: 16
}, {
  homeScore: 14,
  awayScore: 16
}, {
  homeScore: 25,
  awayScore: 21
}, {
  homeScore: 18,
  awayScore: 16
}, {
  homeScore: 7,
  awayScore: 12
}, {
  homeScore: 17,
  awayScore: 19
}, {
  homeScore: 20,
  awayScore: 22
}, {
  homeScore: 16,
  awayScore: 14
}, {
  homeScore: 13,
  awayScore: 13
}];
const getFixtureGenerationProfile = (fixtureSet: string): FixtureGenerationProfile => {
  const normalized = fixtureSet.toLowerCase() as FixturePreset;
  if (normalized === "competitive") {
    return {
      clubPool: CLUB_POOL,
      mapPool: DEFAULT_MAP_POOL,
      modePool: COMPETITIVE_MODE_POOL,
      bestOfPool: [1, 3, 3, 5],
      teamPool: TEAM_POOL,
      nicknamePool: NICKNAME_POOL,
      scorePatterns: DEFAULT_SCORE_PATTERNS.filter(pattern => Math.max(pattern.homeScore, pattern.awayScore) >= 13),
      rosterSizePool: [2, 2, 3]
    };
  }
  if (normalized === "expanded") {
    return {
      clubPool: CLUB_POOL,
      mapPool: EXPANDED_MAP_POOL,
      modePool: EXPANDED_MODE_POOL,
      bestOfPool: [1, 1, 3, 3, 5, 5],
      teamPool: TEAM_POOL,
      nicknamePool: NICKNAME_POOL,
      scorePatterns: DEFAULT_SCORE_PATTERNS,
      rosterSizePool: [2, 3, 3, 4, 5]
    };
  }
  return {
    clubPool: CLUB_POOL.slice(0, 6),
    mapPool: DEFAULT_MAP_POOL,
    modePool: DEFAULT_MODE_POOL,
    bestOfPool: [1, 1, 3, 3],
    teamPool: TEAM_POOL.slice(0, 16),
    nicknamePool: NICKNAME_POOL.slice(0, 18),
    scorePatterns: DEFAULT_SCORE_PATTERNS.slice(0, 12),
    rosterSizePool: [2, 2, 3, 4]
  };
};
const createSeededRandom = (seed: string): (() => number) => {
  let state = 0;
  for (let index = 0; index < seed.length; index += 1) {
    state = state * 31 + seed.charCodeAt(index) >>> 0;
  }
  if (state === 0) {
    state = 0x6d2b79f5;
  }
  return () => {
    state = state + 0x6d2b79f5 >>> 0;
    let mixed = Math.imul(state ^ state >>> 15, 1 | state);
    mixed ^= mixed + Math.imul(mixed ^ mixed >>> 7, 61 | mixed);
    return ((mixed ^ mixed >>> 14) >>> 0) / 4294967296;
  };
};
const pickOne = <T,>(items: T[], random: () => number): T => {
  const index = Math.floor(random() * items.length);
  return items[index] as T;
};
const buildPlayedAt = (index: number, random: () => number): string => {
  const basePlayedAt = Date.now() + index * 3_600_000 + random() * 3_600_000;
  const spacingHours = 2 + Math.floor(random() * 4);
  const spacingMs = spacingHours * 3_600_000;
  return new Date(basePlayedAt - index * spacingMs).toISOString();
};
const buildPlayerStats = (side: "home" | "away", suffix: string, playerSlot: number, teamScore: number, random: () => number, nicknamePool: string[]) => {
  const nicknameRoot = pickOne(nicknamePool, random);
  const nicknameDecorators = ["X", "77", "Prime", "VR", "K", "Zero", "Q", "Shadow", "Ghost", "Nova", "Blaze", "Viper", "Pixel", "Rift", "Drift", "Hex", "Comet", "Flux", "Frost", "Trace"];
  const nicknameDecorator = pickOne(nicknameDecorators, random);
  const scoreBias = Math.max(0, teamScore - 8);
  const kills = Math.max(5, scoreBias + 5 + Math.floor(random() * 16) + playerSlot);
  const deaths = Math.max(3, Math.floor(teamScore / 3) + Math.floor(random() * 9) + Math.max(0, playerSlot - 1));
  const assists = Math.max(0, Math.floor(random() * 12) + playerSlot % 4);
  return {
    playerId: `${side}-${suffix}-${playerSlot}`,
    nickname: `${nicknameRoot}${nicknameDecorator}-${suffix}-${playerSlot}`,
    kills,
    deaths,
    assists
  };
};
const buildFixtureBlueprints = (fixtureSet: string, fixtureCount: number, fixtureSeed: string): FixtureBlueprint[] => {
  const profile = getFixtureGenerationProfile(fixtureSet);
  const random = createSeededRandom(`${fixtureSet}:${fixtureCount}:${fixtureSeed}`);
  return Array.from({
    length: fixtureCount
  }, (_, index) => {
    const club = profile.clubPool[index % profile.clubPool.length] as ImportMatchClubInput;
    const map = profile.mapPool[(index + Math.floor(random() * profile.mapPool.length)) % profile.mapPool.length] as string;
    const mode = profile.modePool[(index + Math.floor(random() * profile.modePool.length)) % profile.modePool.length] as string;
    const bestOf = pickOne(profile.bestOfPool, random);
    const firstTeamIndex = (index + Math.floor(random() * profile.teamPool.length)) % profile.teamPool.length;
    const secondTeamIndex = (firstTeamIndex + 1 + Math.floor(random() * (profile.teamPool.length - 1))) % profile.teamPool.length;
    const scorePattern = profile.scorePatterns[(index + Math.floor(random() * profile.scorePatterns.length)) % profile.scorePatterns.length] as ScorePattern;
    const shouldFlipScore = random() >= 0.5;
    return {
      club,
      map,
      mode,
      bestOf,
      home: profile.teamPool[firstTeamIndex] as string,
      away: profile.teamPool[secondTeamIndex] as string,
      homeScore: shouldFlipScore ? scorePattern.awayScore : scorePattern.homeScore,
      awayScore: shouldFlipScore ? scorePattern.homeScore : scorePattern.awayScore
    };
  });
};
const buildFixtures = (config: RuntimeConfig): MatchFixture[] => {
  const fixturesBlueprint = buildFixtureBlueprints(config.fixtureSet, config.fixtureCount, config.fixtureSeed);
  const profile = getFixtureGenerationProfile(config.fixtureSet);
  const random = createSeededRandom(`players:${config.fixtureSet}:${config.fixtureCount}:${config.fixtureSeed}`);
  return fixturesBlueprint.map((fixture, index) => {
    const suffix = String(index + 1).padStart(4, "0");
    const playedAt = buildPlayedAt(index, random);
    const homeRosterSize = pickOne(profile.rosterSizePool, random);
    const awayRosterSize = pickOne(profile.rosterSizePool, random);
    return {
      externalMatchId: `history-mock-${config.fixtureSet}-${suffix}`,
      club: fixture.club,
      map: fixture.map,
      mode: fixture.mode,
      bestOf: fixture.bestOf,
      playedAt,
      teams: [{
        side: "home",
        name: fixture.home,
        score: fixture.homeScore,
        players: Array.from({
          length: homeRosterSize
        }, (_, playerIndex) => buildPlayerStats("home", suffix, playerIndex + 1, fixture.homeScore, random, profile.nicknamePool))
      }, {
        side: "away",
        name: fixture.away,
        score: fixture.awayScore,
        players: Array.from({
          length: awayRosterSize
        }, (_, playerIndex) => buildPlayerStats("away", suffix, playerIndex + 1, fixture.awayScore, random, profile.nicknamePool))
      }]
    };
  });
};
class HistoryPublisher {
  private readonly fixtures: MatchFixture[];
  private readonly publishedExternalMatchIds = new Set<string>();
  private timer: NodeJS.Timeout | null = null;
  private readonly state: PublisherState;
  constructor(private readonly config: RuntimeConfig) {
    this.fixtures = buildFixtures(config);
    this.state = {
      running: false,
      intervalMs: config.publishIntervalMs,
      fixtureSet: config.fixtureSet,
      totalFixtures: this.fixtures.length,
      sentCount: 0,
      nextIndex: 0,
      lastPublishedAt: null,
      lastPublishedExternalMatchId: null,
      lastResult: null,
      lastError: null
    };
  }
  getState(): PublisherState {
    return {
      ...this.state
    };
  }
  getFixtures(): MatchFixture[] {
    return this.fixtures.map(fixture => ({
      ...fixture,
      teams: [{
        ...fixture.teams[0],
        players: fixture.teams[0].players.map(player => ({
          ...player
        }))
      }, {
        ...fixture.teams[1],
        players: fixture.teams[1].players.map(player => ({
          ...player
        }))
      }]
    }));
  }
  start(): void {
    if (this.state.running) {
      return;
    }
    this.state.running = true;
    this.timer = setInterval(() => {
      void this.publishNext();
    }, this.state.intervalMs);
    void this.publishNext();
    log("INFO", "publisher_start", "History publisher started", {
      intervalMs: this.state.intervalMs,
      totalFixtures: this.fixtures.length,
      fixtureSet: this.state.fixtureSet,
      fixtureSeed: this.config.fixtureSeed
    });
  }
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.state.running = false;
    log("INFO", "publisher_stop", "History publisher stopped", {
      sentCount: this.state.sentCount,
      fixtureSet: this.state.fixtureSet
    });
  }
  async publishNext(): Promise<PublishNextResult> {
    const fixture = this.fixtures[this.state.nextIndex];
    if (!fixture) {
      this.stop();
      return {
        ok: true
      };
    }
    if (this.publishedExternalMatchIds.has(fixture.externalMatchId)) {
      this.state.nextIndex += 1;
      log("WARN", "publisher_skip_duplicate", "Fixture already published in current cycle", {
        externalMatchId: fixture.externalMatchId,
        nextIndex: this.state.nextIndex
      });
      return {
        ok: true
      };
    }
    try {
      const response = await this.sendFixture(fixture);
      this.publishedExternalMatchIds.add(fixture.externalMatchId);
      this.state.sentCount += 1;
      this.state.nextIndex += 1;
      this.state.lastPublishedAt = new Date().toISOString();
      this.state.lastPublishedExternalMatchId = fixture.externalMatchId;
      this.state.lastResult = response.imported ? "imported" : "duplicate";
      this.state.lastError = null;
      log("INFO", "publisher_sent", "Completed match history delivered", {
        externalMatchId: fixture.externalMatchId,
        clubId: fixture.club.id,
        clubSlug: fixture.club.slug,
        status: response.status,
        imported: response.imported,
        sentCount: this.state.sentCount,
        nextIndex: this.state.nextIndex
      });
      if (this.state.nextIndex >= this.fixtures.length) {
        this.stop();
      }
      return {
        ok: true
      };
    } catch (error) {
      const internalError = error instanceof Error ? error.message : String(error);
      const publicError = sanitizePublishError();
      this.state.lastResult = "error";
      this.state.lastError = publicError;
      log("ERROR", "publisher_error", "Failed to deliver completed match history", {
        externalMatchId: fixture.externalMatchId,
        error: internalError
      });
      return {
        ok: false,
        error: publicError
      };
    }
  }
  private async sendFixture(fixture: MatchFixture): Promise<PublishResponse> {
    const response = await fetch(this.config.backendHistoryIngestUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-history-ingest-token": this.config.historyIngestToken
      },
      body: JSON.stringify(fixture)
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(payload)}`);
    }
    return {
      ok: true,
      status: response.status,
      imported: Boolean(payload?.meta?.imported),
      payload
    };
  }
}
type RuntimeResources = {
  app: Express;
  publisher: HistoryPublisher;
  config: RuntimeConfig;
};
const acquireRuntimeResources = (config: RuntimeConfig): RuntimeResources => {
  const publisher = new HistoryPublisher(config);
  const app = express();
  app.use(express.json({
    limit: "1mb"
  }));
  return {
    app,
    publisher,
    config
  };
};
const registerRoutes = ({
  app,
  publisher,
  config
}: RuntimeResources): void => {
  app.use("/control", (req, res, next) => {
    requireAuthorizedAccess(req, res, next, isAuthorizedControlRequest(req, config.controlToken));
  });
  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: SERVICE_NAME,
      fixtureSet: config.fixtureSet
    });
  });
  app.get("/readiness", (_req, res) => {
    const state = toPublicPublisherState(publisher.getState());
    res.status(200).json({
      ok: true,
      service: SERVICE_NAME,
      publisher: state
    });
  });
  app.get("/status", (_req, res) => {
    res.json({
      data: toPublicPublisherState(publisher.getState())
    });
  });
  app.get("/fixtures", (req, res) => {
    const authorization = isAuthorizedControlRequest(req, config.controlToken);
    if (!authorization.ok) {
      rejectUnauthorizedAccess(req, res, authorization);
      return;
    }
    log("INFO", "fixtures_authorized", "Mock fixture request accepted", {
      path: req.path,
      method: req.method,
      mode: authorization.mode
    });
    res.json({
      data: publisher.getFixtures(),
      meta: {
        fixtureSet: config.fixtureSet,
        total: publisher.getState().totalFixtures,
        seed: config.fixtureSeed
      }
    });
  });
  app.post("/control/start", (_req, res) => {
    publisher.start();
    res.json({
      data: publisher.getState()
    });
  });
  app.post("/control/stop", (_req, res) => {
    publisher.stop();
    res.json({
      data: publisher.getState()
    });
  });
  app.post("/control/publish-next", async (_req, res) => {
    const result = await publisher.publishNext();
    if (result.ok) {
      res.json({
        data: publisher.getState()
      });
      return;
    }
    log("ERROR", "control_publish_next_failed", "Mock control publish-next failed", {
      error: result.error
    });
    res.status(502).json({
      error: "Failed to publish next fixture"
    });
  });
};
const buildStartupSummary = ({
  publisher,
  config
}: RuntimeResources): Record<string, unknown> => {
  return {
    port: config.port,
    ingestUrl: config.backendHistoryIngestUrl,
    autoStart: config.autoStart,
    controlGuard: config.controlToken ? "token-only" : "disabled",
    fixtureSet: config.fixtureSet,
    fixtureCount: config.fixtureCount,
    fixtureSeed: config.fixtureSeed,
    totalFixtures: publisher.getState().totalFixtures
  };
};
const startRuntimeServer = ({
  app,
  publisher,
  config
}: RuntimeResources): void => {
  app.listen(config.port, "127.0.0.1", () => {
    log("INFO", "startup", "History mock server listening", buildStartupSummary({
      app,
      publisher,
      config
    }));
    if (config.autoStart) {
      publisher.start();
    }
  });
};
const mapStartupErrorToExitCode = (error: unknown): number => {
  if (!isMockServerFailure(error)) {
    return STARTUP_FAILURE_EXIT_CODE;
  }
  switch (error.kind) {
    case "invalid-configuration":
      return INVALID_CONFIGURATION_EXIT_CODE;
    case "dependency-unavailable":
      return DEPENDENCY_UNAVAILABLE_EXIT_CODE;
    default:
      return STARTUP_FAILURE_EXIT_CODE;
  }
};
const main = async (): Promise<void> => {
  let exitCode = 0;
  try {
    const config = loadRuntimeConfig(process.env);
    validateRuntime(config);
    runPrechecks(config);
    const resources = acquireRuntimeResources(config);
    registerRoutes(resources);
    startRuntimeServer(resources);
  } catch (error) {
    exitCode = mapStartupErrorToExitCode(error);
    log("ERROR", "startup_error", "Mock server failed to start", {
      error: error instanceof Error ? error.message : String(error),
      exitCode,
      classified: isMockServerFailure(error) ? error.kind : "unexpected-failure"
    });
  }
  if (exitCode !== 0) {
    process.exitCode = exitCode;
  }
};
void main();

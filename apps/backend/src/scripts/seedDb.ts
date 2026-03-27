import { importCompletedMatch } from "../services/matchHistoryService";
import { closeDbPool, pool } from "../db/pool";
import { printDbConnectionHint } from "./dbConnectionError";
import type { ImportCompletedMatchRequest } from "../types";
type SeedResult = {
  matchesImported: number;
};
export const assertNonProduction = (commandName: "db:seed" | "db:reset" | "db:reseed" = "db:seed"): void => {
  if (process.env.NODE_ENV === "production") {
    console.error(`[${commandName}] Blocked: NODE_ENV=production`);
    process.exit(1);
  }
};
export const historySeeds: ImportCompletedMatchRequest[] = [{
  externalMatchId: "demo-match-001",
  club: {
    id: "arena-prime",
    slug: "arena-prime",
    name: "Arena Prime",
    address: "Москва, ул. Тверская, 18"
  },
  map: "de_mirage",
  mode: "5v5",
  bestOf: 1,
  playedAt: "2026-03-08T19:30:00.000Z",
  teams: [{
    side: "home",
    name: "Night Raid",
    score: 13,
    players: [{
      playerId: "nr-1",
      nickname: "Axe",
      kills: 22,
      deaths: 11,
      assists: 6
    }, {
      playerId: "nr-2",
      nickname: "Blaze",
      kills: 19,
      deaths: 14,
      assists: 8
    }, {
      playerId: "nr-3",
      nickname: "Cipher",
      kills: 15,
      deaths: 10,
      assists: 9
    }]
  }, {
    side: "away",
    name: "Vector",
    score: 9,
    players: [{
      playerId: "vc-1",
      nickname: "Nova",
      kills: 17,
      deaths: 16,
      assists: 4
    }, {
      playerId: "vc-2",
      nickname: "Pulse",
      kills: 12,
      deaths: 18,
      assists: 7
    }, {
      playerId: "vc-3",
      nickname: "Shift",
      kills: 10,
      deaths: 17,
      assists: 5
    }]
  }]
}, {
  externalMatchId: "demo-match-002",
  club: {
    id: "arena-prime",
    slug: "arena-prime",
    name: "Arena Prime",
    address: "Москва, ул. Тверская, 18"
  },
  map: "de_overpass",
  mode: "competitive",
  bestOf: 3,
  playedAt: "2026-03-08T16:10:00.000Z",
  teams: [{
    side: "home",
    name: "Pulse Core",
    score: 16,
    players: [{
      playerId: "pc-1",
      nickname: "Fuse",
      kills: 25,
      deaths: 14,
      assists: 8
    }, {
      playerId: "pc-2",
      nickname: "Kite",
      kills: 18,
      deaths: 15,
      assists: 11
    }, {
      playerId: "pc-3",
      nickname: "Rune",
      kills: 16,
      deaths: 13,
      assists: 9
    }]
  }, {
    side: "away",
    name: "Northwind",
    score: 12,
    players: [{
      playerId: "nw-1",
      nickname: "Trace",
      kills: 19,
      deaths: 18,
      assists: 6
    }, {
      playerId: "nw-2",
      nickname: "Drift",
      kills: 15,
      deaths: 19,
      assists: 7
    }, {
      playerId: "nw-3",
      nickname: "Moss",
      kills: 11,
      deaths: 20,
      assists: 10
    }]
  }]
}, {
  externalMatchId: "demo-match-003",
  club: {
    id: "cyber-loft",
    slug: "cyber-loft",
    name: "Cyber Loft",
    address: "Санкт-Петербург, Лиговский проспект, 74"
  },
  map: "de_inferno",
  mode: "5v5",
  bestOf: 3,
  playedAt: "2026-03-07T18:00:00.000Z",
  teams: [{
    side: "home",
    name: "Quantum",
    score: 16,
    players: [{
      playerId: "qt-1",
      nickname: "Rift",
      kills: 24,
      deaths: 13,
      assists: 10
    }, {
      playerId: "qt-2",
      nickname: "Lock",
      kills: 20,
      deaths: 14,
      assists: 11
    }, {
      playerId: "qt-3",
      nickname: "Spark",
      kills: 13,
      deaths: 15,
      assists: 12
    }]
  }, {
    side: "away",
    name: "Signal",
    score: 14,
    players: [{
      playerId: "sg-1",
      nickname: "Echo",
      kills: 21,
      deaths: 17,
      assists: 6
    }, {
      playerId: "sg-2",
      nickname: "Trace",
      kills: 14,
      deaths: 19,
      assists: 9
    }, {
      playerId: "sg-3",
      nickname: "Volt",
      kills: 11,
      deaths: 20,
      assists: 8
    }]
  }]
}, {
  externalMatchId: "demo-match-004",
  club: {
    id: "cyber-loft",
    slug: "cyber-loft",
    name: "Cyber Loft",
    address: "Санкт-Петербург, Лиговский проспект, 74"
  },
  map: "de_train",
  mode: "bomb-defuse",
  bestOf: 1,
  playedAt: "2026-03-07T14:40:00.000Z",
  teams: [{
    side: "home",
    name: "Signal",
    score: 10,
    players: [{
      playerId: "sg2-1",
      nickname: "Volt",
      kills: 18,
      deaths: 16,
      assists: 6
    }, {
      playerId: "sg2-2",
      nickname: "Echo",
      kills: 14,
      deaths: 17,
      assists: 8
    }, {
      playerId: "sg2-3",
      nickname: "Hex",
      kills: 12,
      deaths: 18,
      assists: 7
    }]
  }, {
    side: "away",
    name: "Afterlight",
    score: 13,
    players: [{
      playerId: "al-1",
      nickname: "Sonic",
      kills: 20,
      deaths: 13,
      assists: 9
    }, {
      playerId: "al-2",
      nickname: "Iris",
      kills: 16,
      deaths: 15,
      assists: 11
    }, {
      playerId: "al-3",
      nickname: "Crown",
      kills: 13,
      deaths: 16,
      assists: 10
    }]
  }]
}, {
  externalMatchId: "demo-match-005",
  club: {
    id: "gg-point",
    slug: "gg-point",
    name: "GG Point",
    address: "Казань, ул. Баумана, 51"
  },
  map: "de_nuke",
  mode: "2v2",
  bestOf: 1,
  playedAt: "2026-03-06T20:15:00.000Z",
  teams: [{
    side: "home",
    name: "Orbit",
    score: 11,
    players: [{
      playerId: "ob-1",
      nickname: "Halo",
      kills: 14,
      deaths: 9,
      assists: 5
    }, {
      playerId: "ob-2",
      nickname: "Mint",
      kills: 12,
      deaths: 11,
      assists: 4
    }]
  }, {
    side: "away",
    name: "Forge",
    score: 11,
    players: [{
      playerId: "fg-1",
      nickname: "Drift",
      kills: 13,
      deaths: 10,
      assists: 6
    }, {
      playerId: "fg-2",
      nickname: "Grim",
      kills: 9,
      deaths: 12,
      assists: 7
    }]
  }]
}, {
  externalMatchId: "demo-match-006",
  club: {
    id: "vr-dominion",
    slug: "vr-dominion",
    name: "VR Dominion",
    address: "Санкт-Петербург, Невский проспект, 110"
  },
  map: "de_ancient",
  mode: "team-deathmatch",
  bestOf: 1,
  playedAt: "2026-03-05T19:05:00.000Z",
  teams: [{
    side: "home",
    name: "Aurora",
    score: 27,
    players: [{
      playerId: "au-1",
      nickname: "Lynx",
      kills: 31,
      deaths: 19,
      assists: 12
    }, {
      playerId: "au-2",
      nickname: "Skye",
      kills: 26,
      deaths: 21,
      assists: 15
    }, {
      playerId: "au-3",
      nickname: "Delta",
      kills: 22,
      deaths: 18,
      assists: 14
    }]
  }, {
    side: "away",
    name: "Zero Risk",
    score: 23,
    players: [{
      playerId: "zr-1",
      nickname: "Flint",
      kills: 24,
      deaths: 24,
      assists: 10
    }, {
      playerId: "zr-2",
      nickname: "Ghost",
      kills: 21,
      deaths: 26,
      assists: 9
    }, {
      playerId: "zr-3",
      nickname: "Byte",
      kills: 18,
      deaths: 27,
      assists: 11
    }]
  }]
}];
export const seedHistoryMatchesIfEmpty = async (): Promise<{
  imported: number;
  skipped: boolean;
}> => {
  const existingMatches = await pool.query<{
    count: string;
  }>("SELECT COUNT(*)::text AS count FROM matches");
  const totalMatches = Number(existingMatches.rows[0]?.count ?? "0");
  if (totalMatches > 0) {
    return {
      imported: 0,
      skipped: true
    };
  }
  let imported = 0;
  for (const match of historySeeds) {
    await importCompletedMatch(match, {
      source: "seed"
    });
    imported += 1;
  }
  return {
    imported,
    skipped: false
  };
};
export const seedDb = async (): Promise<SeedResult> => {
  const historySeedResult = await seedHistoryMatchesIfEmpty();
  return {
    matchesImported: historySeedResult.imported
  };
};
const main = async (): Promise<void> => {
  assertNonProduction("db:seed");
  try {
    const result = await seedDb();
    console.log(`[db:seed] Done. Inserted matches=${result.matchesImported}, total=${result.matchesImported}`);
  } finally {
    await closeDbPool();
  }
};
if (require.main === module) {
  main().catch(error => {
    printDbConnectionHint("db:seed", error);
    console.error("[db:seed] Failed", error);
    process.exit(1);
  });
}

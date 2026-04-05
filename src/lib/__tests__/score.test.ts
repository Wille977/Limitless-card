import { describe, it, expect } from "vitest";
import { classifyTrader, getAllScores } from "../score";
import type { DerivedData } from "../derive";

// ─── Helper: build a DerivedData object with sensible defaults ───────────────

function makeDerived(overrides: Partial<DerivedData> = {}): DerivedData {
  return {
    totalVolumeUsdc: 1000,
    tradeCount: 20,
    averageBetSizeUsdc: 50,
    netPnlUsdc: 0,
    winRate: 0.5,
    winRateSource: "realisedPnl",
    pnlCurve: [0, 10, 5, 15, 20],
    bestDayUsdc: 15,
    worstDayUsdc: -5,
    pnlTrend: "flat",
    openPositionCount: 5,
    positionSizes: [50, 50, 50, 50, 50],
    yesBias: 0.5,
    ammPositionCount: 0,
    clobPositionCount: 5,
    uniqueMarketCount: 5,
    portfolioConcentration: 0.6,
    categoryDistribution: {},
    dominantCategory: "unknown",
    dominantCategoryPct: 0,
    entryTimingsVsCreation: [24, 48, 72],
    entryTimingsVsExpiry: [48, 24, 12],
    avgEntryHoursAfterCreation: 48,
    avgEntryHoursBeforeExpiry: 28,
    points: 100,
    accumulativePoints: 1000,
    rewardEarnings: 5,
    entryProbabilities: [0.5, 0.5, 0.5],
    avgEntryProbability: 0.5,
    activeDays: 10,
    ...overrides,
  };
}

// ─── getAllScores & classifyTrader basics ─────────────────────────────────────

describe("getAllScores", () => {
  it("returns exactly 48 scored cards", () => {
    const scores = getAllScores(makeDerived());
    expect(scores).toHaveLength(48);
  });

  it("returns scores sorted descending", () => {
    const scores = getAllScores(makeDerived());
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1].score).toBeGreaterThanOrEqual(scores[i].score);
    }
  });

  it("every score is a finite non-negative number", () => {
    const scores = getAllScores(makeDerived());
    for (const s of scores) {
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(s.score)).toBe(true);
    }
  });
});

describe("classifyTrader", () => {
  it("returns the highest-scoring card", () => {
    const d = makeDerived();
    const result = classifyTrader(d);
    const all = getAllScores(d);
    expect(result.score).toBe(all[0].score);
    expect(result.card.id).toBe(all[0].card.id);
  });
});

// ─── No scorer produces NaN, Infinity, or negative for edge-case inputs ──────

describe("scorer robustness", () => {
  const edgeCases: [string, Partial<DerivedData>][] = [
    ["empty wallet", {
      totalVolumeUsdc: 0, tradeCount: 0, averageBetSizeUsdc: 0,
      netPnlUsdc: 0, winRate: -1, winRateSource: "none",
      pnlCurve: [], bestDayUsdc: 0, worstDayUsdc: 0, pnlTrend: "flat",
      openPositionCount: 0, positionSizes: [], yesBias: 0.5,
      ammPositionCount: 0, clobPositionCount: 0, uniqueMarketCount: 0,
      portfolioConcentration: 0, categoryDistribution: {},
      dominantCategory: "unknown", dominantCategoryPct: 0,
      entryTimingsVsCreation: [], entryTimingsVsExpiry: [],
      avgEntryHoursAfterCreation: 0, avgEntryHoursBeforeExpiry: 0,
      points: 0, accumulativePoints: 0, rewardEarnings: 0,
      entryProbabilities: [], avgEntryProbability: 0.5, activeDays: 0,
    }],
    ["negative PnL", { netPnlUsdc: -50000, winRate: 0.1, pnlTrend: "down" }],
    ["huge whale", { totalVolumeUsdc: 2_000_000, averageBetSizeUsdc: 10000, tradeCount: 200 }],
    ["single position", { positionSizes: [100], openPositionCount: 1, tradeCount: 1 }],
    ["unknown win rate", { winRate: -1, winRateSource: "none" as const }],
  ];

  for (const [name, overrides] of edgeCases) {
    it(`no NaN/Infinity/negative scores for: ${name}`, () => {
      const scores = getAllScores(makeDerived(overrides));
      for (const s of scores) {
        expect(s.score).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(s.score)).toBe(true);
      }
    });
  }
});

// ─── Cluster 1: Volume & Size ────────────────────────────────────────────────

describe("Cluster 1 — Volume & Size scorers", () => {
  it("whale scores high for huge volume", () => {
    const scores = getAllScores(makeDerived({
      totalVolumeUsdc: 1_500_000, averageBetSizeUsdc: 5000, tradeCount: 100,
    }));
    const whale = scores.find((s) => s.card.id === "whale")!;
    expect(whale.score).toBeGreaterThanOrEqual(100);
  });

  it("whale scores low for tiny volume", () => {
    const whale = getAllScores(makeDerived({
      totalVolumeUsdc: 100, averageBetSizeUsdc: 5,
    })).find((s) => s.card.id === "whale")!;
    expect(whale.score).toBeLessThan(30);
  });

  it("shrimp scores high for many small trades", () => {
    const shrimp = getAllScores(makeDerived({
      tradeCount: 50, averageBetSizeUsdc: 5, totalVolumeUsdc: 250,
    })).find((s) => s.card.id === "shrimp")!;
    expect(shrimp.score).toBeGreaterThanOrEqual(80);
  });

  it("shark scores high for profitable volume", () => {
    const shark = getAllScores(makeDerived({
      totalVolumeUsdc: 50_000, winRate: 0.65, pnlTrend: "up",
      positionSizes: [100, 100, 100, 100, 100],
    })).find((s) => s.card.id === "shark")!;
    expect(shark.score).toBeGreaterThanOrEqual(80);
  });

  it("swarm scores high for many micro-bets", () => {
    const swarm = getAllScores(makeDerived({
      tradeCount: 200, averageBetSizeUsdc: 3, totalVolumeUsdc: 5000,
    })).find((s) => s.card.id === "swarm")!;
    expect(swarm.score).toBeGreaterThanOrEqual(80);
  });

  it("sniper scores high when largest position dwarfs median", () => {
    const sniper = getAllScores(makeDerived({
      positionSizes: [5, 5, 5, 5, 5, 5, 5, 5, 5, 500],
      tradeCount: 10, bestDayUsdc: 1000,
    })).find((s) => s.card.id === "sniper")!;
    expect(sniper.score).toBeGreaterThanOrEqual(80);
  });

  it("arrival scores high for new user with volume", () => {
    const arrival = getAllScores(makeDerived({
      accumulativePoints: 200, totalVolumeUsdc: 10_000, tradeCount: 10,
    })).find((s) => s.card.id === "arrival")!;
    expect(arrival.score).toBeGreaterThanOrEqual(80);
  });

  it("size-queen scores high for consistent large sizing", () => {
    const sq = getAllScores(makeDerived({
      positionSizes: [500, 500, 500, 500, 500],
      averageBetSizeUsdc: 500,
    })).find((s) => s.card.id === "size-queen")!;
    expect(sq.score).toBeGreaterThanOrEqual(80);
  });

  it("dripper scores high for many tiny spread positions", () => {
    const dripper = getAllScores(makeDerived({
      openPositionCount: 30, averageBetSizeUsdc: 3, uniqueMarketCount: 25,
    })).find((s) => s.card.id === "dripper")!;
    expect(dripper.score).toBeGreaterThanOrEqual(80);
  });
});

// ─── Cluster 2: Win Rate & P&L ──────────────────────────────────────────────

describe("Cluster 2 — Win Rate & P&L scorers", () => {
  it("oracle scores high for strong win rate + uptrend", () => {
    const oracle = getAllScores(makeDerived({
      winRate: 0.72, pnlTrend: "up", netPnlUsdc: 5000,
    })).find((s) => s.card.id === "oracle")!;
    expect(oracle.score).toBeGreaterThanOrEqual(80);
  });

  it("oracle returns 0 when winRate is unknown (-1)", () => {
    const oracle = getAllScores(makeDerived({
      winRate: -1,
    })).find((s) => s.card.id === "oracle")!;
    expect(oracle.score).toBe(0);
  });

  it("rekt scores high for losing trader", () => {
    const rekt = getAllScores(makeDerived({
      netPnlUsdc: -5000, winRate: 0.2, tradeCount: 50,
    })).find((s) => s.card.id === "rekt")!;
    expect(rekt.score).toBeGreaterThanOrEqual(80);
  });

  it("comeback-kid scores 90 for v-shape trend", () => {
    const ck = getAllScores(makeDerived({
      pnlTrend: "v-shape",
    })).find((s) => s.card.id === "comeback-kid")!;
    expect(ck.score).toBe(90);
  });

  it("comeback-kid returns 0 for short curves", () => {
    const ck = getAllScores(makeDerived({
      pnlCurve: [0, 5],
      pnlTrend: "up",
    })).find((s) => s.card.id === "comeback-kid")!;
    expect(ck.score).toBe(0);
  });

  it("one-hit-wonder scores high when one day dominates PnL", () => {
    const ohw = getAllScores(makeDerived({
      pnlCurve: [0, 10, 5, 15, 20],
      bestDayUsdc: 900,
      netPnlUsdc: 1000,
    })).find((s) => s.card.id === "one-hit-wonder")!;
    expect(ohw.score).toBeGreaterThanOrEqual(80);
  });

  it("slow-rug scores high for steady decline", () => {
    const sr = getAllScores(makeDerived({
      pnlTrend: "down", netPnlUsdc: -2000,
      pnlCurve: [100, 90, 80, 70, 60, 50, 40, 30],
    })).find((s) => s.card.id === "slow-rug")!;
    expect(sr.score).toBeGreaterThanOrEqual(70);
  });

  it("ascent scores 90 for exponential trend", () => {
    const asc = getAllScores(makeDerived({
      pnlTrend: "exponential",
    })).find((s) => s.card.id === "ascent")!;
    expect(asc.score).toBe(90);
  });

  it("mid-curve scores high for break-even trader", () => {
    const mc = getAllScores(makeDerived({
      netPnlUsdc: 5, totalVolumeUsdc: 50_000, tradeCount: 100, pnlTrend: "flat",
    })).find((s) => s.card.id === "mid-curve")!;
    expect(mc.score).toBeGreaterThanOrEqual(80);
  });

  it("contrarian-king scores high for low-probability winner", () => {
    const ck = getAllScores(makeDerived({
      avgEntryProbability: 0.25, winRate: 0.55,
    })).find((s) => s.card.id === "contrarian-king")!;
    expect(ck.score).toBeGreaterThanOrEqual(80);
  });

  it("contrarian-king returns 0 when winRate is unknown", () => {
    const ck = getAllScores(makeDerived({
      winRate: -1, avgEntryProbability: 0.25,
    })).find((s) => s.card.id === "contrarian-king")!;
    expect(ck.score).toBe(0);
  });
});

// ─── Cluster 3: Frequency & Timing ──────────────────────────────────────────

describe("Cluster 3 — Frequency & Timing scorers", () => {
  it("scout scores high for early market entries", () => {
    const scout = getAllScores(makeDerived({
      entryTimingsVsCreation: [2, 6, 12, 18, 24, 10, 8],
      avgEntryHoursAfterCreation: 12,
    })).find((s) => s.card.id === "scout")!;
    expect(scout.score).toBeGreaterThanOrEqual(80);
  });

  it("scout returns 0 with no entry timings", () => {
    const scout = getAllScores(makeDerived({
      entryTimingsVsCreation: [],
    })).find((s) => s.card.id === "scout")!;
    expect(scout.score).toBe(0);
  });

  it("grinder scores high for heavy activity + points", () => {
    const grinder = getAllScores(makeDerived({
      tradeCount: 300, accumulativePoints: 10000, uniqueMarketCount: 30,
    })).find((s) => s.card.id === "grinder")!;
    expect(grinder.score).toBeGreaterThanOrEqual(80);
  });

  it("tourist scores high for very few trades", () => {
    const tourist = getAllScores(makeDerived({
      tradeCount: 2, openPositionCount: 0, accumulativePoints: 10,
    })).find((s) => s.card.id === "tourist")!;
    expect(tourist.score).toBeGreaterThanOrEqual(80);
  });

  it("closer scores high for late entries near expiry", () => {
    const closer = getAllScores(makeDerived({
      entryTimingsVsExpiry: [2, 5, 8, 10, 6, 3, 12, 20, 18, 4],
      avgEntryHoursBeforeExpiry: 8,
    })).find((s) => s.card.id === "closer")!;
    expect(closer.score).toBeGreaterThanOrEqual(70);
  });
});

// ─── Cluster 4: Category ─────────────────────────────────────────────────────

describe("Cluster 4 — Category scorers", () => {
  it("sports-bettor scores high for sports-heavy portfolio", () => {
    const sb = getAllScores(makeDerived({
      categoryDistribution: { sports: 0.85, crypto: 0.15 },
    })).find((s) => s.card.id === "sports-bettor")!;
    expect(sb.score).toBeGreaterThanOrEqual(80);
  });

  it("crypto-maximalist scores for crypto + cryptocurrency keys", () => {
    const cm = getAllScores(makeDerived({
      categoryDistribution: { crypto: 0.5, cryptocurrency: 0.4 },
    })).find((s) => s.card.id === "crypto-maximalist")!;
    expect(cm.score).toBeGreaterThanOrEqual(80);
  });

  it("generalist scores high for even distribution", () => {
    const gen = getAllScores(makeDerived({
      categoryDistribution: { sports: 0.2, crypto: 0.2, politics: 0.2, entertainment: 0.2, macro: 0.2 },
    })).find((s) => s.card.id === "generalist")!;
    expect(gen.score).toBeGreaterThanOrEqual(80);
  });

  it("generalist returns 0 with fewer than 3 categories", () => {
    const gen = getAllScores(makeDerived({
      categoryDistribution: { sports: 0.6, crypto: 0.4 },
    })).find((s) => s.card.id === "generalist")!;
    expect(gen.score).toBe(0);
  });

  it("specialist scores high for single-category dominance", () => {
    const spec = getAllScores(makeDerived({
      dominantCategoryPct: 0.95,
    })).find((s) => s.card.id === "specialist")!;
    expect(spec.score).toBeGreaterThanOrEqual(100);
  });
});

// ─── Cluster 5: Position & Hold ──────────────────────────────────────────────

describe("Cluster 5 — Position & Hold scorers", () => {
  it("diamond-hands scores high for low-turnover holders", () => {
    const dh = getAllScores(makeDerived({
      openPositionCount: 10, tradeCount: 15, pnlTrend: "up",
    })).find((s) => s.card.id === "diamond-hands")!;
    expect(dh.score).toBeGreaterThanOrEqual(80);
  });

  it("diversifier scores high for well-spread positions", () => {
    const sizes = Array(25).fill(10); // 25 equal positions
    const div = getAllScores(makeDerived({
      positionSizes: sizes, uniqueMarketCount: 25,
    })).find((s) => s.card.id === "diversifier")!;
    expect(div.score).toBeGreaterThanOrEqual(80);
  });

  it("hedger scores high for balanced YES/NO bias", () => {
    const hedger = getAllScores(makeDerived({
      yesBias: 0.5, openPositionCount: 10,
    })).find((s) => s.card.id === "hedger")!;
    expect(hedger.score).toBeGreaterThanOrEqual(80);
  });
});

// ─── Cluster 6: Probability ─────────────────────────────────────────────────

describe("Cluster 6 — Probability scorers", () => {
  it("moonshot scores high for low-probability entries", () => {
    const ms = getAllScores(makeDerived({
      entryProbabilities: [0.05, 0.1, 0.08, 0.15, 0.12, 0.07, 0.09, 0.11, 0.06, 0.13],
    })).find((s) => s.card.id === "moonshot")!;
    expect(ms.score).toBeGreaterThanOrEqual(70);
  });

  it("safe-hands scores high for high-probability entries", () => {
    const sh = getAllScores(makeDerived({
      entryProbabilities: [0.8, 0.85, 0.9, 0.75, 0.82],
    })).find((s) => s.card.id === "safe-hands")!;
    expect(sh.score).toBeGreaterThanOrEqual(80);
  });

  it("coin-flip scores high for mid-range probabilities", () => {
    const cf = getAllScores(makeDerived({
      entryProbabilities: [0.48, 0.50, 0.52, 0.49, 0.51],
    })).find((s) => s.card.id === "coin-flip")!;
    expect(cf.score).toBeGreaterThanOrEqual(80);
  });

  it("degen scores high for very low probability entries", () => {
    const degen = getAllScores(makeDerived({
      entryProbabilities: [0.03, 0.05, 0.02, 0.08, 0.04],
    })).find((s) => s.card.id === "degen")!;
    expect(degen.score).toBeGreaterThanOrEqual(60);
  });

  it("quant returns 0 when winRate is unknown", () => {
    const quant = getAllScores(makeDerived({
      winRate: -1,
    })).find((s) => s.card.id === "quant")!;
    expect(quant.score).toBe(0);
  });

  it("efficiency-trader scores high for consistent sizing + wins", () => {
    const et = getAllScores(makeDerived({
      positionSizes: [100, 100, 100, 100, 100],
      winRate: 0.6,
    })).find((s) => s.card.id === "efficiency-trader")!;
    expect(et.score).toBeGreaterThanOrEqual(70);
  });
});

// ─── Cluster 7: Ecosystem ────────────────────────────────────────────────────

describe("Cluster 7 — Ecosystem scorers", () => {
  it("og scores high for deep history", () => {
    const og = getAllScores(makeDerived({
      accumulativePoints: 60_000, tradeCount: 200,
    })).find((s) => s.card.id === "og")!;
    expect(og.score).toBeGreaterThanOrEqual(100);
  });

  it("tourist profile classifies correctly", () => {
    const result = classifyTrader(makeDerived({
      tradeCount: 2, openPositionCount: 0, accumulativePoints: 10,
      totalVolumeUsdc: 50, averageBetSizeUsdc: 25,
      positionSizes: [], entryProbabilities: [],
      entryTimingsVsCreation: [], entryTimingsVsExpiry: [],
      uniqueMarketCount: 2, portfolioConcentration: 0,
      categoryDistribution: {}, dominantCategoryPct: 0,
      winRate: -1, winRateSource: "none",
      netPnlUsdc: 0, pnlCurve: [], pnlTrend: "flat",
    }));
    expect(result.card.id).toBe("tourist");
  });

  it("true-believer scores high for sustained engagement", () => {
    const tb = getAllScores(makeDerived({
      accumulativePoints: 8000, tradeCount: 150, netPnlUsdc: -200,
    })).find((s) => s.card.id === "true-believer")!;
    expect(tb.score).toBeGreaterThanOrEqual(80);
  });

  it("point-farmer returns 0 for zero volume", () => {
    const pf = getAllScores(makeDerived({
      totalVolumeUsdc: 0, accumulativePoints: 5000,
    })).find((s) => s.card.id === "point-farmer")!;
    expect(pf.score).toBe(0);
  });
});

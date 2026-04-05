# Test Coverage Analysis

## Current State

**Zero test coverage.** No test files, test framework, test scripts, or testing dependencies exist in the project.

The codebase has ~1,300 lines of business logic across 5 library files (`src/lib/`), 6 React components (`src/components/`), and 2 API routes (`src/app/api/`).

---

## Recommended Testing Priorities

### Priority 1: Scoring Engine (`src/lib/score.ts`) — Critical

The scoring engine contains 48 individual scorer functions that classify traders into card archetypes. This is the core business logic of the app — a bug here means users receive the wrong card.

**Risks without tests:**
- 48 scorers with complex threshold/bonus logic, each returning 0–100 (clamped to 150)
- `classifyTrader()` selects the highest-scoring card — incorrect sorting or clamping breaks the entire product
- Tiebreaker logic (scores within 5 points) is subtle
- Edge cases: empty arrays, zero values, negative PnL, unknown win rate (`-1`), `NaN` propagation

**Recommended tests:**
- Unit test each scorer with representative inputs (high, low, boundary values)
- `classifyTrader()` returns expected card for known trader profiles
- `getAllScores()` returns all 48 cards sorted correctly
- Verify no scorer returns negative, `NaN`, or `Infinity`
- Tiebreaker scenarios where top-2 scores are within 5 points
- Helper functions: `clamp()`, `exceeds()`, `stdDev()`

### Priority 2: Data Derivation (`src/lib/derive.ts`) — Critical

378 lines of data transformation converting raw API responses into 30+ derived metrics. Every downstream classification depends on correctness here.

**Risks without tests:**
- Trade count estimation uses 3 different code paths (≥3 positions, 1–2 positions, 0 positions)
- Win rate picks from 3 methods (realisedPnl, resolved, dailyPnl) based on sample size — subtle sorting bug risk
- `detectPnlTrend()` classifies curves into 6 categories with overlapping conditions
- Portfolio concentration, YES/NO bias, and category distribution calculations

**Recommended tests:**
- `deriveData()` with realistic mock portfolio data exercising each estimation path
- `detectPnlTrend()` with synthetic curves for each of the 6 trend types (up, down, flat, volatile, v-shape, exponential)
- Win rate method selection: verify the highest-sample-count method wins
- Edge cases: empty positions, zero volume, wallets with only AMM or only CLOB data, single-position wallets

### Priority 3: API Route (`src/app/api/generate/route.ts`) — High

The orchestration layer with input validation, template interpolation, and error handling.

**Risks without tests:**
- `isValidAddress()` regex could miss edge cases (checksummed addresses, ENS names)
- `interpolateMotivation()` handles special case win rate `-1` → "strong" — missing a replacement breaks the card
- Error handling: 404 detection from upstream errors, generic error wrapping
- Response shape contract with the frontend is implicit

**Recommended tests:**
- `isValidAddress()` with valid, invalid, and edge-case Ethereum addresses
- `interpolateMotivation()` with all template variables, including `-1` win rate edge case
- Integration test with mocked `fetchPortfolioData`/`fetchMarketDetails`
- Error responses: missing wallet param, invalid format, upstream 404, generic 500

### Priority 4: API Client Utilities (`src/lib/limitless-api.ts`) — Medium

Mostly network plumbing, but contains the critical `rawToUsdc()` conversion used throughout derivation and scoring.

**Recommended tests:**
- `rawToUsdc()` with string inputs, numeric inputs, zero, negative values, custom decimal parameter
- `fetchJson()` error handling (non-OK status codes, network failures)
- `fetchMarketDetails()` batching logic (processes slugs in groups of 10, handles `Promise.allSettled` rejections)

### Priority 5: React Components — Lower Priority

The 6 components are primarily presentational with minimal logic. Less critical than business logic, but still valuable.

**Recommended tests:**
- `WalletInput`: validates input format, calls `onSubmit` with trimmed address, disables during loading
- `TraderCard`: renders correct stats values, applies accent color gradient, displays card title
- `AnalysisLoader`: progress bar advances, displays stage messages
- Snapshot tests for visual regression

---

## Recommended Test Setup

**Framework:** Vitest (fast, native ESM/TypeScript, excellent Next.js compatibility)

**Additional dependencies:**
- `vitest` — test runner
- `@testing-library/react` + `@testing-library/jest-dom` — component tests
- `msw` (Mock Service Worker) — API mocking for integration tests

**Suggested file structure:**
```
src/lib/__tests__/score.test.ts         — 48 scorer unit tests + classifyTrader
src/lib/__tests__/derive.test.ts        — derivation logic + detectPnlTrend
src/lib/__tests__/limitless-api.test.ts — rawToUsdc + fetch helpers
src/app/api/__tests__/generate.test.ts  — route handler integration tests
src/components/__tests__/               — component rendering tests
```

**Package.json script:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Impact Assessment

| Module | Lines | Complexity | Risk if Untested |
|--------|-------|------------|-----------------|
| `score.ts` | 532 | 48 scorers, thresholds, bonuses | Users get wrong card |
| `derive.ts` | 378 | 3 estimation paths, 3 win rate methods, trend detection | All scores are wrong |
| `generate/route.ts` | 116 | Validation, interpolation, error handling | API returns bad data |
| `limitless-api.ts` | 189 | Network calls, batching, USDC conversion | Silent data corruption |
| Components (6 files) | ~550 | Mostly presentational | Visual bugs |

**Estimated effort:** A solid foundation of ~100–150 test cases covering Priorities 1–3 would dramatically reduce regression risk with moderate effort.

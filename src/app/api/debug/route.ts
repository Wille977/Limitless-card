import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.limitless.exchange";

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet")?.trim();
  if (!wallet) return NextResponse.json({ error: "wallet required" }, { status: 400 });

  const [vol, pos, pnl] = await Promise.allSettled([
    fetch(`${BASE}/portfolio/${wallet}/traded-volume`).then(r => r.json()),
    fetch(`${BASE}/portfolio/${wallet}/positions`).then(r => r.json()),
    fetch(`${BASE}/portfolio/${wallet}/pnl-chart`).then(r => r.json()),
  ]);

  return NextResponse.json({
    tradedVolume: vol.status === "fulfilled" ? vol.value : { error: (vol as PromiseRejectedResult).reason?.message },
    positions: pos.status === "fulfilled" ? pos.value : { error: (pos as PromiseRejectedResult).reason?.message },
    pnlChart: pnl.status === "fulfilled" ? pnl.value : { error: (pnl as PromiseRejectedResult).reason?.message },
  });
}

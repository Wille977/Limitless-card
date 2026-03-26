export interface CardConfig {
  id: string;
  title: string;
  accentColour: string;
  motivationTemplate: string;
  cluster: string;
}

export interface TraderStats {
  winRate: number;       // percentage, e.g. 68
  pnl: number;          // USDC value, e.g. 12400
  trades: number;       // total trade count
  bestTrade: number;    // USDC value of best single trade
}

export interface TraderCardData {
  card: CardConfig;
  stats: TraderStats;
  xHandle?: string;
  xProfilePic?: string;
  walletAddress: string;
}

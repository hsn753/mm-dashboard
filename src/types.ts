export type TxType = 'buy' | 'sell' | 'mirror_buy' | 'mirror_sell' | 'fee_buy' | 'sell_absorb';

export interface Transaction {
  id: string;
  time: string;
  type: TxType;
  size: number;
  wallet: string;
  tx: string;
}

export interface MirrorRule {
  id: string;
  rule: string;
  threshold: string;
  action: string;
  status: boolean;
}

export interface MMStats {
  activeLaunch: string;
  mcap: string;
  mcapChange: number;
  treasury: string;
  supplyControl: string;
  buyers: number;
  sellers: number;
  ratio: string;
  fees24h: string;
  botStatus: 'running' | 'paused' | 'stopped';
}

export interface HolderRow {
  wallet: string;
  costBasis: number;
  pnl: number;
  kolSource: string;
  entryTime: string;
}

export interface KOL {
  id: string;
  handle: string;
  wallet: string;
  rate: number;
  campaign: string;
  scriptSchedule: 'am + pm' | 'am only' | 'pm only';
  status: 'paid' | 'pending' | 'queued_pm' | 'queued_am';
  telegramUsername?: string;
}

export interface Campaign {
  id: string;
  name: string;
  ticker: string;
  cashtag: string;
  startDate: string;
  endDate: string;
  scriptTemplate: string;
  status: 'active' | 'inactive';
}

export interface ScriptQueueItem {
  kolHandle: string;
  angle: string;
  sendMethod: string;
  scheduledAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  kol: string;
  campaign: string;
  detail: string;
  txHash?: string;
}

export interface PaymentRecord {
  id: string;
  kol: string;
  wallet: string;
  amount: number;
  txHash: string;
  timestamp: string;
  status: 'confirmed' | 'pending' | 'failed';
}

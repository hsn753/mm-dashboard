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
  campaign_id?: string | null;
  campaign?: string;
  script_schedule: 'am + pm' | 'am only' | 'pm only';
  scriptSchedule?: 'am + pm' | 'am only' | 'pm only';
  status: 'paid' | 'pending' | 'queued_pm' | 'queued_am';
  telegram_username?: string | null;
  telegramUsername?: string;
}

export interface Campaign {
  id: string;
  name: string;
  ticker: string;
  cashtag: string;
  start_date: string;
  end_date: string;
  script_template: string;
  startDate?: string;
  endDate?: string;
  scriptTemplate?: string;
  status: 'active' | 'inactive';
}

export interface ScriptQueueItem {
  kolHandle?: string;
  angle?: string;
  sendMethod?: string;
  scheduledAt?: string;
}

export interface ScriptLog {
  id: string;
  kol_handle: string;
  campaign_name: string;
  slot: string;
  status: string;
  sent_at: string;
}

export interface AuditLog {
  id: string;
  created_at: string;
  timestamp?: string;
  action: string;
  kol_handle: string;
  kol?: string;
  campaign_name?: string;
  campaign?: string;
  detail: string;
  tx_hash?: string | null;
  txHash?: string;
}

export interface PaymentRecord {
  id: string;
  kol_handle?: string;
  kol?: string;
  wallet: string;
  amount: number;
  tx_hash?: string | null;
  txHash?: string;
  created_at?: string;
  timestamp?: string;
  status: 'confirmed' | 'pending' | 'failed';
}

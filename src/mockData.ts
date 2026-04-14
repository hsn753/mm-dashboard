import type { Transaction, MMStats, MirrorRule, HolderRow, KOL, Campaign, ScriptQueueItem, AuditLog, PaymentRecord } from './types';

export const mockMMStats: MMStats = {
  activeLaunch: '$JLP',
  mcap: '...',
  mcapChange: 0,
  treasury: '$1.24M',
  supplyControl: '98.4%',
  buyers: 0,
  sellers: 0,
  ratio: '...',
  fees24h: '...',
  botStatus: 'running',
};

export const mockMirrorRules: MirrorRule[] = [
  {
    id: '1',
    rule: 'buy mirror',
    min_threshold: 1000,
    max_threshold: 0,
    mirror_multiplier: 0.97,
    absorb_multiplier: 1.0,
    delay_ms: 200,
    action: 'mirror-sell into buy pressure → treasury',
    status: true,
  },
  {
    id: '2',
    rule: 'sell absorb',
    min_threshold: 50,
    max_threshold: 999,
    mirror_multiplier: 1.0,
    absorb_multiplier: 1.05,
    delay_ms: 30000,
    action: 'buy back 105% via rotating wallet (30s delay)',
    status: true,
  },
  {
    id: '3',
    rule: 'micro sell ignore',
    min_threshold: 0,
    max_threshold: 49,
    mirror_multiplier: 0,
    absorb_multiplier: 0,
    delay_ms: 0,
    action: 'no response — retail trickle absorbed naturally',
    status: true,
  },
  {
    id: '4',
    rule: 'fee redeploy',
    min_threshold: 0,
    max_threshold: 0,
    mirror_multiplier: 1.0,
    absorb_multiplier: 1.0,
    delay_ms: 1200000,
    action: 'claim meteora fees → redeploy as buys (20min jitter)',
    status: true,
  },
];

export const mockTransactions: Transaction[] = [
  { id: '1', time: '14:32:01', type: 'mirror_sell', size: 7760, wallet: 'wlt_07', tx: '5Kj...a2', jitoBundle: true, bundleLatencyMs: 1340 },
  { id: '2', time: '14:32:00', type: 'buy', size: 8000, wallet: 'wlt_ext_C', tx: '5Kj...a1', jitoBundle: false, bundleLatencyMs: undefined },
  { id: '3', time: '14:18:44', type: 'fee_buy', size: 3800, wallet: 'wlt_03', tx: '9Xp...f1', jitoBundle: true, bundleLatencyMs: 980 },
  { id: '4', time: '14:04:12', type: 'sell_absorb', size: 525, wallet: 'wlt_11', tx: '2Mn...c8', jitoBundle: true, bundleLatencyMs: 1120 },
  { id: '5', time: '14:04:11', type: 'sell', size: 400, wallet: 'wlt_ext_D', tx: '2Mn...c7', jitoBundle: false, bundleLatencyMs: undefined },
  { id: '6', time: '13:51:03', type: 'mirror_buy', size: 1560, wallet: 'wlt_02', tx: '7Lp...d3', jitoBundle: true, bundleLatencyMs: 760 },
  { id: '7', time: '13:51:02', type: 'sell', size: 1500, wallet: 'wlt_ext_B', tx: '7Lp...d2', jitoBundle: false, bundleLatencyMs: undefined },
  { id: '8', time: '13:38:00', type: 'buy', size: 890, wallet: 'wlt_ext_A', tx: '3Rk...e7', jitoBundle: false, bundleLatencyMs: undefined },
];

export const mockHolders: HolderRow[] = [
  { wallet: '7Hx...9k', costBasis: 8200, pnl: 3100, kolSource: '@cryptomoon', entryTime: '2d ago' },
  { wallet: '3Pq...2m', costBasis: 1500, pnl: -200, kolSource: '@degenalpha', entryTime: '1d ago' },
  { wallet: '9Rz...8c', costBasis: 22000, pnl: 8800, kolSource: '@solkingg', entryTime: '3d ago' },
  { wallet: '2Kn...5p', costBasis: 500, pnl: 120, kolSource: 'organic', entryTime: '5h ago' },
  { wallet: '4Mv...7w', costBasis: 3400, pnl: -800, kolSource: '@frogdaddy', entryTime: '6h ago' },
  { wallet: '6Xt...1n', costBasis: 11000, pnl: 4200, kolSource: '@cryptomoon', entryTime: '1d ago' },
];

export const mockKOLs: KOL[] = [
  { id: '1', handle: '@cryptomoon', wallet: '7Hx...9k', rate: 800, campaign: 'aspen launch', script_schedule: 'am + pm', status: 'paid', telegram_username: 'cryptomoon' },
  { id: '2', handle: '@degenalpha', wallet: '3Pq...2m', rate: 1200, campaign: 'aspen launch', script_schedule: 'am + pm', status: 'paid', telegram_username: 'degenalpha' },
  { id: '3', handle: '@solkingg', wallet: '9Rz...8c', rate: 500, campaign: 'aspen launch', script_schedule: 'am only', status: 'queued_pm', telegram_username: 'solkingg' },
  { id: '4', handle: '@frogdaddy', wallet: '2Kn...5p', rate: 2000, campaign: 'aspen launch', script_schedule: 'am + pm', status: 'paid', telegram_username: 'frogdaddy' },
];

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'aspen launch',
    ticker: 'ASPEN',
    cashtag: '$ASPEN',
    start_date: '2026-04-14',
    end_date: '2026-04-21',
    script_template: 'Hey {{handle}}, here\'s your script for {{cashtag}} today:\n\n{{angle}}\n\nMake sure to post between 8-10am EST. Tag $ASPEN and include the chart link.',
    status: 'active',
  },
];

export const mockScriptQueue: ScriptQueueItem[] = [
  { kolHandle: '@cryptomoon', angle: 'ivanka dog narrative + chart', sendMethod: 'auto tg dm', scheduledAt: '6:00 pm est' },
  { kolHandle: '@degenalpha', angle: 'supply control + holder growth', sendMethod: 'auto tg dm', scheduledAt: '6:00 pm est' },
  { kolHandle: '@solkingg', angle: 'new wallet count milestone', sendMethod: 'auto tg dm', scheduledAt: '6:00 pm est' },
];

export const mockAuditLog: AuditLog[] = [
  { id: '1', created_at: '2026-04-14T08:01:00Z', action: 'script_sent', kol_handle: '@cryptomoon', campaign_name: 'aspen launch', detail: 'AM script delivered via TG DM' },
  { id: '2', created_at: '2026-04-14T08:01:00Z', action: 'script_sent', kol_handle: '@degenalpha', campaign_name: 'aspen launch', detail: 'AM script delivered via TG DM' },
  { id: '3', created_at: '2026-04-14T07:55:00Z', action: 'payment', kol_handle: '@frogdaddy', campaign_name: 'aspen launch', detail: 'USDC batch payout', tx_hash: '5Kj...a2' },
  { id: '4', created_at: '2026-04-13T18:02:00Z', action: 'script_sent', kol_handle: '@solkingg', campaign_name: 'aspen launch', detail: 'PM script delivered via TG DM' },
  { id: '5', created_at: '2026-04-13T08:00:00Z', action: 'kol_added', kol_handle: '@frogdaddy', campaign_name: 'aspen launch', detail: 'KOL added to roster' },
];

export const mockPayments: PaymentRecord[] = [
  { id: '1', kol_handle: '@cryptomoon', wallet: '7Hx...9k', amount: 800, tx_hash: '5Kj...a2', created_at: '2026-04-14T07:55:00Z', status: 'confirmed' },
  { id: '2', kol_handle: '@degenalpha', wallet: '3Pq...2m', amount: 1200, tx_hash: '9Xp...f1', created_at: '2026-04-14T07:55:00Z', status: 'confirmed' },
  { id: '3', kol_handle: '@frogdaddy', wallet: '2Kn...5p', amount: 2000, tx_hash: '2Mn...c8', created_at: '2026-04-14T07:55:00Z', status: 'confirmed' },
];

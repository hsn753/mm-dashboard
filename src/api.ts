import axios from 'axios';
import type { KOL, Campaign, AuditLog, PaymentRecord, ScriptLog } from './types';

const BASE = import.meta.env.VITE_API_URL ?? '';

const http = axios.create({ baseURL: BASE, timeout: 10000 });

export const api = {
  kols: {
    list: () => http.get<KOL[]>('/api/kols').then((r) => r.data),
    create: (body: Omit<KOL, 'id' | 'status'>) => http.post<KOL>('/api/kols', body).then((r) => r.data),
    update: (id: string, body: Partial<KOL>) => http.put<KOL>(`/api/kols/${id}`, body).then((r) => r.data),
    remove: (id: string) => http.delete(`/api/kols/${id}`).then((r) => r.data),
  },
  campaigns: {
    list: () => http.get<Campaign[]>('/api/campaigns').then((r) => r.data),
    create: (body: Omit<Campaign, 'id' | 'status'>) => http.post<Campaign>('/api/campaigns', body).then((r) => r.data),
    update: (id: string, body: Partial<Campaign>) => http.put<Campaign>(`/api/campaigns/${id}`, body).then((r) => r.data),
    assign: (id: string, kol_ids: string[]) => http.post(`/api/campaigns/${id}/assign`, { kol_ids }).then((r) => r.data),
  },
  scripts: {
    distribute: (slot: 'am' | 'pm') => http.post('/api/scripts/distribute', { slot }).then((r) => r.data),
    log: () => http.get<ScriptLog[]>('/api/scripts/log').then((r) => r.data),
  },
  payments: {
    batch: (payments: Array<{ kol_id: string; wallet: string; amount: number }>) =>
      http.post('/api/payments/batch', { payments }).then((r) => r.data),
    history: () => http.get<PaymentRecord[]>('/api/payments/history').then((r) => r.data),
  },
  audit: {
    list: () => http.get<AuditLog[]>('/api/audit').then((r) => r.data),
  },
};

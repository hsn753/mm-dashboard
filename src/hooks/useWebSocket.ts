import { useEffect, useRef } from 'react';
import { useMMStore } from '../store';
import type { Transaction } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || null;

const TX_TYPES = ['buy', 'sell', 'mirror_buy', 'mirror_sell', 'fee_buy', 'sell_absorb'] as const;
const WALLETS = ['wlt_01', 'wlt_02', 'wlt_03', 'wlt_05', 'wlt_07', 'wlt_09', 'wlt_11'];

function randomTx(): Transaction {
  const type = TX_TYPES[Math.floor(Math.random() * TX_TYPES.length)];
  const size = Math.floor(Math.random() * 8000) + 50;
  const wallet = WALLETS[Math.floor(Math.random() * WALLETS.length)];
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const tx = Math.random().toString(36).substring(2, 5).toUpperCase() + '...' + Math.random().toString(36).substring(2, 4);
  return { id: crypto.randomUUID(), time, type, size, wallet, tx };
}

export function useWebSocket() {
  const { isPaused, addTransaction, setWsConnected } = useMMStore();
  const wsRef = useRef<WebSocket | null>(null);
  const mockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (WS_URL) {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => setWsConnected(false);
      ws.onerror = () => setWsConnected(false);
      ws.onmessage = (event) => {
        if (isPaused) return;
        try {
          const tx: Transaction = JSON.parse(event.data);
          addTransaction(tx);
        } catch {}
      };

      return () => {
        ws.close();
        setWsConnected(false);
      };
    } else {
      setWsConnected(false);
      mockIntervalRef.current = setInterval(() => {
        if (!isPaused) {
          addTransaction(randomTx());
        }
      }, 2500);

      return () => {
        if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
      };
    }
  }, [isPaused]);
}

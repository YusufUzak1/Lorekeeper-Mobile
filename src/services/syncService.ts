/* ─────────────────────────────────────────────
 * MYTHOS Lorekeeper — Sync Service (Mobile)
 * Bulut senkronizasyonu: state çekme & gönderme.
 * ───────────────────────────────────────────── */

import { apiFetch } from './apiService';

/**
 * Buluttan tüm state'i çeker.
 */
export async function fetchStateFromCloud() {
  return apiFetch('/sync', { method: 'GET' });
}

/**
 * Mevcut state'i buluta kaydeder.
 */
export async function syncStateToCloud(statePayload: any) {
  return apiFetch('/sync', {
    method: 'POST',
    body: statePayload,
  });
}

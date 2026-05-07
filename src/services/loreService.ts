/* ─────────────────────────────────────────────
 * MYTHOS Lorekeeper — Lore AI Service (Mobile)
 * Not → SQS kuyruğu → Lambda → Bedrock AI pipeline.
 * ───────────────────────────────────────────── */

import { apiFetch, getUserId } from './apiService';

/**
 * Bir lore notunu AI işleme kuyruğuna gönderir.
 */
export async function submitLoreNote(universeId: string, noteText: string) {
  const userId = await getUserId();

  if (!userId) {
    throw new Error('Kullanıcı kimliği alınamadı.');
  }

  return apiFetch('/lore', {
    method: 'POST',
    body: { userId, universeId, noteText },
  });
}

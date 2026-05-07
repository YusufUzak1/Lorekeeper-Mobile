/* ─────────────────────────────────────────────
 * MYTHOS Lorekeeper — API Service (Mobile)
 * Merkezi fetch wrapper: Token, Base URL, hata yönetimi.
 * ───────────────────────────────────────────── */

import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = process.env.EXPO_PUBLIC_API_ENDPOINT || '';

/**
 * Cognito ID token'ını getirir.
 * Misafir kullanıcılar için null döner.
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}

/**
 * Cognito sub (kullanıcı ID) getirir.
 */
export async function getUserId(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return (session.tokens?.idToken?.payload?.sub as string) ?? null;
  } catch {
    return null;
  }
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  requireAuth?: boolean;
}

/**
 * Merkezi API çağrı fonksiyonu.
 * Token otomatik eklenir, hata yönetimi standart.
 */
export async function apiFetch<T = any>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = 'GET', body, requireAuth = true } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
    }
    headers['Authorization'] = token;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    let errorMessage = `API hatası: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // JSON parse edilemedi, varsayılan mesaj kullan
    }
    throw new Error(errorMessage);
  }

  // 204 No Content durumunda boş döner
  if (response.status === 204) {
    return {} as T;
  }

  return await response.json();
}

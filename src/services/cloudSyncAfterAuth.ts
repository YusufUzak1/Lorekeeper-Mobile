import { Alert } from 'react-native';

import { useUniverseStore } from '../store/useUniverseStore';
import { sanitizeCloudState } from '../lib/syncPayload';
import { fetchStateFromCloud } from './syncService';

function hasMeaningfulLocalData(): boolean {
  const s = useUniverseStore.getState();
  return (
    s.universes.length > 0 ||
    s.entities.length > 0 ||
    s.notes.length > 0 ||
    s.myths.length > 0 ||
    s.timeline.length > 0
  );
}

function applyCloudPatch(patch: ReturnType<typeof sanitizeCloudState>) {
  useUniverseStore.getState().replaceState(patch);
}

/**
 * Cognito oturumu açıkken buluttan state çeker.
 * Yerel veri varsa kullanıcıya üzerine yazma onayı sorar.
 */
export async function pullCloudStateAfterAuth(): Promise<void> {
  const raw = await fetchStateFromCloud();
  if (raw == null) {
    return;
  }

  const patch = sanitizeCloudState(raw);

  if (!hasMeaningfulLocalData()) {
    applyCloudPatch(patch);
    return;
  }

  await new Promise<void>((resolve) => {
    Alert.alert(
      'Bulut verisi',
      'Cihazda yerel veri var. Web veya başka cihazdaki bulut yedeği yerelin üzerine yazılsın mı?',
      [
        {
          text: 'İptal',
          style: 'cancel',
          onPress: () => resolve(),
        },
        {
          text: 'Bulutu kullan',
          style: 'destructive',
          onPress: () => {
            applyCloudPatch(patch);
            resolve();
          },
        },
      ]
    );
  });
}

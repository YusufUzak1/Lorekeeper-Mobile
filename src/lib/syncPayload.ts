/** Web `syncStateToCloud(useUniverseStore.getState())` ile aynı serileştirilebilir alanlar. */
export interface CloudUniversePatch {
  currentUniverseId: string | null;
  universes: unknown[];
  entities: unknown[];
  connections: unknown[];
  myths: unknown[];
  timeline: unknown[];
  regions: unknown[];
  languages: unknown[];
  notes: unknown[];
  searchQuery: string;
  activeFilter: string;
}

function emptyPatch(): CloudUniversePatch {
  return {
    currentUniverseId: null,
    universes: [],
    entities: [],
    connections: [],
    myths: [],
    timeline: [],
    regions: [],
    languages: [],
    notes: [],
    searchQuery: '',
    activeFilter: 'all',
  };
}

/** Web `syncStateToCloud(useUniverseStore.getState())` ile aynı alan kümesi (yalnızca serileştirilebilir state). */
export function buildCloudSyncPayload(getState: () => Record<string, unknown>): CloudUniversePatch {
  const s = getState();
  return {
    currentUniverseId: (s.currentUniverseId as string | null | undefined) ?? null,
    universes: Array.isArray(s.universes) ? s.universes : [],
    entities: Array.isArray(s.entities) ? s.entities : [],
    connections: Array.isArray(s.connections) ? s.connections : [],
    myths: Array.isArray(s.myths) ? s.myths : [],
    timeline: Array.isArray(s.timeline) ? s.timeline : [],
    regions: Array.isArray(s.regions) ? s.regions : [],
    languages: Array.isArray(s.languages) ? s.languages : [],
    notes: Array.isArray(s.notes) ? s.notes : [],
    searchQuery: typeof s.searchQuery === 'string' ? s.searchQuery : '',
    activeFilter: typeof s.activeFilter === 'string' ? s.activeFilter : 'all',
  };
}

function ensureCurrentUniverseExists(patch: CloudUniversePatch): CloudUniversePatch {
  const universes = patch.universes ?? [];
  const ids = new Set(universes.map((u: unknown) => (u as { id?: string })?.id).filter(Boolean));
  const cur = patch.currentUniverseId;
  if (cur && !ids.has(cur)) {
    return { ...patch, currentUniverseId: null };
  }
  return patch;
}

/** Buluttan gelen ham JSON'u replaceState için güvenli hale getirir. */
export function sanitizeCloudState(raw: unknown): CloudUniversePatch {
  if (!raw || typeof raw !== 'object') {
    return emptyPatch();
  }
  return ensureCurrentUniverseExists(buildCloudSyncPayload(() => raw as Record<string, unknown>));
}

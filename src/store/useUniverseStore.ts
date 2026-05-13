/* ─────────────────────────────────────────────
 * MYTHOS Lorekeeper — Universe Store (Mobile)
 *
 * Merkezi Zustand store:
 *  • Tüm veri koleksiyonları (entities, connections, myths, timeline, regions, languages, notes)
 *  • CRUD aksiyonları
 *  • AsyncStorage persistence (zustand/middleware → persist)
 *  • Cloud sync desteği
 * ───────────────────────────────────────────── */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  Entity,
  EntityType,
  Connection,
  RelationType,
  MythCard,
  TimelineEvent,
  MapRegion,
  Language,
  Universe,
  Note,
} from '../types';

// ── Filtre Tipleri ──
export type EntityFilterType = EntityType | 'all';

// ── ID üretici ──
function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Store State ──
interface UniverseState {
  // ── Aktif evren ──
  currentUniverseId: string | null;
  universes: Universe[];

  // ── Veri koleksiyonları ──
  entities: Entity[];
  connections: Connection[];
  myths: MythCard[];
  timeline: TimelineEvent[];
  regions: MapRegion[];
  languages: Language[];
  notes: Note[];

  // ── Arama & Filtreleme ──
  searchQuery: string;
  activeFilter: EntityFilterType;
  setSearchQuery: (q: string) => void;
  setActiveFilter: (f: EntityFilterType) => void;

  // ── Evren aksiyonları ──
  replaceState: (newState: Partial<UniverseState>) => void;
  setCurrentUniverseId: (id: string | null) => void;
  addUniverse: (data: Omit<Universe, 'id' | 'createdAt'>) => Universe;
  deleteUniverse: (id: string) => void;

  // ── Entity CRUD ──
  addEntity: (data: Omit<Entity, 'id' | 'linkCount'>) => Entity;
  updateEntity: (id: string, data: Partial<Omit<Entity, 'id'>>) => void;
  deleteEntity: (id: string) => void;
  getEntitiesByType: (type: EntityType) => Entity[];
  getEntityById: (id: string) => Entity | undefined;

  // ── Connection CRUD ──
  addConnection: (sourceId: string, targetId: string, relation: RelationType) => Connection;
  deleteConnection: (id: string) => void;
  getConnectionsForEntity: (entityId: string) => Connection[];

  // ── Myth CRUD ──
  addMyth: (data: Omit<MythCard, 'id'>) => MythCard;
  updateMyth: (id: string, data: Partial<Omit<MythCard, 'id'>>) => void;
  deleteMyth: (id: string) => void;

  // ── Timeline CRUD ──
  addTimelineEvent: (data: Omit<TimelineEvent, 'id'>) => TimelineEvent;
  updateTimelineEvent: (id: string, data: Partial<Omit<TimelineEvent, 'id'>>) => void;
  deleteTimelineEvent: (id: string) => void;

  // ── Note CRUD ──
  addNote: (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, data: Partial<Omit<Note, 'id'>>) => void;
  deleteNote: (id: string) => void;

  // ── Region CRUD ──
  addRegion: (data: Omit<MapRegion, 'id'>) => MapRegion;
  deleteRegion: (id: string) => void;

  // ── Language CRUD ──
  addLanguage: (data: Omit<Language, 'id'>) => Language;
  updateLanguage: (id: string, data: Partial<Omit<Language, 'id'>>) => void;
  deleteLanguage: (id: string) => void;

  // ── Universe-scoped Getters ──
  getEntitiesForCurrentUniverse: () => Entity[];
  getConnectionsForCurrentUniverse: () => Connection[];
  getMythsForCurrentUniverse: () => MythCard[];
  getTimelineForCurrentUniverse: () => TimelineEvent[];
  getNotesForCurrentUniverse: () => Note[];
  getRegionsForCurrentUniverse: () => MapRegion[];
  getLanguagesForCurrentUniverse: () => Language[];
}

// ── Varsayılan state ──
const DEFAULT_STATE = {
  currentUniverseId: null as string | null,
  universes: [] as Universe[],
  entities: [] as Entity[],
  connections: [] as Connection[],
  myths: [] as MythCard[],
  timeline: [] as TimelineEvent[],
  regions: [] as MapRegion[],
  languages: [] as Language[],
  notes: [] as Note[],
  searchQuery: '',
  activeFilter: 'all' as EntityFilterType,
};

// ═══════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════

export const useUniverseStore = create<UniverseState>()(
  persist(
    (set, get) => ({
      // ── Init ──
      ...DEFAULT_STATE,

      // ─── Arama & Filtreleme ──────────────
      setSearchQuery: (q) => set({ searchQuery: q }),
      setActiveFilter: (f) => set({ activeFilter: f }),

      // ─── Evren ─────────────────────────────
      replaceState: (newState) => set((s) => ({ ...s, ...newState })),
      setCurrentUniverseId: (id) => set({ currentUniverseId: id }),

      addUniverse: (data) => {
        const newUniverse: Universe = {
          id: uid(),
          createdAt: new Date().toISOString(),
          ...data,
        };
        set((s) => ({ universes: [...s.universes, newUniverse] }));
        return newUniverse;
      },

      deleteUniverse: (id) =>
        set((s) => ({
          universes: s.universes.filter((u) => u.id !== id),
          currentUniverseId: s.currentUniverseId === id ? null : s.currentUniverseId,
          entities: s.entities.filter((e) => e.universeId !== id),
          connections: s.connections.filter((c) => c.universeId !== id),
          myths: s.myths.filter((m) => m.universeId !== id),
          timeline: s.timeline.filter((t) => t.universeId !== id),
          regions: s.regions.filter((r) => r.universeId !== id),
          languages: s.languages.filter((l) => l.universeId !== id),
          notes: s.notes.filter((n) => n.universeId !== id),
        })),

      // ─── Entity ────────────────────────────
      addEntity: (data) => {
        const { currentUniverseId } = get();
        if (!currentUniverseId) {
          throw new Error('Bir evren seçilmeden varlık eklenemez.');
        }
        const newEntity: Entity = { id: uid(), linkCount: 0, universeId: currentUniverseId, ...data };
        set((s) => ({ entities: [...s.entities, newEntity] }));
        return newEntity;
      },

      updateEntity: (id, data) =>
        set((s) => ({
          entities: s.entities.map((e) => (e.id === id ? { ...e, ...data } : e)),
        })),

      deleteEntity: (id) =>
        set((s) => ({
          entities: s.entities.filter((e) => e.id !== id),
          connections: s.connections.filter(
            (c) => c.sourceId !== id && c.targetId !== id
          ),
        })),

      getEntitiesByType: (type) => {
        const { entities, currentUniverseId } = get();
        if (!currentUniverseId) return [];
        return entities.filter((e) => e.type === type && e.universeId === currentUniverseId);
      },

      getEntityById: (id) => {
        const { entities, currentUniverseId } = get();
        return entities.find((e) => e.id === id && e.universeId === currentUniverseId);
      },

      // ─── Connection ────────────────────────
      addConnection: (sourceId, targetId, relation) => {
        const universeId = get().currentUniverseId || undefined;
        const newConn: Connection = { id: uid(), universeId, sourceId, targetId, relation };
        set((s) => ({
          connections: [...s.connections, newConn],
          entities: s.entities.map((e) => {
            if (e.id === sourceId || e.id === targetId) {
              return { ...e, linkCount: (e.linkCount || 0) + 1 };
            }
            return e;
          }),
        }));
        return newConn;
      },

      deleteConnection: (id) =>
        set((s) => {
          const conn = s.connections.find((c) => c.id === id);
          if (!conn) return s;
          return {
            connections: s.connections.filter((c) => c.id !== id),
            entities: s.entities.map((e) => {
              if (e.id === conn.sourceId || e.id === conn.targetId) {
                return { ...e, linkCount: Math.max(0, (e.linkCount || 0) - 1) };
              }
              return e;
            }),
          };
        }),

      getConnectionsForEntity: (entityId) => {
        const { connections } = get();
        return connections.filter(
          (c) => c.sourceId === entityId || c.targetId === entityId
        );
      },

      // ─── Myth ──────────────────────────────
      addMyth: (data) => {
        const universeId = get().currentUniverseId || undefined;
        const newMyth: MythCard = { id: uid(), universeId, ...data };
        set((s) => ({ myths: [...s.myths, newMyth] }));
        return newMyth;
      },

      updateMyth: (id, data) =>
        set((s) => ({
          myths: s.myths.map((m) => (m.id === id ? { ...m, ...data } : m)),
        })),

      deleteMyth: (id) =>
        set((s) => ({ myths: s.myths.filter((m) => m.id !== id) })),

      // ─── Timeline ─────────────────────────
      addTimelineEvent: (data) => {
        const universeId = get().currentUniverseId || undefined;
        const newEvent: TimelineEvent = { id: uid(), universeId, ...data };
        set((s) => ({ timeline: [...s.timeline, newEvent] }));
        return newEvent;
      },

      updateTimelineEvent: (id, data) =>
        set((s) => ({
          timeline: s.timeline.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),

      deleteTimelineEvent: (id) =>
        set((s) => ({
          timeline: s.timeline.filter((t) => t.id !== id),
        })),

      // ─── Note ──────────────────────────
      addNote: (data) => {
        const universeId = get().currentUniverseId || undefined;
        const newNote: Note = {
          id: uid(),
          universeId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...data,
        };
        set((s) => ({ notes: [...s.notes, newNote] }));
        return newNote;
      },

      updateNote: (id, data) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n
          ),
        })),

      deleteNote: (id) =>
        set((s) => ({
          notes: s.notes.filter((n) => n.id !== id),
        })),

      // ─── Region ─────────────────────────
      addRegion: (data) => {
        const universeId = get().currentUniverseId || undefined;
        const newRegion: MapRegion = { id: uid(), universeId, ...data };
        set((s) => ({ regions: [...s.regions, newRegion] }));
        return newRegion;
      },

      deleteRegion: (id) =>
        set((s) => ({ regions: s.regions.filter((r) => r.id !== id) })),

      // ─── Language ───────────────────────
      addLanguage: (data) => {
        const universeId = get().currentUniverseId || undefined;
        const newLang: Language = { id: uid(), universeId, ...data };
        set((s) => ({ languages: [...s.languages, newLang] }));
        return newLang;
      },

      updateLanguage: (id, data) =>
        set((s) => ({
          languages: s.languages.map((l) => (l.id === id ? { ...l, ...data } : l)),
        })),

      deleteLanguage: (id) =>
        set((s) => ({ languages: s.languages.filter((l) => l.id !== id) })),

      // ─── Universe-scoped Getters ─────────
      getEntitiesForCurrentUniverse: () => {
        const { entities, currentUniverseId } = get();
        if (!currentUniverseId) return [];
        return entities.filter((e) => e.universeId === currentUniverseId);
      },

      getConnectionsForCurrentUniverse: () => {
        const { connections, currentUniverseId } = get();
        if (!currentUniverseId) return [];
        return connections.filter((c) => c.universeId === currentUniverseId);
      },

      getMythsForCurrentUniverse: () => {
        const { myths, currentUniverseId } = get();
        if (!currentUniverseId) return [];
        return myths.filter((m) => m.universeId === currentUniverseId);
      },

      getTimelineForCurrentUniverse: () => {
        const { timeline, currentUniverseId } = get();
        if (!currentUniverseId) return [];
        return timeline.filter((t) => t.universeId === currentUniverseId);
      },

      getNotesForCurrentUniverse: () => {
        const { notes, currentUniverseId } = get();
        if (!currentUniverseId) return [];
        return notes.filter((n) => n.universeId === currentUniverseId);
      },

      getRegionsForCurrentUniverse: () => {
        const { regions, currentUniverseId } = get();
        if (!currentUniverseId) return [];
        return regions.filter((r) => r.universeId === currentUniverseId);
      },

      getLanguagesForCurrentUniverse: () => {
        const { languages, currentUniverseId } = get();
        if (!currentUniverseId) return [];
        return languages.filter((l) => l.universeId === currentUniverseId);
      },
    }),
    {
      name: 'mythos-universe-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,

      // Rehydrate sonrası orphan temizliği
      onRehydrateStorage: () => (state) => {
        if (state) {
          const validIds = new Set(state.universes.map((u) => u.id));
          const isValid = (uid: string | undefined) => !!uid && validIds.has(uid);

          const cleanEntities = state.entities.filter((e) => isValid(e.universeId));
          const cleanConnections = state.connections.filter((c) => isValid(c.universeId));
          const cleanMyths = state.myths.filter((m) => isValid(m.universeId));
          const cleanTimeline = state.timeline.filter((t) => isValid(t.universeId));
          const cleanRegions = state.regions.filter((r) => isValid(r.universeId));
          const cleanLanguages = state.languages.filter((l) => isValid(l.universeId));
          const cleanNotes = (state.notes || []).filter((n) => isValid(n.universeId));

          const hasOrphans =
            cleanEntities.length !== state.entities.length ||
            cleanConnections.length !== state.connections.length ||
            cleanMyths.length !== state.myths.length ||
            cleanTimeline.length !== state.timeline.length ||
            cleanRegions.length !== state.regions.length ||
            cleanLanguages.length !== state.languages.length ||
            cleanNotes.length !== (state.notes?.length || 0);

          if (hasOrphans) {
            setTimeout(() => {
              useUniverseStore.setState({
                entities: cleanEntities,
                connections: cleanConnections,
                myths: cleanMyths,
                timeline: cleanTimeline,
                regions: cleanRegions,
                languages: cleanLanguages,
                notes: cleanNotes,
              });
            }, 0);
          }
        }
      },
    }
  )
);

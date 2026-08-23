import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Beetle, BottleChange, BreedingLine, Larva } from "@/types/kuwagata";
import { mockBeetles, mockLarvae, mockLines } from "@/lib/kuwagataMockData";

interface KuwagataStore {
  beetles: Beetle[];
  lines: BreedingLine[];
  larvae: Larva[];

  addBeetle: (beetle: Beetle) => void;
  updateBeetle: (id: string, updates: Partial<Beetle>) => void;
  deleteBeetle: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getBeetle: (id: string) => Beetle | undefined;

  addLine: (line: BreedingLine) => void;
  updateLine: (id: string, updates: Partial<BreedingLine>) => void;
  deleteLine: (id: string) => void;
  getLine: (id: string) => BreedingLine | undefined;

  addLarva: (larva: Larva) => void;
  updateLarva: (id: string, updates: Partial<Larva>) => void;
  deleteLarva: (id: string) => void;
  getLarva: (id: string) => Larva | undefined;
  addBottleChange: (larvaId: string, change: BottleChange) => void;

  getLarvaeByLine: (lineId: string) => Larva[];
}

export const useKuwagataStore = create<KuwagataStore>()(
  persist(
    (set, get) => ({
      beetles: mockBeetles,
      lines: mockLines,
      larvae: mockLarvae,

      addBeetle: (beetle) => set((s) => ({ beetles: [...s.beetles, beetle] })),

      updateBeetle: (id, updates) =>
        set((s) => ({
          beetles: s.beetles.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),

      deleteBeetle: (id) =>
        set((s) => ({ beetles: s.beetles.filter((b) => b.id !== id) })),

      toggleFavorite: (id) =>
        set((s) => ({
          beetles: s.beetles.map((b) =>
            b.id === id ? { ...b, isFavorite: !b.isFavorite } : b
          ),
        })),

      getBeetle: (id) => get().beetles.find((b) => b.id === id),

      addLine: (line) => set((s) => ({ lines: [...s.lines, line] })),

      updateLine: (id, updates) =>
        set((s) => ({
          lines: s.lines.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        })),

      deleteLine: (id) =>
        set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),

      getLine: (id) => get().lines.find((l) => l.id === id),

      addLarva: (larva) => set((s) => ({ larvae: [...s.larvae, larva] })),

      updateLarva: (id, updates) =>
        set((s) => ({
          larvae: s.larvae.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        })),

      deleteLarva: (id) =>
        set((s) => ({ larvae: s.larvae.filter((l) => l.id !== id) })),

      getLarva: (id) => get().larvae.find((l) => l.id === id),

      addBottleChange: (larvaId, change) =>
        set((s) => ({
          larvae: s.larvae.map((l) =>
            l.id === larvaId
              ? { ...l, bottleChanges: [...l.bottleChanges, change] }
              : l
          ),
        })),

      getLarvaeByLine: (lineId) =>
        get().larvae.filter((l) => l.lineId === lineId),
    }),
    {
      name: "kuwagata-storage",
      merge: (persisted: unknown, current) => {
        const p = persisted as Partial<KuwagataStore>;
        return {
          ...current,
          beetles: p?.beetles?.length ? p.beetles : current.beetles,
          lines: p?.lines?.length ? p.lines : current.lines,
          larvae: p?.larvae?.length ? p.larvae : current.larvae,
        };
      },
    }
  )
);

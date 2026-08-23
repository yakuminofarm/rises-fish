import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Beetle, BottleChange, BreedingLine, Expense, Larva } from "@/types/kuwagata";
import { mockBeetles, mockExpenses, mockLarvae, mockLines } from "@/lib/kuwagataMockData";

interface KuwagataStore {
  beetles: Beetle[];
  lines: BreedingLine[];
  larvae: Larva[];
  expenses: Expense[];

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
  updateBottleChange: (larvaId: string, changeId: string, updates: Partial<BottleChange>) => void;
  deleteBottleChange: (larvaId: string, changeId: string) => void;

  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  getLarvaeByLine: (lineId: string) => Larva[];
}

export const useKuwagataStore = create<KuwagataStore>()(
  persist(
    (set, get) => ({
      beetles: mockBeetles,
      lines: mockLines,
      larvae: mockLarvae,
      expenses: mockExpenses,

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

      updateBottleChange: (larvaId, changeId, updates) =>
        set((s) => ({
          larvae: s.larvae.map((l) =>
            l.id === larvaId
              ? {
                  ...l,
                  bottleChanges: l.bottleChanges.map((c) =>
                    c.id === changeId ? { ...c, ...updates } : c
                  ),
                }
              : l
          ),
        })),

      deleteBottleChange: (larvaId, changeId) =>
        set((s) => ({
          larvae: s.larvae.map((l) =>
            l.id === larvaId
              ? { ...l, bottleChanges: l.bottleChanges.filter((c) => c.id !== changeId) }
              : l
          ),
        })),

      addExpense: (expense) => set((s) => ({ expenses: [...s.expenses, expense] })),

      updateExpense: (id, updates) =>
        set((s) => ({
          expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),

      deleteExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

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
          expenses: p?.expenses?.length ? p.expenses : current.expenses,
        };
      },
    }
  )
);

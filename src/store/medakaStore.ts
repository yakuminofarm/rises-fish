import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Medaka, BreedingRecord, MedakaPhoto, MedakaTrait } from "@/types/medaka";
import { mockMedakas, mockBreedingRecords } from "@/lib/mockData";

interface MedakaStore {
  medakas: Medaka[];
  breedingRecords: BreedingRecord[];

  addMedaka: (medaka: Medaka) => void;
  updateMedaka: (id: string, updates: Partial<Medaka>) => void;
  deleteMedaka: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getMedaka: (id: string) => Medaka | undefined;

  addPhoto: (medakaId: string, photo: MedakaPhoto) => void;
  removePhoto: (medakaId: string, photoId: string) => void;

  addTrait: (medakaId: string, trait: MedakaTrait) => void;

  addBreedingRecord: (record: BreedingRecord) => void;
  updateBreedingRecord: (id: string, updates: Partial<BreedingRecord>) => void;
  getBreedingRecord: (id: string) => BreedingRecord | undefined;

  getChildren: (medakaId: string) => Medaka[];
  getParents: (medakaId: string) => { father?: Medaka; mother?: Medaka };
  getLineage: (medakaId: string, depth?: number) => LineageNode | null;
}

export interface LineageNode {
  medaka: Medaka;
  father?: LineageNode;
  mother?: LineageNode;
}

export const useMedakaStore = create<MedakaStore>()(
  persist(
    (set, get) => ({
      medakas: mockMedakas,
      breedingRecords: mockBreedingRecords,

      addMedaka: (medaka) =>
        set((s) => ({ medakas: [...s.medakas, medaka] })),

      updateMedaka: (id, updates) =>
        set((s) => ({
          medakas: s.medakas.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),

      deleteMedaka: (id) =>
        set((s) => ({ medakas: s.medakas.filter((m) => m.id !== id) })),

      toggleFavorite: (id) =>
        set((s) => ({
          medakas: s.medakas.map((m) =>
            m.id === id ? { ...m, isFavorite: !m.isFavorite } : m
          ),
        })),

      getMedaka: (id) => get().medakas.find((m) => m.id === id),

      addPhoto: (medakaId, photo) =>
        set((s) => ({
          medakas: s.medakas.map((m) =>
            m.id === medakaId ? { ...m, photos: [...m.photos, photo] } : m
          ),
        })),

      removePhoto: (medakaId, photoId) =>
        set((s) => ({
          medakas: s.medakas.map((m) =>
            m.id === medakaId
              ? { ...m, photos: m.photos.filter((p) => p.id !== photoId) }
              : m
          ),
        })),

      addTrait: (medakaId, trait) =>
        set((s) => ({
          medakas: s.medakas.map((m) =>
            m.id === medakaId ? { ...m, traits: [...m.traits, trait] } : m
          ),
        })),

      addBreedingRecord: (record) =>
        set((s) => ({ breedingRecords: [...s.breedingRecords, record] })),

      updateBreedingRecord: (id, updates) =>
        set((s) => ({
          breedingRecords: s.breedingRecords.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      getBreedingRecord: (id) =>
        get().breedingRecords.find((r) => r.id === id),

      getChildren: (medakaId) => {
        const { medakas } = get();
        return medakas.filter(
          (m) =>
            m.parentIds?.father === medakaId || m.parentIds?.mother === medakaId
        );
      },

      getParents: (medakaId) => {
        const medaka = get().getMedaka(medakaId);
        if (!medaka) return {};
        return {
          father: medaka.parentIds?.father
            ? get().getMedaka(medaka.parentIds.father)
            : undefined,
          mother: medaka.parentIds?.mother
            ? get().getMedaka(medaka.parentIds.mother)
            : undefined,
        };
      },

      getLineage: (medakaId, depth = 3): LineageNode | null => {
        const medaka = get().getMedaka(medakaId);
        if (!medaka || depth === 0) return medaka ? { medaka } : null;
        const parents = get().getParents(medakaId);
        return {
          medaka,
          father: parents.father
            ? get().getLineage(parents.father.id, depth - 1) ?? undefined
            : undefined,
          mother: parents.mother
            ? get().getLineage(parents.mother.id, depth - 1) ?? undefined
            : undefined,
        };
      },
    }),
    {
      name: "medaka-storage",
      merge: (persisted: unknown, current) => {
        const p = persisted as Partial<MedakaStore>;
        return {
          ...current,
          medakas: p?.medakas?.length ? p.medakas : current.medakas,
          breedingRecords: p?.breedingRecords?.length ? p.breedingRecords : current.breedingRecords,
        };
      },
    }
  )
);

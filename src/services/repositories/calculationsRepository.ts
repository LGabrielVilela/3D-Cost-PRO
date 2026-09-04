import { LocalStorageAdapter, STORAGE_KEYS } from "@/services/storage/localStorageAdapter";
import type { Calculation } from "@/types/entities";
import { BaseRepository } from "./baseRepository";

export const calculationsRepository = new BaseRepository<Calculation>(
  new LocalStorageAdapter<Calculation>(STORAGE_KEYS.calculations),
);

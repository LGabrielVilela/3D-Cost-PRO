import { LocalStorageAdapter, STORAGE_KEYS } from "@/services/storage/localStorageAdapter";
import type { Material } from "@/types/entities";
import { BaseRepository } from "./baseRepository";

export const materialsRepository = new BaseRepository<Material>(
  new LocalStorageAdapter<Material>(STORAGE_KEYS.materials),
);

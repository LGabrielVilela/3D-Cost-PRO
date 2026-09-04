import { LocalStorageAdapter, STORAGE_KEYS } from "@/services/storage/localStorageAdapter";
import type { Printer } from "@/types/entities";
import { BaseRepository } from "./baseRepository";

export const printersRepository = new BaseRepository<Printer>(
  new LocalStorageAdapter<Printer>(STORAGE_KEYS.printers),
);

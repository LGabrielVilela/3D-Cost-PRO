import { LocalStorageAdapter, STORAGE_KEYS } from "@/services/storage/localStorageAdapter";
import type { Client } from "@/types/entities";
import { BaseRepository } from "./baseRepository";

export const clientsRepository = new BaseRepository<Client>(
  new LocalStorageAdapter<Client>(STORAGE_KEYS.clients),
);

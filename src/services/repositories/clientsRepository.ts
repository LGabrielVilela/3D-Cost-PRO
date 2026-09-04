import * as clientsActions from "@/services/db/clientsActions";
import { ServerActionAdapter } from "@/services/storage/serverActionAdapter";
import type { Client } from "@/types/entities";
import { BaseRepository } from "./baseRepository";

export const clientsRepository = new BaseRepository<Client>(
  new ServerActionAdapter<Client>(clientsActions),
);

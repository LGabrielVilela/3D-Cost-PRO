import * as printersActions from "@/services/db/printersActions";
import { ServerActionAdapter } from "@/services/storage/serverActionAdapter";
import type { Printer } from "@/types/entities";
import { BaseRepository } from "./baseRepository";

export const printersRepository = new BaseRepository<Printer>(
  new ServerActionAdapter<Printer>(printersActions),
);

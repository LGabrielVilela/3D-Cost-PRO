import * as calculationsActions from "@/services/db/calculationsActions";
import { ServerActionAdapter } from "@/services/storage/serverActionAdapter";
import type { Calculation } from "@/types/entities";
import { BaseRepository } from "./baseRepository";

export const calculationsRepository = new BaseRepository<Calculation>(
  new ServerActionAdapter<Calculation>(calculationsActions),
);

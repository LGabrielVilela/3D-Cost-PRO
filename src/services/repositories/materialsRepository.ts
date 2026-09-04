import * as materialsActions from "@/services/db/materialsActions";
import { ServerActionAdapter } from "@/services/storage/serverActionAdapter";
import type { Material } from "@/types/entities";
import { BaseRepository } from "./baseRepository";

export const materialsRepository = new BaseRepository<Material>(
  new ServerActionAdapter<Material>(materialsActions),
);

"use client";

import { useCallback, useEffect, useState } from "react";

import type { BaseRepository } from "@/services/repositories/baseRepository";
import type { BaseEntity } from "@/types/entities";

export interface EntityCollection<T extends BaseEntity> {
  items: T[];
  loading: boolean;
  reload: () => Promise<void>;
  create: (data: Omit<T, "id" | "createdAt" | "updatedAt">) => Promise<T>;
  update: (id: string, patch: Partial<Omit<T, "id" | "createdAt">>) => Promise<T | undefined>;
  remove: (id: string) => Promise<void>;
}

/**
 * Hook genérico de coleção CRUD sobre um `BaseRepository`. Concentra a
 * lógica de carregar/criar/editar/excluir num único lugar — usado tanto
 * pelos hooks de leitura da calculadora (`useMaterials`, `usePrinters`)
 * quanto pelas telas de cadastro, para nunca duplicar essa lógica.
 */
export function useEntityCollection<T extends BaseEntity>(
  repository: BaseRepository<T>,
): EntityCollection<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const list = await repository.list();
    setItems(list);
    setLoading(false);
  }, [repository]);

  useEffect(() => {
    let cancelled = false;
    repository.list().then((list) => {
      if (!cancelled) {
        setItems(list);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [repository]);

  const create = useCallback<EntityCollection<T>["create"]>(
    async (data) => {
      const created = await repository.create(data);
      await reload();
      return created;
    },
    [repository, reload],
  );

  const update = useCallback<EntityCollection<T>["update"]>(
    async (id, patch) => {
      const updated = await repository.update(id, patch);
      await reload();
      return updated;
    },
    [repository, reload],
  );

  const remove = useCallback(
    async (id: string) => {
      await repository.remove(id);
      await reload();
    },
    [repository, reload],
  );

  return { items, loading, reload, create, update, remove };
}

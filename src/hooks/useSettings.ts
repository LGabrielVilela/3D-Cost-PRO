"use client";

import { useCallback, useEffect, useState } from "react";

import { DEFAULT_SETTINGS, settingsRepository } from "@/services/repositories/settingsRepository";
import type { AppSettings } from "@/types/entities";

/** Configurações do app (empresa, precificação, orçamento, identidade visual). */
export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    settingsRepository.get().then((current) => {
      if (!cancelled) {
        setSettings(current);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const save = useCallback(async (next: AppSettings) => {
    const saved = await settingsRepository.save(next);
    setSettings(saved);
    return saved;
  }, []);

  return { settings, loading, save, reload };
}

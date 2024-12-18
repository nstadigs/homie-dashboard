import { z } from "zod";

// @deno-types="@types/react"
import React from "react";

const STORAGE_KEY = "homie5_environments";

export const EnvironmentConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  broker_url: z.string(),
  username: z.string(),
  password: z.string(),
  homie_namespace: z.string(),
});

export type EnvironmentConfig = z.infer<typeof EnvironmentConfigSchema>;

let environmentConfigs: Map<string, EnvironmentConfig>;

try {
  const json = localStorage.getItem(STORAGE_KEY);
  const data = JSON.parse(json ?? "[]");
  environmentConfigs = new Map(data);
} catch (_) {
  environmentConfigs = new Map();
}

const listeners = new Set<() => void>();

export function get(id: string) {
  return environmentConfigs.get(id);
}

export function set(id: string, value: Record<string, unknown>) {
  const result = EnvironmentConfigSchema.safeParse({ ...value, id });

  if (result.success) {
    environmentConfigs.set(id, result.data);
    updateStorage();
    cachedEnvironmentsArr = null;
    listeners.forEach((listener) => listener());
  }

  return result;
}

export function add(value: Record<string, unknown>) {
  const id = globalThis.crypto.randomUUID();
  const environment = { ...value, id };

  return set(id, environment);
}

export function remove(id: string) {
  environmentConfigs.delete(id);
  updateStorage();
  cachedEnvironmentsArr = null;
  listeners.forEach((listener) => listener());
}

function updateStorage() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...environmentConfigs.entries()])
  );
}

let cachedEnvironmentsArr: EnvironmentConfig[] | null = null;

export function onChange(fn: () => void) {
  listeners.add(fn);

  return () => {
    listeners.delete(fn);
  };
}

export function useEnvironmentConfigs() {
  return React.useSyncExternalStore(
    (fn) => onChange(fn),
    () => (cachedEnvironmentsArr ??= Array.from(environmentConfigs.values()))
  );
}

export function useEnvironmentConfig(id: string) {
  return React.useSyncExternalStore(
    (fn) => onChange(fn),
    () => environmentConfigs.get(id)
  );
}

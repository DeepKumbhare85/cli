import fs from "node:fs";
import path from "node:path";
import {
  MANIFEST_FILENAME,
  ManifestEntry,
  SHADCN_REGISTRY_FILENAME,
} from "./cli.js";
import { clientPaths } from "./config.js";
import type { ClientConfig, ValidClient } from "./types.js";

export function getConfigPath(client: ValidClient): string {
  const configPath = clientPaths[client];
  if (!configPath) {
    throw new Error(`Invalid client: ${client}`);
  }
  return configPath;
}

export function readConfig(client: ValidClient): ClientConfig {
  const configPath = getConfigPath(client);

  if (!fs.existsSync(configPath)) {
    return { mcpServers: {} };
  }

  try {
    const rawConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    return {
      ...rawConfig,
      mcpServers: rawConfig.mcpServers || {},
    };
  } catch (error) {
    return { mcpServers: {} };
  }
}

export function writeConfig(client: ValidClient, config: ClientConfig): void {
  const configPath = getConfigPath(client);
  const configDir = path.dirname(configPath);

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  if (!config.mcpServers || typeof config.mcpServers !== "object") {
    throw new Error("Invalid mcpServers structure");
  }

  let existingConfig: ClientConfig = { mcpServers: {} };
  try {
    if (fs.existsSync(configPath)) {
      existingConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
  } catch (error) {
    // If reading fails, continue with empty existing config
  }

  const mergedConfig = {
    ...existingConfig,
    mcpServers: {
      ...existingConfig.mcpServers,
      ...config.mcpServers,
    },
  };

  fs.writeFileSync(configPath, JSON.stringify(mergedConfig, null, 2));
}

interface ShadcnRegistryItem {
  name: string;
  [key: string]: any;
}

interface ShadcnRegistry {
  $schema?: string;
  name?: string;
  homepage?: string;
  items: ShadcnRegistryItem[];
}

/**
 * Recreate shadcn's registry.json from all entries in 21st-registry.json that have a registryItem field.
 * Preserves $schema, name, and homepage if they existed before.
 */
export function recreateShadcnRegistryJson() {
  const manifestPath = path.join(process.cwd(), MANIFEST_FILENAME);
  if (!fs.existsSync(manifestPath)) {
    console.warn(
      "Warning: 21st-registry.json not found. Skipping shadcn registry recreation."
    );
    return;
  }
  const manifest: ManifestEntry[] = JSON.parse(
    fs.readFileSync(manifestPath, "utf-8")
  );

  const shadcnRegistryPath = path.join(process.cwd(), SHADCN_REGISTRY_FILENAME);
  if (!fs.existsSync(shadcnRegistryPath)) {
    console.warn(
      "Warning: registry.json not found. Skipping shadcn registry recreation."
    );
    return;
  }
  const prev = JSON.parse(fs.readFileSync(shadcnRegistryPath, "utf-8"));

  const items = manifest
    .map((entry) => entry.registryItem)
    .filter((item) => !!item);
  const registry: ShadcnRegistry = { ...prev, items: items };
  fs.writeFileSync(shadcnRegistryPath, JSON.stringify(registry, null, 2));
}

// Helper function to normalize file paths
export const normalizePath = (filePath: string): string => {
  return filePath.startsWith("/") ? filePath.substring(1) : filePath;
};

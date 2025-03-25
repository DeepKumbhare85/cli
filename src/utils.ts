import fs from "node:fs";
import path from "node:path";
import type { ValidClient, ClientConfig } from "./types.js";
import { clientPaths } from "./config.js";

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
    return { servers: {} };
  }

  try {
    const rawConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    return {
      ...rawConfig,
      servers: rawConfig.servers || {},
    };
  } catch (error) {
    return { servers: {} };
  }
}

export function writeConfig(client: ValidClient, config: ClientConfig): void {
  const configPath = getConfigPath(client);
  const configDir = path.dirname(configPath);

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  if (!config.servers || typeof config.servers !== "object") {
    throw new Error("Invalid servers structure");
  }

  let existingConfig: ClientConfig = { servers: {} };
  try {
    if (fs.existsSync(configPath)) {
      existingConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
  } catch (error) {
    // If reading fails, continue with empty existing config
  }

  const mergedConfig = {
    ...existingConfig,
    ...config,
  };

  fs.writeFileSync(configPath, JSON.stringify(mergedConfig, null, 2));
}

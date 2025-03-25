#!/usr/bin/env node

import { Command } from "commander";
import { install } from "./index.js";
import { VALID_CLIENTS } from "./types.js";
import chalk from "chalk";

const program = new Command();

program
  .name("21st-dev-cli")
  .description("Install MCP configuration for various AI clients")
  .version("1.0.0");

program
  .command("install")
  .description("Install MCP configuration for a specific client")
  .argument(
    "<client>",
    `The client to install for (${VALID_CLIENTS.join(", ")})`
  )
  .action(async (client: string) => {
    if (!VALID_CLIENTS.includes(client as any)) {
      console.error(
        chalk.red(
          `Invalid client "${client}". Available clients: ${VALID_CLIENTS.join(
            ", "
          )}`
        )
      );
      process.exit(1);
    }

    try {
      await install(client as any);
    } catch (error) {
      process.exit(1);
    }
  });

program.parse();

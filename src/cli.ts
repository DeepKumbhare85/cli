#!/usr/bin/env node

import { Command } from "commander";
import { install } from "./index.js";
import { VALID_CLIENTS } from "./types.js";
import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const program = new Command();

const MANIFEST_FILENAME = ".21st-registry.json";

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
  .option("--api-key <key>", "API key for 21st.dev services")
  .action(async (client: string, options: { apiKey?: string }) => {
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
      await install(client as any, { apiKey: options.apiKey });
    } catch (error) {
      console.error(
        chalk.red(
          error instanceof Error ? error.message : "Unknown error occurred"
        )
      );
      process.exit(1);
    }
  });

program
  .command("add")
  .description("Add a new UI component using shadcn/ui and track it.")
  .argument(
    "<component>",
    "Component name or URL (e.g., button, https://21st.dev/r/...)"
  )
  .action((component: string) => {
    const manifestPath = path.join(process.cwd(), MANIFEST_FILENAME);
    try {
      console.log(chalk.blue(`Adding component: ${component}...`));
      execSync(`npx shadcn@latest add ${component}`, { stdio: "inherit" });
      console.log(chalk.green(`Successfully added component: ${component}!`));

      let manifest: string[] = [];
      try {
        if (fs.existsSync(manifestPath)) {
          const fileContent = fs.readFileSync(manifestPath, "utf-8");
          manifest = JSON.parse(fileContent);
          if (
            !Array.isArray(manifest) ||
            !manifest.every((item) => typeof item === "string")
          ) {
            console.warn(
              chalk.yellow(
                `Warning: Manifest file ${MANIFEST_FILENAME} was malformed. Initializing a new one.`
              )
            );
            manifest = [];
          }
        }
      } catch (error) {
        console.warn(
          chalk.yellow(
            `Warning: Could not read or parse ${MANIFEST_FILENAME}. Initializing a new one. Error: ${
              error instanceof Error ? error.message : String(error)
            }`
          )
        );
        manifest = [];
      }

      if (!manifest.includes(component)) {
        manifest.push(component);
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        console.log(
          chalk.cyan(
            `Component "${component}" has been added to ${MANIFEST_FILENAME}.`
          )
        );
      } else {
        console.log(
          chalk.cyan(
            `Component "${component}" was already tracked in ${MANIFEST_FILENAME}.`
          )
        );
      }
    } catch (error) {
      console.error(
        chalk.red(
          `Failed to add component "${component}". Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        )
      );
      // Do not exit(1) here if manifest update fails, as the shadcn part might have succeeded.
      // Consider how to handle partial failures if shadcn succeeds but manifest write fails.
      // For now, we just log the error and the main process continues.
      // If shadcn itself failed, execSync would have thrown, and we'd be in this catch block.
      // If that's the case, and it's a critical failure, then:
      if (
        error &&
        (error as any).status !== null &&
        (error as any).status !== 0
      ) {
        // check if it's an error from execSync
        process.exit(1);
      }
    }
  });

program.parse();

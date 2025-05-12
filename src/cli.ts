#!/usr/bin/env node

import { Command } from "commander";
import { install } from "./index.js";
import { VALID_CLIENTS } from "./types.js";
import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
// Note: Native fetch is available in Node.js v18+.
// If older Node version, consider using a library like node-fetch.

const program = new Command();

const MANIFEST_FILENAME = "21st-registry.json";

interface ManifestEntry {
  name: string; // From registry-item.json or the direct name provided
  sourceUrl?: string; // The URL it was fetched from, if applicable
  sourceType: "url_success" | "direct_name" | "url_fetch_failed";
  registryItem?: any; // The actual fetched JSON content if sourceType is 'url_success'
  fetchError?: string; // Error message if sourceType is 'url_fetch_failed'
  addedByCLI: true;
}

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
  .description(
    "Add a new UI component using shadcn/ui and update the registry."
  )
  .argument(
    "<componentIdentifier>",
    "Component name (e.g., button) or URL to component's registry JSON (e.g., https://21st.dev/r/...)"
  )
  .action(async (componentIdentifier: string) => {
    const manifestPath = path.join(process.cwd(), MANIFEST_FILENAME);
    let newEntry: ManifestEntry | null = null;

    console.log(chalk.blue(`Processing component: ${componentIdentifier}...`));

    try {
      // Check if componentIdentifier is a URL
      let isUrl = false;
      try {
        const url = new URL(componentIdentifier);
        isUrl = url.protocol === "http:" || url.protocol === "https:";
      } catch (_) {
        // Not a valid URL, treat as a direct name
      }

      if (isUrl) {
        console.log(
          chalk.blue(
            `Fetching component details from ${componentIdentifier}...`
          )
        );
        try {
          const response = await fetch(componentIdentifier);
          if (!response.ok) {
            throw new Error(
              `Failed to fetch: ${response.status} ${response.statusText}`
            );
          }
          const registryItem = await response.json();
          if (!registryItem.name) {
            console.warn(
              chalk.yellow(
                "Warning: Fetched JSON does not have a 'name' property. Using identifier as name."
              )
            );
          }
          newEntry = {
            name: registryItem.name || componentIdentifier,
            sourceUrl: componentIdentifier,
            sourceType: "url_success",
            registryItem: registryItem,
            addedByCLI: true,
          };
          console.log(
            chalk.green(`Successfully fetched details for "${newEntry.name}".`)
          );
        } catch (fetchError) {
          const errorMessage =
            fetchError instanceof Error
              ? fetchError.message
              : String(fetchError);
          console.error(
            chalk.red(
              `Error fetching component details from URL: ${errorMessage}`
            )
          );
          newEntry = {
            name: componentIdentifier, // Use the URL itself as a fallback name
            sourceUrl: componentIdentifier,
            sourceType: "url_fetch_failed",
            fetchError: errorMessage,
            addedByCLI: true,
          };
        }
      } else {
        // Treat as a direct component name
        newEntry = {
          name: componentIdentifier,
          sourceType: "direct_name",
          addedByCLI: true,
        };
        console.log(
          chalk.blue(
            `Treating "${componentIdentifier}" as a direct component name.`
          )
        );
      }

      // Now, attempt to add with shadcn/ui CLI
      // We pass the original componentIdentifier to shadcn
      console.log(
        chalk.blue(`Running shadcn add for "${componentIdentifier}"...`)
      );
      execSync(`npx shadcn@latest add ${componentIdentifier}`, {
        stdio: "inherit",
      });
      console.log(
        chalk.green(
          `shadcn add command completed for "${componentIdentifier}".`
        )
      );

      // Update manifest only if shadcn add was successful and we have an entry to add
      if (newEntry) {
        let manifest: ManifestEntry[] = [];
        try {
          if (fs.existsSync(manifestPath)) {
            const fileContent = fs.readFileSync(manifestPath, "utf-8");
            manifest = JSON.parse(fileContent);
            if (!Array.isArray(manifest)) {
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
              `Warning: Could not read/parse ${MANIFEST_FILENAME}. Initializing. Error: ${
                error instanceof Error ? error.message : String(error)
              }`
            )
          );
          manifest = [];
        }

        // Check for duplicates based on 'name' field of the newEntry
        const isDuplicate = manifest.some(
          (entry) =>
            entry.name === newEntry!.name &&
            entry.sourceType === newEntry!.sourceType
        );

        if (!isDuplicate) {
          manifest.push(newEntry);
          fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
          console.log(
            chalk.cyan(
              `"${newEntry.name}" has been added/updated in ${MANIFEST_FILENAME}.`
            )
          );
        } else {
          console.log(
            chalk.cyan(
              `"${newEntry.name}" (type: ${newEntry.sourceType}) was already tracked in ${MANIFEST_FILENAME}.`
            )
          );
        }
      }
    } catch (error) {
      // This catch block now primarily handles errors from execSync or other unexpected errors
      console.error(
        chalk.red(
          `Failed to process component "${componentIdentifier}". Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        )
      );
      if (
        error &&
        typeof (error as any).status === "number" &&
        (error as any).status !== 0
      ) {
        process.exit((error as any).status);
      }
      process.exit(1); // General fallback exit
    }
  });

program.parse();

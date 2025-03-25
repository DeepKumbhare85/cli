import type { ValidClient } from "./types.js";
import { DEFAULT_CONFIG } from "./config.js";
import { writeConfig } from "./utils.js";
import { promptForRestart } from "./client.js";
import ora from "ora";
import chalk from "chalk";

export async function install(client: ValidClient): Promise<void> {
  const spinner = ora(`Installing configuration for ${client}...`).start();

  try {
    writeConfig(client, DEFAULT_CONFIG);
    spinner.succeed(`Successfully installed configuration for ${client}`);
    console.log(chalk.green(`${client} configuration updated successfully`));

    await promptForRestart(client);
  } catch (error) {
    spinner.fail(`Failed to install configuration for ${client}`);
    console.error(
      chalk.red(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    );
    throw error;
  }
}

import chalk from "chalk";
import ora from "ora";
import { promptForRestart } from "./client.js";
import { getDefaultConfig } from "./config.js";
import type { InstallOptions, ValidClient } from "./types.js";
import { writeConfig } from "./utils.js";

export async function install(
  client: ValidClient,
  options?: InstallOptions
): Promise<void> {
  const capitalizedClient = client.charAt(0).toUpperCase() + client.slice(1);

  const spinner = ora(
    `Installing configuration for ${capitalizedClient}...`
  ).start();

  try {
    const config = { ...getDefaultConfig(options?.apiKey) };

    writeConfig(client, config);
    spinner.succeed(
      `Successfully installed configuration for ${capitalizedClient}`
    );

    if (!options?.apiKey) {
      console.log(
        chalk.yellow(
          "No API key provided. Using default 'YOUR_API_KEY' placeholder."
        )
      );
    }

    console.log(
      chalk.green(`${capitalizedClient} configuration updated successfully`)
    );
    console.log(
      chalk.yellow(
        `You may need to restart ${capitalizedClient} to see the FlyonUI MCP server.`
      )
    );
    await promptForRestart(client);
  } catch (error) {
    spinner.fail(`Failed to install configuration for ${capitalizedClient}`);
    console.error(
      chalk.red(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    );
    throw error;
  }
}

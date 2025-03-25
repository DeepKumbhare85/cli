import inquirer from "inquirer";
import chalk from "chalk";

export async function promptForRestart(client: string): Promise<void> {
  const { shouldRestart } = await inquirer.prompt<{ shouldRestart: boolean }>([
    {
      type: "confirm",
      name: "shouldRestart",
      message: `Would you like to restart ${chalk.bold(client)} now?`,
      default: true,
    },
  ]);

  if (shouldRestart) {
    console.log(chalk.yellow(`Please restart ${client} to apply changes`));
  }
}

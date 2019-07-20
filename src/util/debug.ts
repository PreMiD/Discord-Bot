if (process.env.NODE_ENV == "dev") var chalk = require("chalk");

export function info(message: string) {
  if (process.env.NODE_ENV != "dev") return;
  console.log(`${chalk.bgBlue(chalk.white(" INFO "))} ${message}`);
}

export function success(message: string) {
  if (process.env.NODE_ENV != "dev") return;
  console.log(`${chalk.bgGreen(" SUCCESS ")} ${message}`);
}

export function error(message: string) {
  if (process.env.NODE_ENV != "dev") return;
  console.log(`${chalk.bgRed(" ERROR ")} ${message}`);
}

import chalk from "chalk";

export function info(message: string) {
	console.log(`${chalk.bgBlue(chalk.white(" INFO "))} ${message}`);
}

export function success(message: string) {
	console.log(`${chalk.bgGreen(" SUCCESS ")} ${message}`);
}

export function error(message: string) {
	console.log(`${chalk.bgRed(" ERROR ")} ${message}`);
}

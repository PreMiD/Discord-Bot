if (process.env.NODE_ENV == "dev") var chalk = require("chalk");

import * as Discord from "discord.js";

function info(message: Discord.Message) {
  if (process.env.NODE_ENV != "dev") return;
  console.log(`${chalk.bgBlue(chalk.white(" INFO "))} ${message}`);
}

function success(message: Discord.Message) {
  if (process.env.NODE_ENV != "dev") return;
  console.log(`${chalk.bgGreen(" SUCCESS ")} ${message}`);
}

function error(message: Discord.Message) {
  if (process.env.NODE_ENV != "dev") return;
  console.log(`${chalk.bgRed(" ERROR ")} ${message}`);
}

module.exports = {
  info: info,
  success: success,
  error: error
};

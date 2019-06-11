"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
if (process.env.NODE_ENV == "dev")
    var chalk = require("chalk");
function info(message) {
    if (process.env.NODE_ENV != "dev")
        return;
    console.log(`${chalk.bgBlue(chalk.white(" INFO "))} ${message}`);
}
function success(message) {
    if (process.env.NODE_ENV != "dev")
        return;
    console.log(`${chalk.bgGreen(" SUCCESS ")} ${message}`);
}
function error(message) {
    if (process.env.NODE_ENV != "dev")
        return;
    console.log(`${chalk.bgRed(" ERROR ")} ${message}`);
}
module.exports = {
    info: info,
    success: success,
    error: error
};

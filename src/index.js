"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//* Load .env file
const dotenv_1 = require("dotenv");
dotenv_1.config();
const Discord = require("discord.js");
const db_1 = require("./database/db");
var { jrModerator, moderator, administrator, developer } = require("./roles.json"), { error } = require("./util/debug");
//TODO Idle presence when production env
//* Create new client & set login presence
var client = new Discord.Client({
    presence: {
        status: process.env.NODE_ENV == "dev" ? "dnd" : "online",
        activity: {
            name: "Netflix",
            type: "WATCHING"
        }
    }
});
exports.client = client;
//* Commands, Command aliases, Command permission levels
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.elevation = (message) => {
    //* Permission level checker
    var permlvl = 0;
    if (!message.member)
        return 0;
    //* Jr Mod
    if (message.member.roles.has(jrModerator))
        permlvl = 1;
    //* Mod
    if (message.member.roles.has(moderator))
        permlvl = 2;
    //* Admin
    if (message.member.roles.has(administrator))
        permlvl = 3;
    //* Dev
    if (message.member.roles.has(developer))
        permlvl = 4;
    //* Return permlvl
    return permlvl;
};
//! Make sure that database is connected first then proceed
(async () => {
    await db_1.connectDb();
    require("./util/moduleLoader")(client);
    client.login(process.env.NODE_ENV == "dev" ? process.env.TOKEN_BETA : process.env.TOKEN);
})().catch(error);

//* Load .env file
import { config } from "dotenv";
config();
import * as Discord from "discord.js";
import { connectDb } from "./database/db";

var {
    jrModerator,
    moderator,
    administrator,
    developer
  } = require("./roles.json"),
  { error } = require("./util/debug");

//* Extend Client from discord.js
declare module "discord.js" {
  interface Client {
    commands: Discord.Collection<String | undefined, CommandProps>;
    aliases: Discord.Collection<String, String>;
    elevation: Function;
  }
}

//* Command Properties
interface CommandProps {
  name: String;
  permLevel: Number;
  enabled: Boolean;
  aliases: Array<String>;
}

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

//* Commands, Command aliases, Command permission levels
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.elevation = (message: Discord.Message) => {
  //* Permission level checker
  var permlvl: Number = 0;

  if (!message.member) return 0;

  //* Jr Mod
  if (message.member.roles.has(jrModerator)) permlvl = 1;
  //* Mod
  if (message.member.roles.has(moderator)) permlvl = 2;
  //* Admin
  if (message.member.roles.has(administrator)) permlvl = 3;
  //* Dev
  if (message.member.roles.has(developer)) permlvl = 4;

  //* Return permlvl
  return permlvl;
};

//! Make sure that database is connected first then proceed
(async () => {
  await connectDb();
  require("./util/moduleLoader")(client);
  client.login(
    process.env.NODE_ENV == "dev" ? process.env.TOKEN_BETA : process.env.TOKEN
  );
})().catch(error);

export { client };

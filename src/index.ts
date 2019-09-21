//* Load .env file
import { config } from "dotenv";
config();
import * as Discord from "discord.js";
import { error, success } from "./util/debug";
import moduleLoader from "./util/moduleLoader";
import { connect } from "./database/client";

var {
  ticketManager,
  jrModerator,
  moderator,
  administrator,
  developer
} = require("./roles.json");

//* Create new client & set login presence
export var client = new Discord.Client({
  presence:
    process.env.NODE_ENV == "dev"
      ? {
          status: "dnd",
          activity: {
            name: "devs code",
            type: "WATCHING"
          }
        }
      : {
          status: "online",
          activity: {
            name: "p!help",
            type: "LISTENING"
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

  //* Ticket Manager
  if (message.member.roles.has(ticketManager)) permlvl = 1;
  //* Jr Mod
  if (message.member.roles.has(jrModerator)) permlvl = 2;
  //* Mod
  if (
    message.member.roles.has(moderator) &&
    !message.member.roles.has(jrModerator)
  )
    permlvl = 3;
  //* Admin
  if (
    message.member.roles.has(administrator) ||
    message.member.permissions.has("ADMINISTRATOR")
  )
    permlvl = 4;
  //* Dev
  if (message.member.roles.has(developer)) permlvl = 5;

  //* Return permlvl
  return permlvl;
};

run();

//! Make sure that database is connected first then proceed
async function run() {
  //* Connect to Mongo DB
  await connect()
    .then(_ => success("Connected to the database"))
    .catch((err: Error) => {
      error(`Could not connect to database: ${err.name}`);
      process.exit();
    });

  client.login(process.env.TOKEN).then(() => {
    moduleLoader(client);
  });
}

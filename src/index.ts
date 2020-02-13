import "source-map-support/register";

//* Load .env file
import { config } from "dotenv";
config();
import * as Discord from "discord.js";
import { error, success } from "./util/debug";
import moduleLoader from "./util/moduleLoader";
import { connect } from "./database/client";
import roles from "./roles";

//* Create new client & set login presence
export let client = new Discord.Client({
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
client.infos = new Discord.Collection();
client.infoAliases = new Discord.Collection();

client.elevation = (userId: string) => {
	//* Permission level checker
	let permlvl: Number = 0;

	const member = client.guilds.first().members.get(userId);

	if (!member) return 0;

	//* Ticket Manager
	if (member.roles.has(roles.ticketManager)) permlvl = 1;
	//* Jr Mod
	if (member.roles.has(roles.jrModerator)) permlvl = 2;
	//* Mod
	if (member.roles.has(roles.moderator) && !member.roles.has(roles.jrModerator))
		permlvl = 3;
	//* Admin
	if (
		member.roles.has(roles.administrator) ||
		member.permissions.has("ADMINISTRATOR")
	)
		permlvl = 4;
	//* Dev
	if (member.roles.has(roles.developer)) permlvl = 5;

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

	client.login(process.env.TOKEN).then(async () => moduleLoader(client));
}

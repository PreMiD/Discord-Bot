import "source-map-support/register";

import axios from "axios";
import * as Discord from "discord.js";
import { config } from "dotenv";

import { connect, MongoClient } from "./database/client";
import roles from "./roles";
import { error, success } from "./util/debug";
import moduleLoader from "./util/moduleLoader";

export enum PermLevel {
	DEFAULT = 0,
	SUPPORT = 1,
	JRMODERATOR = 3,
	MODERATOR = 3,
	ADMIN = 4,
	DEVELOPER = 5
}

//* Load .env file
config({ path: "../.env" });

//* Commands, Command aliases, Command permission levels
class Client extends Discord.Client {
	commands = new Discord.Collection<string, any>();
	aliases = new Discord.Collection<string, any>();
	infos = new Discord.Collection<string, any>();
	infoAliases = new Discord.Collection<string, any>();
	discordCommands = new Discord.Collection<string, any>();

	elevation = async (userId: string) => {
		//* Permission level checker
		let permlvl: Number = 0;

		const member =
			client.guilds.resolve("493130730549805057").members.resolve(userId) ||
			(await client.guilds.resolve("493130730549805057").members.fetch(userId));

		if (!member) return PermLevel.DEFAULT;

		const memberRoles = member.roles.cache;

		//* Ticket Manager
		if (memberRoles.has(roles.ticketManager)) permlvl = PermLevel.SUPPORT;
		//* Jr Mod
		if (memberRoles.has(roles.jrModerator)) permlvl = PermLevel.JRMODERATOR;
		//* Mod
		if (memberRoles.has(roles.moderator)) permlvl = PermLevel.MODERATOR;
		//* Admin
		if (
			memberRoles.has(roles.administrator) ||
			member.permissions.has("ADMINISTRATOR")
		)
			permlvl = PermLevel.ADMIN;
		//* Dev
		if (memberRoles.has(roles.developer)) permlvl = PermLevel.DEVELOPER;

		//* Return permlvl
		return permlvl;
	};
}

//* Create new client & set login presence
export let client = new Client({
	intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_PRESENCES"],
	presence:
		process.env.NODE_ENV == "dev"
			? {
					status: "dnd",
					activities: [
						{
							name: "devs code",
							type: "WATCHING"
						}
					]
			  }
			: {
					status: "online",
					activities: [
						{
							name: "/help",
							type: "LISTENING"
						}
					]
			  }
});

run();

//! Make sure that database is connected first then proceed
async function run() {
	//* Connect to Mongo DB
	connect()
		.then(async _ => {
			success("Connected to the database");
			client.login(process.env.TOKEN).then(async () => {
				(
					await axios({
						baseURL: client.options.http.api,
						url: `/applications/${client.user.id}/guilds/493130730549805057/commands`,
						headers: { Authorization: `Bot ${client.token}` }
					})
				).data.forEach(cmd => client.discordCommands.set(cmd.name, cmd));
				moduleLoader(client);
			});
		})
		.catch((err: Error) => {
			error(`Could not connect to database: ${err.name}`);
			process.exit();
		});
}

//? Does that even work?
//* PM2 shutdown signal
process.on("SIGINT", async () => {
	await Promise.all([MongoClient.close(), client.destroy()]);
	process.exit();
});

process.on("unhandledRejection", (err: any) => {
	if (process.env.NODE_ENV !== "production") return console.trace(err.stack);

	const wh = process.env.ERRORSWEBHOOK.split(","),
		hook = new Discord.WebhookClient({ id: wh[0], token: wh[1] });

	hook.send({
		embeds: [
			new Discord.MessageEmbed({
				title: "Discord-Bot",
				color: "#ff5050",
				description: `\`\`\`${err.stack.toString()}\`\`\``
			})
		]
	});
});

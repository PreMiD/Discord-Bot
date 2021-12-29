import "source-map-support/register";

import debug from "debug";
import * as Discord from "discord.js";
import { Db, MongoClient } from "mongodb";

import { ClientCommand } from "../@types/djs-extender";
import ModuleLoader from "./util/classes/ModuleLoader";

if (process.env.NODE_ENV !== "production") require("dotenv/config");

class Client extends Discord.Client {
	commands = new Discord.Collection<string, ClientCommand>();
}

if (!process.env.MONGO_URI) throw new Error("Please set the MONGO_URI environment variable");

if (!process.env.TOKEN) throw new Error("Please set the TOKEN environment variable");

export const mainLog = debug("PreMiD-Bot"),
	mongodb = new MongoClient(process.env.MONGO_URI, {
		appName: "PreMiD Bot"
	});

debug.enable("PreMiD-Bot*");

export let pmdDB: Db,
	presencesStrings: string[] = [];

//* Create new client & set login presence
export let client = new Client({
	intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_PRESENCES"]
});

async function run() {
	await mongodb.connect();
	pmdDB = mongodb.db("PreMiD");
	mainLog("Connected to MongoDB");

	await client.login(process.env.TOKEN);
	mainLog("Connected to Discord");

	new ModuleLoader(client);

	await updatePresenceList();
	setInterval(updatePresenceList, 1000 * 60 * 5);
}

async function updatePresenceList() {
	presencesStrings = await pmdDB
		.collection("presences")
		.find({}, { projection: { _id: false, name: true } })
		.map(p => p.name)
		.toArray();
}

//TODO Add Sentry Handling

run();

import "source-map-support/register";

import debug from "debug";
import * as Discord from "discord.js";
import { Db, MongoClient } from "mongodb";

import { ClientCommand } from "../@types/djs-extender";
import ModuleLoader from "discord-module-loader";
if (process.env.NODE_ENV !== "production") require("dotenv").config({ path: "../.env" });

class Client extends Discord.Client {
	commands = new Discord.Collection<string, ClientCommand>();
}

if (!process.env.MONGO_URI) throw new Error("Please set the MONGO_URI environment variable");

if (!process.env.TOKEN) throw new Error("Please set the TOKEN environment variable");

export let client = new Client({
	intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_PRESENCES"]
});

export const mainLog = debug("PreMiD-Bot"),
	mongodb = new MongoClient(process.env.MONGO_URI, {
		appName: "PreMiD Bot"
	}),
	moduleLoader = new ModuleLoader(client)

debug.enable("PreMiD-Bot*");

export let pmdDB: Db,
	presencesStrings: string[] = [];

async function run() {
	await mongodb.connect();
	pmdDB = mongodb.db("PreMiD");
	mainLog("Connected to MongoDB");

	await client.login(process.env.TOKEN);

	mainLog("Loading commands and events");
	await moduleLoader.loadAll();
	
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
	
	run();

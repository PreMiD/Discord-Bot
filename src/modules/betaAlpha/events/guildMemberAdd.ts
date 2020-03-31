import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";

let discordUsers = MongoClient.db("PreMiD").collection("discordUsers");

module.exports = async (member: Discord.GuildMember) => {
	discordUsers.findOneAndUpdate(
		{ userId: member.id },
		{ $set: { userId: member.id } },
		{ upsert: true }
	);
};

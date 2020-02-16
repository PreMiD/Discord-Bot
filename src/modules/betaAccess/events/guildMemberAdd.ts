import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";

let discordUsers = MongoClient.db("PreMiD").collection("discordUsers");

module.exports = async (
	member: Discord.GuildMember
) => {

  let dbUser = await discordUsers.findOne({ userId: member.id });

  if (!dbUser) discordUsers.insertOne({ userId: member.id });

};

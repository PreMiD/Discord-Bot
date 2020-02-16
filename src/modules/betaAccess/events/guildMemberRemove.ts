import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";

let betaUsers = MongoClient.db("PreMiD").collection("betaUsers");
let discordUsers = MongoClient.db("PreMiD").collection("discordUsers");

module.exports = async (
	member: Discord.GuildMember
) => {

  let betaUser = await betaUsers.findOne({ userId: member.id });
  let dbUser = await discordUsers.findOne({ userId: member.id });

  if (betaUser) betaUsers.findOneAndDelete({ userId: member.id });
  if (dbUser) discordUsers.findOneAndDelete({ userId: member.id });

};

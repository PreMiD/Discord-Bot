import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";

let betaUsers = MongoClient.db("PreMiD").collection("betaUsers");
let discordUsers = MongoClient.db("PreMiD").collection("discordUsers");

module.exports = async (
	member: Discord.GuildMember
) => {

  betaUsers.findOneAndDelete({ userId: member.id });
  discordUsers.findOneAndDelete({ userId: member.id });

};

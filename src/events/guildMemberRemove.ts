import * as Discord from "discord.js";
import { pmdDB } from "../database/client";

const coll = pmdDB.collection("userSettings"),
	betaUsers = pmdDB.collection("betaUsers"),
	alphaUsers = pmdDB.collection("alphaUsers"),
	discordUsers = pmdDB.collection("discordUsers");

module.exports = async (member: Discord.GuildMember) => {
	coll.findOneAndDelete({ userId: member.id });
	betaUsers.findOneAndDelete({ userId: member.id });
	alphaUsers.findOneAndDelete({ userId: member.id });
	discordUsers.findOneAndDelete({ userId: member.id });
};

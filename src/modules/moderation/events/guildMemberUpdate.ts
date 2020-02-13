import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";
import roles from "../../../roles";

module.exports = async (
	oldMember: Discord.GuildMember,
	newMember: Discord.GuildMember
) => {
	if (
		oldMember.roles.cache.has(roles.muted) &&
		!newMember.roles.cache.has(roles.muted)
	)
		MongoClient.db("PreMiD")
			.collection("mutes")
			.findOneAndDelete({ userId: newMember.id });
};

import * as Discord from "discord.js";
import roles from "../roles";
import { pmdDB } from "../database/client";
const col = pmdDB.collection("presences");

module.exports = async (member: Discord.GuildMember) => {
	const doc = await col.findOne({ "metadata.author.id": member.id });

	if (doc && !member.roles.cache.has(roles.presence))
		member.roles.add(roles.presence);
};

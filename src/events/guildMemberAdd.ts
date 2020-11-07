import * as Discord from "discord.js";
import roles from "../roles";
import { pmdDB } from "../database/client";

const col = pmdDB.collection("presences"),
	discordUsers = pmdDB.collection("discordUsers");
	
module.exports = async (member: Discord.GuildMember) => {
	const doc = await col.findOne({ "metadata.author.id": member.id });
	if (doc && !member.roles.cache.has(roles.presence)) member.roles.add(roles.presence);

	discordUsers.findOneAndUpdate(
		{ userId: member.id },
		{
			$set: {
				userId: member.id,
				created: member.user.createdTimestamp,
				username: member.user.username,
				discriminator: member.user.discriminator,
				avatar: member.user.displayAvatarURL()
			}
		},
		{ upsert: true }
	);
};

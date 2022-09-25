import { GuildMember } from "discord.js";

import { pmdDB } from "..";
import { DiscordUsers } from "../../@types/interfaces";

export default async function (member: GuildMember) {
	await pmdDB.collection<DiscordUsers>("discordUsers").updateOne(
		{ userId: member.id },
		{
			$set: {
				userId: member.id,
				username: member.user.username,
				discriminator: member.user.discriminator,
				avatar: member.user.displayAvatarURL({ forceStatic: false }),
				created: member.user.createdTimestamp
			}
		},
		{ upsert: true }
	);
}

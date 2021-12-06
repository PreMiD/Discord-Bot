import { GuildMember } from "discord.js";

import { pmdDB } from "..";
import { DiscordUsers } from "../../@types/interfaces";

export default async function (member: GuildMember) {
	await Promise.all([
		pmdDB
			.collection<DiscordUsers>("discordUsers")
			.deleteOne({ userId: member.id })
	]);
}

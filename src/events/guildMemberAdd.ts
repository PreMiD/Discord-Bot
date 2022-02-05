import { DiscordEvent } from "discord-module-loader";
import { GuildMember } from "discord.js";

import { pmdDB } from "..";
import { Presences } from "../../@types/interfaces";
import config from "../config";
import updateDiscordUser from "../functions/updateDiscordUser";

export default new DiscordEvent("guildMemberAdd", async (member: GuildMember) => {
	const isPresenceDev = (await pmdDB.collection<Presences>("presences").findOne({
		$or: [{ "metadata.author.id": member.id }, { "metadata.contributors.id": member.id }]
	}))
		? true
		: false;

	if (isPresenceDev) await member.roles.add(config.roles.presenceDev);

	await updateDiscordUser(member);
});

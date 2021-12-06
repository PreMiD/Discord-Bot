import { GuildMember } from "discord.js";

import { pmdDB } from "..";
import { Presences } from "../../@types/interfaces";
import config from "../config";
import updateDiscordUser from "../util/functions/updateDiscordUser";

export default async function (member: GuildMember) {
	const isPresenceDev = (await pmdDB
		.collection<Presences>("Presences")
		.findOne({ "metadata.author.id": member.id }))
		? true
		: false;

	if (isPresenceDev) await member.roles.add(config.roles.presenceDev);

	await updateDiscordUser(member);
}

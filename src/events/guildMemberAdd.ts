import { GuildMember } from "discord.js";

import { pmdDB } from "..";
import { Presences } from "../../@types/interfaces";
import config from "../config";
import updateDiscordUser from "../util/functions/updateDiscordUser";

export default async function (member: GuildMember) {
	const isPresenceDev = (await pmdDB
		.collection<Presences>("presences")
		.findOne({
			$or: [
				{ "metadata.author.id": member.id },
				{ "metadata.contributors.id": member.id }
			]
		}))
		? true
		: false;

	if (isPresenceDev) await member.roles.add(config.roles.presenceDev);

	await updateDiscordUser(member);
}

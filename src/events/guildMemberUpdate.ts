import { GuildMember } from "discord.js";

import updateDiscordUser from "../util/functions/updateDiscordUser";

export default async function (_: GuildMember, newMember: GuildMember) {
	await updateDiscordUser(newMember);
}

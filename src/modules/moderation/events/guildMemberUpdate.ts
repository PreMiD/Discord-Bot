import * as Discord from "discord.js";
import roles from "../../../roles";
import { pmdDB } from "../../../database/client";

module.exports = async (
	oldMember: Discord.GuildMember,
	newMember: Discord.GuildMember
) => {
	if (oldMember.roles.cache.has(roles.muted) && !newMember.roles.cache.has(roles.muted))
		pmdDB.collection("mutes").findOneAndDelete({ userId: newMember.id });
};

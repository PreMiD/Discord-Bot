import { DiscordEvent } from "discord-module-loader";
import { GuildMember } from "discord.js";

import { pmdDB } from "../../..";
import { Credits } from "../../../../@types/interfaces";

export default new DiscordEvent("guildMemberRemove", async member => {
	await pmdDB.collection<Credits>("credits").deleteOne({ userId: member.id });
});

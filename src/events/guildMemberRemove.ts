import { DiscordEvent } from "discord-module-loader";

import { pmdDB } from "..";
import { DiscordUsers } from "../../@types/interfaces";

export default new DiscordEvent("guildMemberRemove", async member => {
	await pmdDB.collection<DiscordUsers>("discordUsers").deleteOne({ userId: member.id });
});

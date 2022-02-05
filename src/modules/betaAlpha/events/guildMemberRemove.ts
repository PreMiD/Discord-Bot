import { DiscordEvent } from "discord-module-loader";

import { pmdDB } from "../../..";
import { AlphaUsers, BetaUsers } from "../../../../@types/interfaces";

export default new DiscordEvent("guildMemberRemove", async member => {
	await Promise.all([
		pmdDB.collection<BetaUsers>("betaUsers").deleteOne({ userId: member.id }),
		pmdDB.collection<AlphaUsers>("alphaUsers").deleteOne({ userId: member.id })
	]);
});

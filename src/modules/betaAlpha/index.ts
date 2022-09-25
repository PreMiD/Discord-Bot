import { DiscordModule } from "discord-module-loader";

import { client, pmdDB } from "../..";
import { AlphaUsers, BetaUsers } from "../../../@types/interfaces";
import config from "../../config";

export default new DiscordModule("betaAlpha");

client.on("ready", async () => {
	const betaUsers = await pmdDB.collection<BetaUsers>("betaUsers").find().toArray(),
		alphaUsers = await pmdDB.collection<AlphaUsers>("alphaUsers").find().toArray(),
		pmdGuild = await client.guilds.fetch(config.guildId);

	const members = (await pmdGuild.members.fetch()).filter(
			m => typeof alphaUsers.find(u => m.id === u.userId) !== "undefined" || typeof betaUsers.find(u => m.id === u.userId) !== "undefined"
		),
		//@ts-ignore
		membersNotInGuild = [...new Set(...betaUsers.map(m => m.userId), ...alphaUsers.map(m => m.userId))].filter(m => !members.has(m));

	for (const m of members.values()) {
		const alpha = alphaUsers.find(u => u.userId === m.id) ? true : false,
			beta = betaUsers.find(u => u.userId === m.id) ? true : false;

		if (alpha) {
			if (!m.roles.cache.has(config.roles.alpha)) await m.roles.add(config.roles.alpha);

			if (beta) {
				await m.roles.remove(config.roles.beta);
				await pmdDB.collection<BetaUsers>("betaUsers").deleteOne({ userId: m.id });
			}

			continue;
		}

		if (beta) if (!m.roles.cache.has(config.roles.beta)) await m.roles.add(config.roles.beta);
	}

	for (const m of membersNotInGuild) {
		await pmdDB.collection<BetaUsers>("betaUsers").deleteOne({ userId: m });
		await pmdDB.collection<AlphaUsers>("alphaUsers").deleteOne({ userId: m });
	}
});

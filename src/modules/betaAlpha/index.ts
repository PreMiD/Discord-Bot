import { DiscordModule } from "discord-module-loader";
import { GuildMember } from "discord.js";

import { client, pmdDB } from "../..";
import { AlphaUsers, BetaUsers } from "../../../@types/interfaces";
import config from "../../config";

export default new DiscordModule("betaAlpha");

client.on("ready", async () => {
	const betaUsers = await pmdDB.collection<BetaUsers>("betaUsers").find().toArray(),
		alphaUsers = await pmdDB.collection<AlphaUsers>("alphaUsers").find().toArray(),
		pmdGuild = await client.guilds.fetch(config.guildId);

	for (const aU of alphaUsers) {
		let member: GuildMember | null = null;

		try {
			member = await pmdGuild.members.fetch(aU.userId);
		} catch (err) {}

		if (!member) {
			await pmdDB.collection<AlphaUsers>("alphaUsers").deleteOne({ userId: aU.userId });
			continue;
		}

		if (!member.roles.cache.has(config.roles.alpha)) await member.roles.add(config.roles.alpha);
	}

	for (const bU of betaUsers) {
		let member: GuildMember | null = null;

		try {
			member = await pmdGuild.members.fetch(bU.userId);
		} catch (err) {}

		if (!member) {
			await pmdDB.collection<BetaUsers>("betaUsers").deleteOne({ userId: bU.userId });
			continue;
		}

		if (!member.roles.cache.has(config.roles.beta)) await member.roles.add(config.roles.beta);
	}
});

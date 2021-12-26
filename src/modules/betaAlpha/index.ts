import { client, pmdDB } from "../..";
import { AlphaUsers, BetaUsers } from "../../../@types/interfaces";
import config from "../../config";

export default async function () {
	const betaUsers = await pmdDB.collection<BetaUsers>("betaUsers").find().toArray(),
		alphaUsers = await pmdDB.collection<AlphaUsers>("alphaUsers").find().toArray(),
		pmdGuild = await client.guilds.fetch(config.guildId);

	for (const aU of alphaUsers) {
		const member = await pmdGuild.members.fetch(aU.userId);

		if (!member) {
			await pmdDB.collection<AlphaUsers>("alphaUsers").deleteOne({ userId: aU.userId });
			continue;
		}

		if (!member.roles.cache.has(config.roles.alpha)) await member.roles.add(config.roles.alpha);
	}

	for (const bU of betaUsers) {
		const member = await pmdGuild.members.fetch(bU.userId);

		if (!member) {
			await pmdDB.collection<BetaUsers>("betaUsers").deleteOne({ userId: bU.userId });
			continue;
		}

		if (!member.roles.cache.has(config.roles.beta)) await member.roles.add(config.roles.beta);
	}
}

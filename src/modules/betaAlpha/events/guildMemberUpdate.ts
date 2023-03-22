import { DiscordEvent } from "discord-module-loader";
import { GuildMember, PartialGuildMember } from "discord.js";
import { alphaRoles, betaRoles } from "..";

import { pmdDB } from "../../..";
import { AlphaUsers, BetaUsers } from "../../../../@types/interfaces";
import config from "../../../config";

export default new DiscordEvent("guildMemberUpdate", async (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => {
	if (oldMember == null || newMember == null) return;

	const addedRoles = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id)),
		removedRoles = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id));

	//* Member looses booster or patron role, remove alpha and give beta role
	if (removedRoles.has(config.roles.booster) || removedRoles.has(config.roles.patron)) {
		await newMember.roles.remove(config.roles.alpha);
		return await newMember.roles.add(config.roles.beta);
	}

	//* Member gets beta role
	if (addedRoles.has(config.roles.beta)) {
		//* Member has one of the alpha roles, remove beta role
		if (alphaRoles.some(r => newMember.roles.cache.has(r))) return await newMember.roles.remove(config.roles.beta);

		return await pmdDB
			.collection<BetaUsers>("betaUsers")
			.updateOne({ userId: oldMember.id }, { $set: { userId: oldMember.id } }, { upsert: true });
	}

	//* Member gets alpha role
	if (addedRoles.has(config.roles.alpha)) {
		//* Member has beta role, remove beta role
		if (newMember.roles.cache.has(config.roles.beta)) await newMember.roles.remove(config.roles.beta);

		return await pmdDB
			.collection<AlphaUsers>("alphaUsers")
			.updateOne({ userId: oldMember.id }, { $set: { userId: oldMember.id } }, { upsert: true });
	}

	//* Member gets random role that is eligible for alpha
	if (alphaRoles.some(r => addedRoles.has(r))) {
		return await newMember.roles.add(config.roles.alpha);
	}

	//* Member gets random role that is eligible for beta
	if (betaRoles.some(r => addedRoles.has(r))) {
		return await newMember.roles.add(config.roles.beta);
	}

	//* Member looses alpha role
	if (removedRoles.has(config.roles.alpha)) {
		//* Don't remove alpha if they have one of the alpha roles
		if (alphaRoles.some(r => newMember.roles.cache.has(r))) return await newMember.roles.add(config.roles.alpha);

		return await pmdDB.collection<AlphaUsers>("alphaUsers").deleteOne({ userId: oldMember.id });
	}

	//* Member looses beta role
	if (removedRoles.has(config.roles.beta)) {
		//* If user has alpha role, ignore
		if (alphaRoles.some(r => newMember.roles.cache.has(r))) return;

		//* Don't remove beta if they have one of the beta roles
		if (betaRoles.some(r => newMember.roles.cache.has(r))) return await newMember.roles.add(config.roles.beta);

		return await pmdDB.collection<BetaUsers>("betaUsers").deleteOne({ userId: oldMember.id });
	}
});

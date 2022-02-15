import { DiscordEvent } from "discord-module-loader";

import { pmdDB } from "../../..";
import { AlphaUsers, BetaUsers } from "../../../../@types/interfaces";
import config from "../../../config";

export default new DiscordEvent("guildMemberUpdate", async (oldMember, newMember) => {
	const oldRoles = oldMember.roles.cache,
		newRoles = newMember.roles.cache;

	//* Member get's alpha role
	if (!oldRoles.has(config.roles.alpha) && newRoles.has(config.roles.alpha)) {
		if (newRoles.has(config.roles.beta)) await newMember.roles.remove(config.roles.beta);

		return await pmdDB
			.collection<BetaUsers>("betaUsers")
			.updateOne({ userId: oldMember.id }, { $set: { userId: oldMember.id } }, { upsert: true });
	}

	//* Member get's beta role
	if (!oldRoles.has(config.roles.beta) && newRoles.has(config.roles.beta))
		return await pmdDB
			.collection<BetaUsers>("betaUsers")
			.updateOne({ userId: oldMember.id }, { $set: { userId: oldMember.id } }, { upsert: true });

	//* Member loses beta role
	if (oldRoles.has(config.roles.beta) && !newRoles.has(config.roles.beta)) {
		//* Member has donator or booster role but not alpha role, add beta back to user
		if (
			(newRoles.has(config.roles.donator) || newRoles.has(config.roles.booster)) &&
			!newRoles.has(config.roles.alpha) &&
			!newRoles.has(config.roles.patron)
		)
			return await newMember.roles.add(config.roles.beta);

		return await pmdDB.collection<BetaUsers>("betaUsers").deleteOne({ userId: oldMember.id });
	}

	//* Member loses alpha role
	if (oldRoles.has(config.roles.alpha) && !newRoles.has(config.roles.alpha)) {
		//* Member has patron role, give alpha role back
		if (newRoles.has(config.roles.patron)) return await newMember.roles.add(config.roles.alpha);

		return await pmdDB.collection<AlphaUsers>(`alphaUsers`).deleteOne({ userId: oldMember.id });
	}

	//* New Patron, give alpha role and remove beta role
	if (newRoles.has(config.roles.patron) && !oldRoles.has(config.roles.patron)) {
		if (newRoles.has(config.roles.beta)) await newMember.roles.remove(config.roles.beta);
		if (!newRoles.has(config.roles.alpha)) await newMember.roles.add(config.roles.alpha);
	}

	//* Member stops pledging on Patreon, give beta role
	if (oldRoles.has(config.roles.patron) && !newRoles.has(config.roles.patron)) {
		if (newRoles.has(config.roles.alpha)) await newMember.roles.remove(config.roles.alpha);
		await newMember.roles.add(config.roles.beta);
	}

	//* Member receives donator role, give beta role
	if (newRoles.has(config.roles.donator) && !oldRoles.has(config.roles.donator)) return await newMember.roles.add(config.roles.beta);

	//* Member boosts, give beta role
	if (newRoles.has(config.roles.booster) && !oldRoles.has(config.roles.booster)) return await newMember.roles.add(config.roles.beta);
});

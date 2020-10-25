import * as Discord from "discord.js";
import roles from "../../../roles";
import { pmdDB } from "../../../database/client";

const betaUsers = pmdDB.collection("betaUsers"),
	alphaUsers = pmdDB.collection("alphaUsers");

module.exports = async (
	oldMember: Discord.GuildMember,
	newMember: Discord.GuildMember
) => {
	//* Add beta access when the beta role is given.
	if (
		!oldMember.roles.cache.has(roles.beta) &&
		newMember.roles.cache.has(roles.beta)
	) {
		betaUsers.findOneAndUpdate(
			{ userId: newMember.id },
			{ $set: { userId: newMember.id } },
			{ upsert: true }
		);
	}

	if (
		!oldMember.roles.cache.has(roles.alpha) &&
		newMember.roles.cache.has(roles.alpha)
	) {
		alphaUsers.findOneAndUpdate(
			{ userId: newMember.id },
			{ $set: { userId: newMember.id } },
			{ upsert: true }
		);
	}

	//* Remove beta access when the beta role is removed.
	if (
		oldMember.roles.cache.has(roles.beta) &&
		!newMember.roles.cache.has(roles.beta)
	) {
		betaUsers.findOneAndDelete({ userId: newMember.id });
	}

	//* Remove alpha access when the alpha role is removed.
	if (
		oldMember.roles.cache.has(roles.alpha) &&
		!newMember.roles.cache.has(roles.alpha)
	) {
		alphaUsers.findOneAndDelete({ userId: newMember.id });
	}

	//* Give old patron beta if he stops supporting
	if (
		oldMember.roles.cache.has(roles.patron) &&
		!newMember.roles.cache.has(roles.patron)
	) {
		await newMember.roles.remove(roles.alpha);
		newMember.roles.add([roles.beta, roles.donator]);
		return;
	}

	//* If user is patron and does not have alpha role, give it to them.
	if (
		newMember.roles.cache.has(roles.patron) &&
		!newMember.roles.cache.has(roles.alpha)
	) {
		if (newMember.roles.cache.has(roles.donator)) {
			newMember.roles.remove([roles.donator, roles.beta]);
		}

		newMember.roles.add(roles.alpha);
		return;
	}

	//* If user is donator and does not have beta role, give it to them.
	if (
		newMember.roles.cache.has(roles.donator) &&
		!newMember.roles.cache.has(roles.alpha) &&
		!newMember.roles.cache.has(roles.beta)
	) {
		newMember.roles.add(roles.beta);
	}

	//* If user is donator and get's alpha role remove beta role
	if (
		newMember.roles.cache.has(roles.donator) &&
		newMember.roles.cache.has(roles.alpha) &&
		newMember.roles.cache.has(roles.beta)
	) {
		newMember.roles.remove(roles.beta);
	}

	//* If user boosts and doesn't have beta role, give it to them.
	if (
		newMember.roles.cache.has(roles.booster) &&
		!newMember.roles.cache.has(roles.beta) &&
            	!newMember.roles.cache.has(roles.alpha)
	) {
		newMember.roles.add(roles.beta);
	}

	//* Remove beta access when boost expires.
	if (
		oldMember.roles.cache.has(roles.donator) &&
		newMember.roles.cache.has(roles.donator)
	)
		return;

	if (
		oldMember.roles.cache.has(roles.booster) &&
		!newMember.roles.cache.has(roles.booster) &&
		!newMember.roles.cache.has(roles.patron) &&
		!newMember.roles.cache.has(roles.donator)
	) {
		newMember.roles.remove(roles.beta);
		return;
	}
};

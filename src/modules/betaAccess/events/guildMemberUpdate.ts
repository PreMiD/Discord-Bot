import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";
import roles from "../../../roles";

const coll = MongoClient.db("PreMiD").collection("betaAccess");
const betaUsers = MongoClient.db("PreMiD").collection("betaUsers");

module.exports = async (
	oldMember: Discord.GuildMember,
	newMember: Discord.GuildMember
) => {
	//* If user is patron and does not have either betaTester or beta role, give it to them.
	if (
		newMember.roles.cache.has(roles.patron) &&
		!newMember.roles.cache.has(roles.beta)
	) {
		newMember.roles.add(roles.beta);

		if (!(await coll.findOne({ userId: newMember.id })))
			await coll.insertOne({ userId: newMember.id });

		if (!(await betaUsers.findOne({ userId: newMember.id })))
			await betaUsers.insertOne({ userId: newMember.id });

		return;
	}

	//* If user boosts and doesn't have beta role, give it to them.
	if (
		newMember.roles.cache.has(roles.booster) &&
		!newMember.roles.cache.has(roles.beta)
	) {
		newMember.roles.add(roles.beta);

		coll.insertOne({ userId: newMember.id });
		betaUsers.insertOne({ userId: newMember.id });

		return;
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
		if (!oldMember.roles.cache.has(roles.patron))
			newMember.roles.remove(roles.beta);

		coll.findOneAndDelete({ userId: newMember.id });
		betaUsers.findOneAndDelete({ userId: newMember.id });

		return;
	}

	//* Remove beta access when the beta role is removed.
	if (
		oldMember.roles.cache.has(roles.beta) &&
		!newMember.roles.cache.has(roles.beta)
	) {
		coll.findOneAndDelete({ userId: newMember.id });
		betaUsers.findOneAndDelete({ userId: newMember.id });
		return;
	}
};

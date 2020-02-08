import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";
import roles from "../../../roles";

const coll = MongoClient.db("PreMiD").collection("betaAccess");

module.exports = async (
	oldMember: Discord.GuildMember,
	newMember: Discord.GuildMember
) => {
	//* If user is patron and does not have either betaTester or beta role, give it to them.
	if (newMember.roles.has(roles.patron) && !newMember.roles.has(roles.beta)) {
		newMember.roles.add(roles.beta);

		if (!(await coll.findOne({ userId: newMember.id })))
			await coll.insertOne({ userId: newMember.id });

		return;
	}

	//* If user boosts and doesn't have beta role, give it to them.
	if (newMember.roles.has(roles.booster) && !newMember.roles.has(roles.beta)) {
		newMember.roles.add(roles.beta);

		coll.insertOne({ userId: newMember.id });

		return;
	}

	//* Remove beta access when boost expires.
	if (oldMember.roles.has(roles.donator) && newMember.roles.has(roles.donator))
		return;

	if (
		oldMember.roles.has(roles.booster) &&
		!newMember.roles.has(roles.booster) &&
		!newMember.roles.has(roles.patron) &&
		!newMember.roles.has(roles.donator)
	) {
		newMember.roles.remove(roles.beta);
		if (!oldMember.roles.has(roles.patron)) newMember.roles.remove(roles.beta);

		coll.findOneAndDelete({ userId: newMember.id });

		return;
	}

	//* Remove beta access when the beta role is removed.
	if (oldMember.roles.has(roles.beta) && !newMember.roles.has(roles.beta)) {
		coll.findOneAndDelete({ userId: newMember.id });
		return;
	}
};

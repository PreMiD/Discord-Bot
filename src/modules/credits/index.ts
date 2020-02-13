import { client } from "../../index";
import { MongoClient } from "../../database/client";
import { info } from "../../util/debug";
import creditRoles from "./creditRoles";

const coll = MongoClient.db("PreMiD").collection("credits");

async function updateCredits() {
	info("Updating credits...");

	const users = (
			await client.guilds.cache
				.get("493130730549805057")
				.members.fetch({ limit: 0 })
		).filter(
			m =>
				containsAny(Object.values(creditRoles), m.roles.cache.keyArray())
					.length > 0
		),
		creditUsers = users.map(m => {
			const mCreditRoles = containsAny(
					Object.values(creditRoles),
					m.roles.cache.keyArray()
				),
				highestRole = m.roles.cache.get(mCreditRoles[0]),
				result = {
					userId: m.id,
					name: m.user.username,
					tag: m.user.discriminator,
					avatar: m.user.displayAvatarURL({ format: "png", dynamic: true }),
					role: highestRole.name,
					roles: m.roles.cache.map(r => r.name),
					roleColor: highestRole.hexColor,
					rolePosition: highestRole.position,
					status: m.user.presence.status
				};

			return result;
		}),
		mongoCredits = await coll.find().toArray(),
		usersToRemove = mongoCredits
			.map(mC => mC.userId)
			.filter(mC => !creditUsers.map(cU => cU.userId).includes(mC));

	usersToRemove.map(uTR => coll.findOneAndDelete({ userId: uTR }));

	await Promise.all(
		creditUsers.map(async cu => {
			if (
				!(await coll.findOneAndUpdate({ userId: cu.userId }, { $set: cu }))
					.lastErrorObject.updatedExisting
			)
				coll.insertOne(cu);
		})
	);

	info("Updated credits.");
}

updateCredits();
setInterval(updateCredits, 5 * 60 * 1000);

function containsAny(source: Array<string>, target: Array<string>) {
	let result = source.filter(function(item) {
		return target.indexOf(item) > -1;
	});
	return result;
}

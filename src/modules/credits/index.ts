import { client } from "../../index";
import { info } from "../../util/debug";
import creditRoles from "./creditRoles";
import { pmdDB } from "../../database/client";

const creditsColl = pmdDB.collection("credits");

async function updateCredits() {
	info("Updating credits...");

	let creditUsers = [];

	client.guilds.cache
		.first()
		.roles.cache.filter(r => Object.values(creditRoles).includes(r.id))
		.forEach(async r => {
			for (let i = 0; i < r.members.size; i++) {
				const member = r.members.array()[i];

				// @ts-ignore
				const userFlags = (await member.user.fetchFlags()).toArray();

				const highestRole = member.roles.cache.get(
					containsAny(
						Object.values(creditRoles),
						member.roles.cache.keyArray()
					)[0]
				);

				if (!creditUsers.find(cU => cU.userId === member.id))
					creditUsers.push({
						userId: member.id,
						name: member.user.username,
						tag: member.user.discriminator,
						avatar: member.user.displayAvatarURL({
							format: "png",
							dynamic: true
						}),
						role: highestRole.name,
						roleId: highestRole.id,
						roles: member.roles.cache
							.filter(r => r.name !== "@everyone")
							.map(r => r.name),
						roleIds: member.roles.cache
							.filter(r => r.name !== "@everyone")
							.map(r => r.id),
						roleColor: highestRole.hexColor,
						rolePosition: highestRole.position,
						flags: userFlags.length > 0 ? userFlags : undefined,
						status: member.user.presence.status
					});
			}
		});

	await Promise.all(
		creditUsers.map(cU =>
			creditsColl.findOneAndUpdate({ userId: cU.userId }, { $set: cU })
		)
	);

	//#region Filter old credits > delete them
	const dbCredits = await creditsColl
			.find({}, { projection: { _id: false, userId: true } })
			.toArray(),
		usersToRemove = dbCredits.filter(
			mC => !creditUsers.find(cU => cU.userId === mC.userId)
		),
		usersToAdd = creditUsers.filter(
			mC => !dbCredits.find(cU => cU.userId === mC.userId)
		);
	if (usersToRemove.length > 0) {
		await Promise.all(
			usersToRemove.map(uTR =>
				creditsColl.findOneAndDelete({ userId: uTR.userId })
			)
		);
	}
	if (usersToAdd.length > 0) await creditsColl.insertMany(usersToAdd);
	//#endregion

	info("Updated credits.");
}

updateCredits();
setInterval(updateCredits, 5 * 60 * 1000);

function containsAny(source: Array<string>, target: Array<string>) {
	let result = source.filter(function (item) {
		return target.indexOf(item) > -1;
	});
	return result;
}

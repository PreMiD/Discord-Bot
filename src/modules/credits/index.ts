import { client } from "../../index";
import { info } from "../../util/debug";
import creditRoles from "./creditRoles";
import { pmdDB } from "../../database/client";

import schedule from 'node-schedule';

const creditsColl = pmdDB.collection("credits");

async function updateCredits() {
	info("Updating credits...");

	let creditUsers = [];

	client.guilds.cache
		.first()
		.roles.cache.filter(r => Object.values(creditRoles).includes(r.id))
		.map(r => {
			for (let i = 0; i < r.members.size; i++) {
				const member = r.members.array()[i];

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
						premium_since: member.premiumSince
							? member.premiumSinceTimestamp
							: undefined,
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
						status: member.user.presence.status
					});
			}
		});

	info("Pushing credits changes to database...");

	await Promise.all(
		creditUsers.map(cU =>
			creditsColl.findOneAndUpdate(
				{ userId: cU.userId },
				{ $set: cU },
				{ upsert: true }
			)
		)
	);

	//#region Filter old credits > delete them
	const dbCredits = await creditsColl
			.find({}, { projection: { _id: false, userId: true } })
			.toArray(),
		usersToRemove = dbCredits.filter(
			mC => !creditUsers.find(cU => cU.userId === mC.userId)
		);
	if (usersToRemove.length > 0) {
		await Promise.all(
			usersToRemove.map(uTR =>
				creditsColl.findOneAndDelete({ userId: uTR.userId })
			)
		);
	}
	//#endregion

	info("Updated credits.");
}

async function updateFlags() {
	info("Updating flags...");

	let flagUsers = [];

	await Promise.all(
		client.guilds.cache
			.first()
			.roles.cache.filter(r => Object.values(creditRoles).includes(r.id))
			.map(async r => {
				const memberArray = r.members.array();
				for (let i = 0; i < r.members.size; i++) {
					const member = memberArray[i];

					// @ts-ignore
					const userFlags = (await member.user.fetchFlags()).toArray();

					if (!flagUsers.find(cU => cU.userId === member.id))
						flagUsers.push({
							userId: member.id,
							flags: userFlags.length > 0 ? userFlags : undefined
						});
				}
			})
	);

	info("Pushing flag changes to database...");

	await Promise.all(
		flagUsers.map(cU =>
			creditsColl.findOneAndUpdate(
				{ userId: cU.userId },
				{ $set: cU },
				{ upsert: true }
			)
		)
	);

	info("Updated flags.");
}

//* create the task for every 6th hour and immediately execute it
//* https://crontab.guru/#0_*/6_*_*_*
schedule.scheduleJob('flag updater', '0 */6 * * *', updateFlags).invoke();
//* create the task for every 15th minute and immediately execute it
//* https://crontab.guru/#*/15_*_*_*_*
schedule.scheduleJob('credits updater', '*/15 * * * *', updateCredits).invoke();

function containsAny(source: Array<string>, target: Array<string>) {
	let result = source.filter(function (item) {
		return target.indexOf(item) > -1;
	});
	return result;
}

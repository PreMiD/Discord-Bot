import { DiscordModule } from "discord-module-loader";

import { client, mainLog, pmdDB } from "../..";
import { AlphaUsers, BetaUsers } from "../../../@types/interfaces";
import config from "../../config";

export default new DiscordModule("betaAlpha");

export const alphaRoles = [config.roles.alpha, config.roles.patron, config.roles.booster, config.roles.volunteer, config.roles.contributor],
	betaRoles = [config.roles.presenceDev];

client.on("ready", async () => {
	const pmdGuild = await client.guilds.fetch(config.guildId);
	const alphaRole = await pmdGuild.roles.fetch(config.roles.alpha),
		betaRole = await pmdGuild.roles.fetch(config.roles.beta);

	if (!alphaRole || !betaRole) return;

	//#region Give users alpha/beta role if they have access in db / should have access

	const eligibleAlphaMembers = new Set<string>();
	for (const role of alphaRoles) {
		const roleMembers = (await pmdGuild.roles.fetch(role))?.members.map(m => m.id) || [];
		for (const member of roleMembers) {
			eligibleAlphaMembers.add(member);
		}
	}

	const eligibleBetaMembers = new Set<string>();
	for (const role of betaRoles) {
		const roleMembers = (await pmdGuild.roles.fetch(role))?.members.map(m => m.id) || [];
		for (const member of roleMembers) {
			//* Member has alpha role, ignore
			if (eligibleAlphaMembers.has(member)) continue;

			eligibleBetaMembers.add(member);
		}
	}

	//* If user has patron/booster/donator role add them to alpha

	await pmdDB.collection<AlphaUsers>("alphaUsers").bulkWrite(
		[...eligibleAlphaMembers].map(m => ({
			updateOne: {
				filter: { userId: m },
				update: { $set: { userId: m } },
				upsert: true
			}
		}))
	);

	//* Remove them from beta if they have alpha
	await pmdDB.collection<BetaUsers>("betaUsers").bulkWrite([
		...[...eligibleAlphaMembers].map(m => ({
			deleteOne: {
				filter: { userId: m }
			}
		})),
		...[...eligibleBetaMembers].map(m => ({
			updateOne: {
				filter: { userId: m },
				update: { $set: { userId: m } },
				upsert: true
			}
		}))
	]);

	//* Update stored users in case they have changed
	const betaUsers = await pmdDB.collection<BetaUsers>("betaUsers").find().toArray(),
		alphaUsers = await pmdDB.collection<AlphaUsers>("alphaUsers").find().toArray();

	//* .has super slow
	const alphaMembersArray = alphaRole.members.map(m => m.id);
	for (const m of alphaUsers) {
		if (alphaMembersArray.includes(m.userId)) continue;
		try {
			mainLog(`Giving alpha role to ${m.userId}`);
			await pmdGuild.members.addRole({ role: alphaRole, user: m.userId, reason: "User has alpha access" });
		} catch {
			mainLog(`Failed to give alpha role to ${m.userId}`);
			await pmdDB.collection<AlphaUsers>("alphaUsers").deleteOne({ userId: m.userId });
		}
	}

	//* .has super slow
	const betaMembersArray = betaRole.members.map(m => m.id);
	for (const m of betaUsers) {
		if (betaMembersArray.includes(m.userId)) continue;
		try {
			mainLog(`Giving beta role to ${m.userId}`);
			await pmdGuild.members.addRole({ role: betaRole, user: m.userId, reason: "User has beta access" });
		} catch {
			mainLog(`Failed to give beta role to ${m.userId}`);
			await pmdDB.collection<BetaUsers>("betaUsers").deleteOne({ userId: m.userId });
		}
	}
	//#endregion

	const alphaUsersDiscord = alphaRole.members.map(m => m.id) || [];

	let betaUsersDiscord = betaRole.members.map(m => m.id) || [];

	//#region Remove beta role from users that have alpha
	for (const m of alphaUsersDiscord) {
		const beta = betaUsersDiscord.find(u => u === m);

		if (beta) {
			mainLog(`Removing beta role from ${m} (has alpha role)`);
			await pmdGuild.members.fetch(m).then(m => m.roles.remove(config.roles.beta));
			betaUsersDiscord = betaUsersDiscord.filter(u => u !== m);
		}
	}
	//#endregion

	//#region Remove users from db if they are not in Discord
	await Promise.all([
		pmdDB.collection<AlphaUsers>("alphaUsers").deleteMany({ userId: { $nin: alphaUsersDiscord } }),
		pmdDB.collection<BetaUsers>("betaUsers").deleteMany({ userId: { $nin: betaUsersDiscord } })
	]);
	//#endregion

	//#region Give users access in db if they have role in Discord
	if (alphaUsersDiscord.length)
		await pmdDB.collection<AlphaUsers>("alphaUsers").bulkWrite(
			alphaUsersDiscord.map(m => ({
				updateOne: {
					filter: { userId: m },
					update: { $set: { userId: m } },
					upsert: true
				}
			}))
		);

	if (betaUsersDiscord.length)
		await pmdDB.collection<BetaUsers>("betaUsers").bulkWrite(
			betaUsersDiscord.map(m => ({
				updateOne: {
					filter: { userId: m },
					update: { $set: { userId: m } },
					upsert: true
				}
			}))
		);
	//#endregion

	await updateBetaUsers();
	setInterval(updateBetaUsers, 1000 * 60 * 5);
});

async function updateBetaUsers() {
	//* Give people beta role in Discord if they have it in db
	const betaUsers = await pmdDB.collection<BetaUsers>("betaUsers").find().toArray();
	const betaUsersDiscord = betaUsers.map(m => m.userId);

	const pmdGuild = await client.guilds.fetch(config.guildId);
	const betaRole = await pmdGuild.roles.fetch(config.roles.beta);

	if (!betaRole) return;

	for (const m of betaUsersDiscord) {
		if (betaRole.members.has(m)) continue;

		try {
			mainLog(`Giving beta role to ${m}`);
			await pmdGuild.members.addRole({ role: betaRole, user: m, reason: "User has beta access" });
		} catch (e) {
			//* User left the server, remove from db
			mainLog(`Removing beta user ${m} from db`);
			await pmdDB.collection<BetaUsers>("betaUsers").deleteOne({ userId: m });
		}
	}

	//* Remove beta role from people in Discord if they don't have it in db
	const betaRoleMembers = betaRole.members.map(m => m.id);
	for (const m of betaRoleMembers) {
		const beta = betaUsersDiscord.find(u => u === m);

		if (!beta) {
			mainLog(`Removing beta role from ${m}`);
			await pmdGuild.members.fetch(m).then(m => m.roles.remove(config.roles.beta));
		}
	}
}

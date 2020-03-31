import { client } from "../..";
import { pmdDB } from "../../database/client";
import { info } from "../../util/debug";
import roles from "../../roles";

let betaUserColl = pmdDB.collection("betaUsers");
let discordUsers = pmdDB.collection("discordUsers");

async function updateDiscordUsers() {
	const dbUsers = await discordUsers
		.find({}, { projection: { _id: false, userId: true } })
		.toArray();

	let guildMembers = await client.guilds.cache
		.get("493130730549805057")
		.members.fetch({ limit: 0 });

	guildMembers.map(async user => {
		if (!dbUsers.find(u => u.userId === user.id))
			discordUsers.insertOne({ userId: user.id });
	});
}

async function updateBetaUsers() {
	const betaUsers = await betaUserColl
		.find({}, { projection: { _id: false } })
		.toArray();

	let guildMembers = (
		await client.guilds.cache
			.get("493130730549805057")
			.members.fetch({ limit: 0 })
	).filter(
		m =>
			(m.roles.cache.has(roles.booster) ||
				betaUsers.find(b => b.userId === m.user.id)) &&
			!m.roles.cache.has(roles.alpha) &&
			!m.roles.cache.has(roles.beta)
	);

	for (let i = 0; i < guildMembers.size; i++)
		await guildMembers.array()[i].roles.add(roles.beta);

	info("Updated beta users.");
}

updateBetaUsers();
updateDiscordUsers();

setInterval(updateBetaUsers, 60 * 1000);

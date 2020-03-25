import { client } from "../..";
import { pmdDB } from "../../database/client";
import { info } from "../../util/debug";
import roles from "../../roles";

let coll = pmdDB.collection("betaAccess");
let betaUserColl = pmdDB.collection("betaUsers");
let discordUsers = pmdDB.collection("discordUsers");

async function updateBetaAccess() {
	const betaUsers = await coll
		.find({}, { projection: { _id: false, userId: true } })
		.toArray();

	let betaUser = (
		await client.guilds.cache.get("493130730549805057").members.fetch({ limit: 0 })
	).filter(
		m => m.roles.cache.has(roles.patron) || m.roles.cache.has(roles.booster)
	);

	betaUser.map(async bU => {
		if (!bU.roles.cache.has(roles.beta)) bU.roles.add(roles.beta);
		if (!betaUsers.find(u => u.userId === bU.id)) coll.insertOne({ userId: bU.id });
	});
}

async function updateDiscordUsers() {
	const dbUsers = await discordUsers
		.find({}, { projection: { _id: false, userId: true } })
		.toArray();

	let guildMembers = await client.guilds.cache
		.get("493130730549805057")
		.members.fetch({ limit: 0 });

	let newUsers = [];

	info("Updating discord users...");

	guildMembers.map(async user => {
		if (!dbUsers.find(u => u.userId === user.id))
			newUsers.push({
				userId: user.id,
				name: user.user.username,
				tag: user.user.discriminator,
				avatar: user.user.displayAvatarURL({ format: "png", dynamic: true })
			});
		else
			discordUsers.findOneAndUpdate(
				{ userId: user.id },
				{
					$set: {
						userId: user.id,
						name: user.user.username,
						tag: user.user.discriminator,
						avatar: user.user.displayAvatarURL({ format: "png", dynamic: true })
					}
				},
				{ upsert: true }
			);
	});

	if (newUsers.length > 0) await discordUsers.insertMany(newUsers);

	info("Updated discord users.");
}

async function updateBetaUsers() {
	const betaUsers = await betaUserColl
		.find({}, { projection: { _id: false, userId: true } })
		.toArray();

	let guildMembers = await client.guilds.cache
		.get("493130730549805057")
		.members.fetch({ limit: 0 });

	info("Updating beta users...");

	guildMembers.map(async user => {
		if (
			betaUsers.find(u => u.userId === user.id) &&
			!user.roles.cache.has(roles.beta)
		)
			user.roles.add(roles.beta);
	});

	info("Updated beta users.");
}

updateBetaAccess();
updateDiscordUsers();
updateBetaUsers();

setInterval(updateBetaUsers, 5 * 60 * 1000);
setInterval(updateDiscordUsers, 5 * 60 * 1000);

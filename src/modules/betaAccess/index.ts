import { client } from "../..";
import { pmdDB } from "../../database/client";
import { info } from "../../util/debug";
import roles from "../../roles";

let coll = pmdDB.collection("betaAccess");
let betaUsers = pmdDB.collection("betaUsers");
let discordUsers = pmdDB.collection("discordUsers");

async function updateBetaAccess() {
	let betaUser = (
		await client.guilds.cache
			.get("493130730549805057")
			.members.fetch({ limit: 0 })
	).filter(
		m => m.roles.cache.has(roles.patron) || m.roles.cache.has(roles.booster)
	);

	betaUser.map(async bU => {
		if (!bU.roles.cache.has(roles.beta)) bU.roles.add(roles.beta);
		if (!(await coll.findOne({ userId: bU.id })))
			coll.insertOne({ userId: bU.id });
	});
}

async function updateDiscordUsers() {
	let guildMembers = await client.guilds.cache.get("493130730549805057").members.fetch({ limit: 0 });

	guildMembers.map(async user => {
		let dbUser = await discordUsers.findOne({ userId: user.id });
		if (!dbUser) discordUsers.insertOne({ userId: user.id });
	});
}

async function updateBetaUsers() {
	let guildMembers = await client.guilds.cache.get("493130730549805057").members.fetch({ limit: 0 });

	info("Updating beta users...");

	guildMembers.map(async user => {
		let betaUser = await betaUsers.findOne({ userId: user.id });
		if (betaUser && !user.roles.cache.has(roles.beta)) user.roles.add(roles.beta);
	});

	info("Updated beta users.");
}

updateBetaAccess();
updateDiscordUsers();
updateBetaUsers();

setInterval(updateBetaUsers, 5 * 60 * 1000);
import { client } from "../..";
import { MongoClient } from "../../database/client";
import roles from "../../roles";

let coll = MongoClient.db("PreMiD").collection("betaAccess");
let discordUsers = MongoClient.db("PreMiD").collection("discordUsers");

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

updateBetaAccess();
updateDiscordUsers();

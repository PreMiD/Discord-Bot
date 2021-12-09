import { client, mainLog, pmdDB } from "..";
import { Presences } from "../../@types/interfaces";
import config from "../config";

export default async function () {
	await managePresenceDevelopers();
	setInterval(managePresenceDevelopers, 15 * 60 * 1000);
}

async function managePresenceDevelopers() {
	const log = mainLog.extend("managePresenceDevelopers");

	log("Updating...");
	const presenceDevs = [
		...new Set(
			(
				await pmdDB
					.collection<Presences>("presences")
					.find(
						{},
						{
							projection: {
								"metadata.author.id": true,
								"metadata.contributors.id": true,
								_id: false
							}
						}
					)
					.map(u => [
						u.metadata.author.id,
						...(u.metadata.contributors?.map(c => c.id) || [])
					])
					.toArray()
			).flat()
		)
	];

	const pmdGuild = await client.guilds.fetch(config.guildId);

	for (const pDev of presenceDevs)
		try {
			const member = await pmdGuild.members.fetch(pDev);
			if (!member.roles.cache.has(config.roles.presenceDev)) {
				await member.roles.add(config.roles.presenceDev);
				log("Added missing role to %s", member.user.tag);
			}
		} catch (err) {}

	log("Updated!");
}

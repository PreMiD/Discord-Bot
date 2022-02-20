import { DiscordEvent } from "discord-module-loader";

import { client, mainLog, moduleLoader, pmdDB } from "..";
import { Presences } from "../../@types/interfaces";
import config from "../config";

export default new DiscordEvent("ready", async () => {
	await managePresenceDevelopers();
	setInterval(managePresenceDevelopers, 15 * 60 * 1000);

	updateStatusActivity();
	setInterval(updateStatusActivity, 60 * 1000);

	mainLog("Updating slash commands");
	await moduleLoader.updateSlashCommands();

	mainLog("Connected to Discord");
});

async function updateStatusActivity(): Promise<void> {
	const presences = (await pmdDB.collection<Presences>("presences").find({}).toArray())
			.map(presence => presence.metadata)
			.filter(presence => !presence.tags.includes("nsfw")),
		randomPresence = presences[Math.floor(Math.random() * presences.length)];
	client.user?.setActivity(randomPresence.service, {
		type: randomPresence.category === "music" ? "LISTENING" : randomPresence.category === "videos" ? "WATCHING" : "PLAYING"
	});
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
					.map(u => [u.metadata.author.id, ...(u.metadata.contributors?.map(c => c.id) || [])])
					.toArray()
			).flat()
		)
	];

	const pmdGuild = await client.guilds.fetch(config.guildId),
		members = (await pmdGuild.members.fetch()).filter(m => presenceDevs.includes(m.id));

	for (const pDev of members.values())
		try {
			if (!pDev.roles.cache.has(config.roles.presenceDev)) {
				await pDev.roles.add(config.roles.presenceDev);
				log("Added missing role to %s", pDev.user.tag);
			}
		} catch (err) {}

	log("Updated!");
}

import { DiscordEvent } from "discord-module-loader";
import { ActivityType } from "discord.js";

import { client, mainLog, moduleLoader, pmdDB } from "..";
import { Presences } from "../../@types/interfaces";
import config from "../config";

export default new DiscordEvent("ready", async () => {
	managePresenceDevelopers().then(() => {
		setInterval(managePresenceDevelopers, 15 * 60 * 1000);
	});

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
		type:
			randomPresence.category === "music"
				? ActivityType.Listening
				: randomPresence.category === "videos"
				? ActivityType.Watching
				: ActivityType.Playing
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
		presenceDevRole = await pmdGuild.roles.fetch(config.roles.presenceDev);

	if (!presenceDevRole) return log("Presence Dev role not found");

	for (const member of presenceDevRole.members.values())
		if (!presenceDevs.includes(member.id)) {
			await member.roles.remove(presenceDevRole);
			log("Removed role from %s", member.user.tag);
		}

	for (const pDev of presenceDevs) {
		if (presenceDevRole.members.has(pDev)) continue;

		try {
			await pmdGuild.members.addRole({ role: presenceDevRole, user: pDev });
			log("Added role to %s", pDev);
		} catch (err) {
			log("Failed to add role to %s", pDev);
		}
	}

	log("Updated!");
}

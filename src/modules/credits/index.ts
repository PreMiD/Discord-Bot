import { DiscordModule } from "discord-module-loader";
import { GuildMember } from "discord.js";

import { client, pmdDB } from "../..";
import { Credits } from "../../../@types/interfaces";
import config from "../../config";
import roleColors from "./roleColors";
import roles from "./roles";

export default new DiscordModule("credits");

client.on("ready", async => {
	updateCredits();
	setInterval(updateCredits, 5 * 60 * 1000);
});

export async function updateCredits() {
	const guild = await client.guilds.fetch(config.guildId),
		creditUsers: GuildMember[] = [];

	await guild.members.fetch({ limit: 0 });

	for (const r of Object.values(roles)) {
		const role = await guild.roles.fetch(r);

		if (!role) continue;

		creditUsers.push(...role.members.values());
	}

	const members = [...new Set(creditUsers)].map(m => {
		const highestRole = m.roles.cache
			.filter(r => Object.values(roles).includes(r.id))
			.sort((a, b) => b.position - a.position)
			.at(0)!;

		const color =
			//@ts-expect-error
			roleColors[Object.entries(roles).find(v => v[1] === highestRole.id)![0]] as string;

		return {
			userId: m.id,
			name: m.user.username,
			tag: m.user.discriminator,
			avatar: m.user.displayAvatarURL({
				format: "png",
				dynamic: true
			}),
			premium_since: m.premiumSince !== null ? m.premiumSinceTimestamp! : undefined,
			role: highestRole.name,
			roleId: highestRole.id,
			roles: m.roles.cache.filter(r => r.name !== "@everyone").map(r => r.name),
			roleIds: m.roles.cache.filter(r => r.name !== "@everyone").map(r => r.id),
			roleColor: color,
			rolePosition: highestRole.position,
			status: m.presence?.status ?? "offline"
		};
	});

	await pmdDB.collection<Credits>("credits").bulkWrite(
		members.map(m => ({
			updateOne: {
				filter: { userId: m.userId },
				update: { $set: m },
				upsert: true
			}
		}))
	);
}

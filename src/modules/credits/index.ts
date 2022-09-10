import { DiscordModule } from "discord-module-loader";
import { GuildMember } from "discord.js";

import { client, pmdDB } from "../..";
import { Credits } from "../../../@types/interfaces";
import config from "../../config";
import roleColors from "./roleColors";
import roles from "./roles";

export default new DiscordModule("credits");

client.once("ready", () => {
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

	const oldCreditUsers = await pmdDB
		.collection<Credits>("credits")
		.find({ userId: { $nin: creditUsers.map(c => c.id) } })
		.toArray();

	const members = [...new Set(creditUsers)].map(m => {
		const highestRole = m.roles.highest;

		const color = roleColors[Object.values(roles).find((v: string) => v === highestRole.id)!];

		return {
			userId: m.id,
			name: m.user.username,
			tag: m.user.discriminator,
			avatar: m.user.displayAvatarURL({
				extension: "png"
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

	await pmdDB.collection<Credits>("credits").bulkWrite([
		...members.map(m => ({
			updateOne: {
				filter: { userId: m.userId },
				update: { $set: m },
				upsert: true
			}
		})),
		...oldCreditUsers.map(m => ({ deleteOne: { filter: { userId: m.userId } } }))
	]);
}

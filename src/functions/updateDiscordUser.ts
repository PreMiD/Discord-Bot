import { container } from '@sapphire/pieces';
import { GuildMember } from 'discord.js';

export default async function (member: GuildMember) {
	await container.database.discordUsers.upsert({
		where: {
			userId: member.id
		},
		update: {
			username: member.user.username,
			discriminator: member.user.discriminator,
			avatar: member.user.displayAvatarURL(),
			created: member.user.createdTimestamp
		},
		create: {
			userId: member.id,
			username: member.user.username,
			discriminator: member.user.discriminator,
			avatar: member.user.displayAvatarURL(),
			created: member.user.createdTimestamp
		}
	});
}

import updateDiscordUser from '../functions/updateDiscordUser';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { type GuildMember } from 'discord.js';
import config from '../config';

@ApplyOptions<Listener.Options>({
	name: 'guildMemberAdd'
})
export class GuildMemberAddListener extends Listener {
	public override async run(member: GuildMember) {
		const isPresenceDev =
			(await this.container.database.presences.findFirst({
				where: {
					OR: [
						{
							metadata: {
								is: {
									author: {
										id: member.id
									}
								}
							}
						},
						{
							metadata: {
								is: {
									contributors: [
										{
											id: member.id
										}
									]
								}
							}
						}
					]
				}
			})) !== undefined;

		if (isPresenceDev) await member.roles.add(config.roles.presenceDev);
		updateDiscordUser(member);
	}
}

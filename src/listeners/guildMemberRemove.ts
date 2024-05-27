import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { type GuildMember } from 'discord.js';

@ApplyOptions<Listener.Options>({
	name: 'guildMemberRemove'
})
export class GuildMemberRemoveListener extends Listener {
	public override async run(member: GuildMember) {
		await this.container.database.discordUsers.delete({
			where: {
				userId: member.user.id
			}
		});
		await this.container.database.credits.delete({
			where: {
				userId: member.user.id
			}
		});
		await this.container.database.betaUsers.delete({
			where: {
				userId: member.user.id
			}
		});
		await this.container.database.alphaUsers.delete({
			where: {
				userId: member.user.id
			}
		});
	}
}

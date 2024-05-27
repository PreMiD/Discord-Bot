import updateDiscordUser from '../functions/updateDiscordUser';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { type GuildMember } from 'discord.js';

@ApplyOptions<Listener.Options>({
	name: 'guildMemberUpdate'
})
export class GuildMemberUpdateListener extends Listener {
	public override async run(member: GuildMember) {
		updateDiscordUser(member);
	}
}

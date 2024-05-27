import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { ActivityType } from 'discord.js';
import config from '../config';

@ApplyOptions<Listener.Options>({
	name: 'ready'
})
export class ReadyListener extends Listener {
	public override run() {
		this.managePresenceDevelopers().then(() => void setInterval(this.managePresenceDevelopers, 15 * 60 * 1000));
		this.updateStatusActivity().then(() => void setInterval(this.updateStatusActivity, 60 * 1000));
	}

	private async updateStatusActivity() {
		const presences = (await this.container.database.presences.findMany())
			.map((presence) => presence.metadata)
			.filter((presence) => !presence.tags.includes('nsfw'));

		if (0 >= presences.length) return;

		const randomPresence = presences[Math.floor(Math.random() * presences.length)];

		this.container.client.user?.setActivity(randomPresence.service, {
			type:
				randomPresence.category === 'music'
					? ActivityType.Listening
					: randomPresence.category === 'videos'
						? ActivityType.Watching
						: ActivityType.Playing
		});
	}

	private async managePresenceDevelopers() {
		const pmdGuild = await this.container.client.guilds.fetch(config.guildId).catch(() => undefined);
		if (!pmdGuild) return;

		const presenceDevRole = await pmdGuild.roles.fetch(config.roles.presenceDev).catch(() => undefined);
		if (!presenceDevRole) return;

		const presenceDevRoleMembers = presenceDevRole.members.map((m) => m.id);
		const presenceDevs = [
			...new Set(
				(await this.container.database.presences.findMany())
					/*
                							projection: {
								"metadata.author.id": true,
								"metadata.contributors.id": true,
								_id: false
							}
                */
					.map((u) => [u.metadata.author.id, ...(u.metadata.contributors?.map((c) => c.id) || [])])
					.flat()
			)
		];

		for (const member of presenceDevRole.members.values())
			if (!presenceDevs.includes(member.id)) {
				await member.roles.remove(presenceDevRole);
				this.container.logger.debug('[Presence Developer]', `Removed role from ${member.user.username}`);
			}

		for (const pDev of presenceDevs) {
			if (presenceDevRoleMembers.includes(pDev)) continue;

			await pmdGuild.members
				.addRole({ role: presenceDevRole, user: pDev })
				.then(() => void this.container.logger.debug(`Added role to ${pDev}`))
				.catch(() => void this.container.logger.debug(`Failed to add role to ${pDev}`));
		}
	}
}

import { SapphireClient, container } from '@sapphire/framework';
import { PrismaClient } from '@prisma/client';

export class PreMiDClient extends SapphireClient {
	constructor() {
		super({
			intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'GuildPresences']
		});
	}

	public override async login(token?: string) {
		const loginResult = await super.login(token ?? process.env.TOKEN);
		container.database = new PrismaClient();
		return loginResult;
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		database: PrismaClient;
	}
}

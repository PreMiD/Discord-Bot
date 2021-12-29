import { Snowflake } from "discord-api-types";

export interface UserSettings {
	userId: Snowflake;
	showContributor: boolean;
}

export interface BetaUsers {
	userId: Snowflake;
}

export type AlphaUsers = BetaUsers;

export interface DiscordUsers {
	userId: Snowflake;
	avatar: string;
	created: number;
	discriminator: string;
	username: string;
}

export interface Credits {
	userId: Snowflake;
	avatar: string;
	name: string;
	premium_since: number | undefined;
	role: string;
	roleColor: string;
	roleId: string;
	roleIds: string[];
	rolePosition: number;
	roles: string[];
	status: PresenceStatus;
	tag: string;
	flags: UserFlags;
}

export interface Presences {
	metadata: {
		service: string;
		color: string;
		author: { id: Snowflake };
		contributors?: { id: Snowflake }[];
		url: string | string[];
		description: {
			en: string;
		};
		version: string;
		logo: string;
		category: string;
		tags: string | string[];
	};
}

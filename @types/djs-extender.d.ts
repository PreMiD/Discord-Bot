import * as Discord from "discord.js";

export type ChangeTypeOfKeys<
	T extends object,
	Keys extends keyof T,
	NewType
> = {
	// Loop to every key. We gonna check if the key
	// is assignable to Keys. If yes, change the type.
	// Else, retain the type.
	[key in keyof T]: key extends Keys ? NewType : T[key];
};

//* Extend Client from discord.js
declare module "discord.js" {
	interface Client {
		commands: Discord.Collection<
			string | undefined,
			{ run: Function; config: CommandProps }
		>;
		aliases: Discord.Collection<string, string>;
		elevation: Function;
		infos: Discord.Collection<string, any>;
		infoAliases: Discord.Collection<string, string>;
		discordCommands: Discord.Collection<string, ApplicationCommand>;
	}
}

//* Command Properties
export interface CommandProps {
	description?: string;
	name?: string;
	permLevel: number;
	enabled: boolean;
	aliases: Array<string>;
	hidden?: boolean;
	discordCommand?: boolean;
}

export interface ApplicationCommandInteractionDataOptionResult
	extends ChangeTypeOfKeys<
		Omit<ApplicationCommandInteractionDataOption, "options">,
		"value",
		string | number
	> {
	options?: ApplicationCommandInteractionDataOptionResult[];
}

export interface InteractionResponse {
	id: Discord.Snowflake;
	type: InteractionType;
	data?: {
		id: string;
		name: string;
		options: ApplicationCommandInteractionDataOptionResult[];
	};
	guild: Discord.Guild;
	channel: Discord.TextChannel;
	member: Discord.GuildMember;
	token: string;
	version: number;
}

export declare enum InteractionType {
	Ping = 1,
	ApplicationCommand = 2
}

export interface ApplicationCommand {
	id: Discord.Snowflake;
	application_id: Discord.Snowflake;
	name: string;
	description: string;
	options?: ApplicationCommandOption[];
}

export interface ApplicationCommandOption {
	type: ApplicationCommandOptionType;
	name: string;
	description: string;
	default?: boolean;
	required?: boolean;
	choices?: ApplicationCommandOptionChoice[];
	options?: ApplicationCommandOption[];
}

export interface ApplicationCommandOptionChoice {
	name: string;
	value: string | number;
}

export interface ApplicationCommandInteractionData {
	id: Discord.Snowflake;
	name: string;
	options?: ApplicationCommandInteractionDataOption[];
}

export interface ApplicationCommandInteractionDataOption {
	name: string;
	value?: ApplicationCommandOptionType;
	options?: ApplicationCommandInteractionDataOption[];
}

export declare enum ApplicationCommandOptionType {
	SUB_COMMAND = 1,
	SUB_COMMAND_GROUP = 2,
	STRING = 3,
	INTEGER = 4,
	BOOLEAN = 5,
	USER = 6,
	CHANNEL = 7,
	ROLE = 8
}

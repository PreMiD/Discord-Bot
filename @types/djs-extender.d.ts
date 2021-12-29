import { ApplicationCommandData, ApplicationCommandPermissionData, AutocompleteInteraction, CommandInteraction } from "discord.js";

declare module "discord.js" {
	interface Client {
		commands: Discord.Collection<string, ClientCommand>;
	}
}

export interface ClientCommand {
	run?: (int: CommandInteraction | AutocompleteInteraction) => void;
	command: ApplicationCommandData;
	permissions?: ApplicationCommandPermissionData[];
}

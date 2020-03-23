import * as Discord from "discord.js";

//* Extend Client from discord.js
declare module "discord.js" {
	interface Client {
		commands: Discord.Collection<string | undefined, CommandProps>;
		aliases: Discord.Collection<string, string>;
		elevation: Function;
		infos: Discord.Collection<string, any>;
		infoAliases: Discord.Collection<string, string>;
	}
}

//* Command Properties
interface CommandProps {
	description: any;
	name: string;
	permLevel: number;
	enabled: boolean;
	aliases: Array<string>;
	hidden?: boolean;
}

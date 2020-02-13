import * as Discord from "discord.js";
import config from "../config";

module.exports = (message: Discord.Message) => {
	//* Message is command
	if (!message.content.startsWith(config.prefix)) return;

	//* Prevent bots
	if (message.author?.bot) return;

	let command = message.content.split(" ")[0].slice(config.prefix.length),
		params = message.content.split(" ").slice(1),
		perms = message.client.elevation(message.author.id),
		cmd: any;

	//* .cache.get current command from commands/aliases
	if (message.client.commands.has(command))
		cmd = message.client.commands.get(command);
	else if (message.client.aliases.has(command)) {
		cmd = message.client.commands.get(message.client.aliases.get(command));
	}

	//* Run command if found
	if (cmd) {
		//TODO Send fancy no permission message
		if (
			typeof cmd.config.permLevel != "undefined" &&
			perms < cmd.config.permLevel
		)
			return;

		//* Run the command
		cmd.run(message, params, perms);
	}
};

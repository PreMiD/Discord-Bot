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

	//* Get current command from commands/aliases
	if (message.client.commands.has(command)) cmd = message.client.commands.get(command);
	else if (message.client.aliases.has(command)) cmd = message.client.commands.get(message.client.aliases.get(command));

	//* Run command if found
	if (cmd) {
		//* Disable use of SeMiD in main server
		if(message.guild.me.id == "574233163660918784" && message.guild.id == "493130730549805057") return;

		if (typeof cmd.config.permLevel != "undefined" && perms < cmd.config.permLevel)
			//* Send Embed if user does not have permissions to run the command
			return sendFancyMessage(message, cmd);

		//* Run the command
		cmd.run(message, params, perms);
	} else message.react("❌"), message.delete({ timeout: 5 * 1000 });
};

function sendFancyMessage(message, cmd) {
	message.channel.send({
		embed: {
			description: "Whoopsies, it seems' like you do not have permission to run this command!",
			color: "RED",
			footer: `${message.author.tag} | ${cmd.config.name}`
		}
	}).then(msg => {
		message.delete({ timeout: 5 * 1000 });
		msg.delete({ timeout: 5 * 1000 });
	});
}
import { GuildMember, TextChannel, CommandInteraction } from "discord.js";

import { client } from "..";
import { sendFancyMessage } from "../util/FancyMessage";

module.exports = async (command: CommandInteraction) => {
	const cmd = client.commands.find(
			c => c.config.name === command.commandName && c.config.discordCommand
		),
		perms = client.elevation(command.user.id);

	if (!cmd) return;
	if (
		typeof cmd.config.permLevel != "undefined" &&
		perms < cmd.config.permLevel
	)
		//* Send Embed if user does not have permissions to run the command
		return sendFancyMessage(
			{
				channel: client.guilds
					.resolve(command.guildId)
					.channels.resolve(command.channelId) as TextChannel,
				author: client.users.resolve(command.user.id)
			},
			cmd
		);

	//* Run the command
	cmd.run(command);
};

import * as Discord from "discord.js";

import { client } from "../../..";
import { InteractionResponse } from "../../../../@types/djs-extender";
import config from "../../../config";
import UniformEmbed from "../../../util/UniformEmbed";

module.exports.run = async (data: InteractionResponse, permLevel: number) => {
	let cmds = client.commands.filter(
		cmd =>
			!cmd.config.hidden &&
			permLevel >= (cmd.config.permLevel ? cmd.config.permLevel : 0)
	);

	let embed = new UniformEmbed(
		{
			description:
				cmds
					.map(
						cmd =>
							`**\`${cmd.config.discordCommand ? "/" : config.prefix}${
								cmd.config.name
							}\`** - *${
								cmd.config.discordCommand
									? client.discordCommands.get(cmd.config.name).description
									: cmd.config.description
							}*`
					)
					.join("\n") +
				"\n\n*These are the commands you can execute with your permission level.*"
		},
		":book: Help"
	);

	data.channel
		.send(data.member.toString(), embed)
		.then((msg: Discord.Message) => msg.delete({ timeout: 30 * 1000 }));
};

module.exports.config = {
	name: "help",
	discordCommand: true
};

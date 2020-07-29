import * as Discord from "discord.js";
import { client } from "../../..";

module.exports.run = async (
	message: Discord.Message,
	params: Array<string>
) => {
	message.delete();

if (params[0] == undefined || params[0].length == 0 || params[0].toLowerCase() == "list") {
		message.reply(
			new Discord.MessageEmbed({
				title: "All possible options for this command:",
				color: "RANDOM",
				description: client.infos
					.keyArray()
					.map(k => {
						return "``" + k + "``";
					})
					.join(", "),
				footer: {
					text: message.author.tag,
					iconURL: message.author.avatarURL()
				}
			})
		);
		return;
	}

	if (
		!(
			client.infos.has(params[0].toLowerCase()) ||
			client.infoAliases.has(params[0].toLowerCase()) ||
			client.infos.has(client.infoAliases.get(params[0].toLowerCase()))
		)
	) {
		(await message.reply("Please enter a valid name")).delete({
			timeout: 5 * 1000
		});
		return;
	}

	const info =
			client.infos.get(params[0].toLowerCase()) ||
			client.infos.get(client.infoAliases.get(params[0].toLowerCase())),
		embed = new Discord.MessageEmbed({
			title: info.title || "No Title",
			description: info.description || "No description provided.",
			color: info.color || "36393F",
			footer: {
				text: info.footer || `by ${message.author.tag}`,
				iconURL: message.author.avatarURL({})
			}
		});

	message.channel.send(embed);
};

module.exports.config = {
	name: "info",
	description: "Shortcuts to get things done faster."
};

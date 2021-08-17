import * as Discord from "discord.js";

export async function sendFancyMessage(
	message:
		| Discord.Message
		| { channel: Discord.TextChannel; author: Discord.User },
	cmd: any
) {
	if (message instanceof Discord.Message) await message.delete();

	const response = await message.channel.send({
		embeds: [
			new Discord.MessageEmbed({
				description:
					"Whoopsies, it seems' like you do not have permission to run this command!",
				color: "RED",
				footer: {
					text: `${message.author.tag} | ${cmd.config.name}`
				}
			})
		]
	});

	setTimeout(() => response.delete(), 5 * 1000);
}

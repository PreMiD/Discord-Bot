import * as Discord from "discord.js";
import TicketStats from "../classes/TicketStats";

module.exports.run = async (
	message: Discord.Message,
	params: string[],
	perms: number
) => {
	message.delete();

	let userActivity: Discord.GuildMember;

	if (params[0] == undefined && message.mentions.users.size == 0)
		userActivity = await message.guild.members.fetch(message.author.id);
	else if (params[0].length)
		userActivity =
			message.mentions.members.first() !== undefined
				? message.mentions.members.first()
				: await message.guild.members.fetch(params[0]).catch(() => {
						return undefined;
				  });

	if (userActivity === undefined)
		return message.channel
			.send(
				new Discord.MessageEmbed({
					title: "Error",
					description: "Could not find user.",
					color: "#7289DA",
				})
			)
			.then((msg) => msg.delete({ timeout: 2500 }));

	//* Management only.
	if (
		perms < 4 &&
		params[0] !== undefined &&
		params[0].length &&
		userActivity.id !== message.author.id
	)
		return message.channel
			.send(
				new Discord.MessageEmbed({
					title: "Error",
					description: "No permissions.",
					color: "#7289DA",
				})
			)
			.then((msg) => msg.delete({ timeout: 2500 }));

	let ticketStats = new TicketStats();

	message.channel
		.send({
			files: [await ticketStats.getUserActivity(userActivity.id)],
		})
		.then((msg) => msg.delete({ timeout: 10000 }));
};

module.exports.config = {
	name: "activity",
	description: "Check the activity of a staff member.",
	permLevel: 1,
};

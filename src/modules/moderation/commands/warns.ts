import * as Discord from "discord.js";
import { pmdDB } from "../../../database/client";

module.exports.run = async (
	message: Discord.Message,
	params: Array<string>,
	perms: number
) => {
	message.delete();

	let coll = pmdDB.collection("warns");

	if (params.length == 0 && message.mentions.users.size == 0) {
		let user = await coll.findOne({ userId: message.author.id });
		if (!user) {
			((await message.reply(
				"You don't have any warnings."
			)) as Discord.Message).delete({ timeout: 10 * 1000 });
			return;
		}
		let embed = new Discord.MessageEmbed({
			title: "Your Warnings",
			author: {
				name: message.author.tag,
				iconURL: message.author.displayAvatarURL({ size: 64 })
			},
			description: user.warns
				.map(warn => {
					return `\`\`${warn.reason}\`\` by <@${warn.userId}> (${new Date(
						warn.timestamp
					).toLocaleString("en-US")})`;
				})
				.join("\n"),
			color: "#FF7000"
		});
		message.author.send(embed).catch(err => {
			if (err) {
				message.channel.send(embed);
			}
		});
	} else if (perms > 1) {
		let user = await coll.findOne({
			userId: message.mentions.users.first().id
		});
		if (!user) {
			((await message.author.send(
				`${message.mentions.users.first().username} doesn't have any warnings.`
			)) as Discord.Message).delete({ timeout: 10 * 1000 }).catch(async err => {
				if (err) {
					((await message.channel.send(
						`${message.mentions.users.first().username} doesn't have any warnings.`
					)) as Discord.Message).delete({ timeout: 10 * 1000 })
				}
			})
			return;
		}
		let embed = new Discord.MessageEmbed({
			title: `${message.mentions.users.first().username}'s Warnings`,
			author: {
				name: message.mentions.users.first().tag,
				iconURL: message.mentions.users.first().displayAvatarURL({ size: 64 })
			},
			description: user.warns
				.map(warn => {
					return `\`\`${warn.reason}\`\` by <@${warn.userId}> (${new Date(
						warn.timestamp
					).toLocaleString("en-US")})`;
				})
				.join("\n"),
			color: "#FF7000"
		});
		((await message.author.send(embed)) as Discord.Message).delete({
			timeout: 15 * 1000
		}).catch(async err => {
			if (err) {
				((await message.channel.send(embed)) as Discord.Message).delete({
					timeout: 15 * 1000
				})
			}
		});
	} else message.reply("Your permission level is to low to see other people's warnings!");
};

module.exports.config = {
	name: "warns",
	description: "Shows your or a users warning's."
};

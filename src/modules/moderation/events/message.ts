import * as Discord from "discord.js";
import { client } from "../../..";
import roles from "../../../roles";
import messageFilter from "../messageFilter";
import channels from "../../../channels";

module.exports.run = async (message: Discord.Message) => {
	let filterResult = messageFilter.find(m =>
		message.content
			.toLowerCase()
			.match(new RegExp(m.message.toLowerCase(), "i"))
	);

	//* Ignore bots
	if (message.author.bot) return;

	if (await checkInvite(message.content)) {
		message
			.reply("**Invite links are not allowed**")
			.then(msg => msg.delete({ timeout: 10 * 1000 }));
		message.delete();
	}

	//* Return if permission level > 0
	if (!filterResult) return;

	if (filterResult.mute) {
		message.member.roles.add(roles.muted);

		let embed = new Discord.MessageEmbed({
			author: {
				name: message.member.displayName,
				iconURL: message.author.displayAvatarURL({ size: 128 })
			},
			color: "#fc3c3c",
			timestamp: new Date(),
			fields: [
				{
					name: "Channel",
					value: `<#${message.channel.id}>`
				},
				{
					name: "Message",
					value: message.content
				}
			]
		});

		if (message.guild.channels.cache.has(channels.moderators))
			(message.guild.channels.cache.get(
				channels.moderators
			) as Discord.TextChannel).send("Please check this mute!", {
				embed: embed
			});
	}

	message
		.reply(filterResult.botMessage)
		.then((msg: Discord.Message) => msg.delete({ timeout: 15 * 1000 }));
};

module.exports.config = {};

export async function checkInvite(string: string) {
	let invites = (await client.guilds.cache.first().fetchInvites()).map(
			invite => invite.url
		),
		disallowedPatterns = [
			/(discord.gg\/[\s\S]+)/g,
			/(discord.me\/[\s\S]+)/g,
			/(discordapp.com\/invite\/[\s\S]+)/g,
			/(top.gg\/servers\/[\s\S]+)/g,
			/(disboard.org\/server\/join\/[\s\S]+)/g,
			/(discordservers.com\/join\/[\s\S]+)/g,
			/(discordbee.com\/invite\?server=[\s\S]+)/g,
			/(invite.gg\/[\s\S]+)/g,
			/(dyno.gg\/servers\/[\s\S]+)/g
		];

	invites.push("discord.gg/premid");

	let ownInvite = invites.filter(iURL =>
		string.toLowerCase().includes(iURL.toLowerCase())
	);

	if (ownInvite.length > 0) invites.map(i => (string = string.replace(i, "")));

	return disallowedPatterns.some(pattern => string.match(pattern));
}

import * as Discord from "discord.js";
import roles from "../../../roles";
import channels from "../../../channels";

module.exports = async (member: Discord.GuildMember) => {
	//* Bot check > 2 months (5184000000)
	if (
		(member.user.username.match(/\d$/) ||
			member.user.username.match(/[\\w.]+/)) &&
		member.user.createdTimestamp > Date.now() - 5184000000
	) {
		let embed = new Discord.MessageEmbed()
			.setAuthor(`${member.displayName}`, member.user.displayAvatarURL())
			.addField("Account creation date", member.user.createdAt)
			.setColor("#fc3c3c")
			.setFooter("POSSIBLE BOT")
			.setTimestamp();

		if (member.user.defaultAvatarURL === member.user.displayAvatarURL()) {
			embed.addField("Action", "User Kicked");
			member.user.send(
				"Oops, your account looks a bit robotic _beep boop_, use a nice avatar and username to make it less robotic to gain entrance to our server."
			);
			if (member.guild.channels.has(channels.logs))
				(member.guild.channels.get(channels.logs) as Discord.TextChannel)
					.send(embed)
					.then(function() {
						member.kick("Possible bot");
					});
		} else {
			member.roles.add(roles.muted, "Possible bot");
			embed.addField("Action", "User muted");
			member.user.send(
				"Oops, your account looks a bit robotic _beep boop_, contact one of our mods to gain write access our channels."
			);
			if (member.guild.channels.has(channels.moderators))
				(member.guild.channels.get(
					channels.moderators
				) as Discord.TextChannel).send(embed);
		}
	}
};

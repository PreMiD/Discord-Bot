var { logs } = require('../config.json'),
	Discord = require('discord.js');

module.exports = async (oldMessage, newMessage) => {
	if (oldMessage.author.bot) return;

	var embed = new Discord.RichEmbed()
		.setAuthor(`${oldMessage.member.displayName}`, oldMessage.author.avatarURL)
		.addField('Channel', `<#${oldMessage.channel.id}>`)
		.addField('Old Message', oldMessage.content, true)
		.addField('New Message', newMessage.content, true)
		.setColor('#F4DD1A')
		.setFooter(`${oldMessage.member.displayName} edited message`, 'https://raw.githubusercontent.com/PreMiD/Discord-Bot/master/.discord/yellow_circle.png')
		.setTimestamp();

	if (oldMessage.guild.channels.has(logs)) oldMessage.guild.channels.get(logs).send(embed);
};

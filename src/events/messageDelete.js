var { logs } = require('../config.json'),
	Discord = require('discord.js'),
	{ starRemove } = require('../util/starboard')

module.exports = async (message) => {
	starRemove(message)
	if (message.author.bot) return;

	var embed = new Discord.RichEmbed()
		.setAuthor(`${message.member.displayName}`, message.author.avatarURL)
		.addField('Channel', `<#${message.channel.id}>`)
		.addField('Message', message.content)
		.setColor('#fc3c3c')
		.setFooter('MESSAGE DELETED')
		.setTimestamp();

	if (message.guild.channels.has(logs)) message.guild.channels.get(logs).send(embed);
};

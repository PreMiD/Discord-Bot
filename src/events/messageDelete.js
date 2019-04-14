var { logs } = require('../config.json'),
	Discord = require('discord.js');

module.exports = async (message) => {
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

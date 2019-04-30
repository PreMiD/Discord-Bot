var { logs } = require('../config.json'),
	Discord = require('discord.js'),
	{ starAdd } = require('../util/starboard');

module.exports = async (oldMessage, newMessage) => {
	starAdd(newMessage.reactions.get('⭐'));
	if (oldMessage.author.bot) return;

	var embed = new Discord.RichEmbed()
		.setAuthor(`${oldMessage.member.displayName}`, oldMessage.author.avatarURL)
		.addField('Channel', `<#${oldMessage.channel.id}>`)
		.addField('Old Message', oldMessage.content, true)
		.addField('New Message', newMessage.content, true)
		.setColor('#fc3c3c')
		.setFooter('MESSAGE EDITED')
		.setTimestamp();

	if (oldMessage.guild.channels.has(logs)) oldMessage.guild.channels.get(logs).send(embed);
};

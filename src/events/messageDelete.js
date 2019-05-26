var {
	logs
} = require('../config.json'),
	Discord = require('discord.js');

module.exports = async (message) => {

	if (message.author.bot) return;

	const entry = await message.guild.fetchAuditLogs({
		type: 'MESSAGE_DELETE'
	}).then(audit => audit.entries.first())
	let user = ""
	if (entry.extra.channel.id === message.channel.id &&
		(entry.target.id === message.author.id) &&
		(entry.createdTimestamp > (Date.now() - 5000)) &&
		(entry.extra.count >= 1)) {
		user = entry.executor.username
	} else {
		user = message.author.username
	}

	var embed = new Discord.RichEmbed()
		.setAuthor(`${message.member.displayName}`, message.author.avatarURL)
		.addField('Channel', `<#${message.channel.id}>`, true)
		.addField('Message', message.content, true)
		.setColor('#DD2E44')
		.setFooter(`${message.member.displayName}'s message was deleted by ${user}`, 'https://raw.githubusercontent.com/PreMiD/Discord-Bot/master/.discord/red_circle.png')
		.setTimestamp();

	if (message.guild.channels.has('515995590199345185')) message.guild.channels.get('515995590199345185').send(embed);
};

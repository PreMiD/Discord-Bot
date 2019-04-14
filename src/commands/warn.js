var Discord = require('discord.js');
var { prefix } = require('../config.json');
var { query } = require('../database/functions');

exports.run = async (client, message, params) => {
	await message.delete();
	if (params.length < 2) {
		message
			.reply(`Usage: \`\`${prefix}warn <user> <reason>\`\``)
			.then((msg) => setTimeout(() => msg.delete(), 10 * 1000));
	} else {
		var user = message.mentions.users.first();
		if (user) {
			if (!user.bot) {
				if (user.id != message.author.id) {
					var warns =
						(await query('SELECT COUNT(*) AS warns FROM warns WHERE user_id = ?', user.id)).rows[0].warns +
						1;
					await query('INSERT INTO warns (user_id, reason, moderator_id) VALUES (?, ?, ?)', [
						user.id,
						params.slice(1, params.length).join(' '),
						message.author.id
					]);
					var embed = new Discord.RichEmbed()
						.setColor('#FF6400')
						.setTimestamp(new Date())
						.setAuthor('Warning')
						.addField('Moderator', `<@${message.author.id}>`, true)
						.addField('Reason', `\`\`${params.slice(1, params.length).join(' ')}\`\``, true)
						.addField('Warnings', `**${warns}**`);
					message.channel.send(`<@${user.id}> you have been warned by **${message.member.displayName}**!`, {
						embed: embed
					});
				} else {
					message
						.reply('Why would you warn yourself? :thinking:')
						.then((msg) => setTimeout(() => msg.delete(), 10 * 1000));
				}
			} else {
				message
					.reply("You can't warn bots, you dummy :rofl:")
					.then((msg) => setTimeout(() => msg.delete(), 10 * 1000));
			}
		}
	}
};

exports.conf = {
	enabled: true,
	aliases: [ 'strike' ],
	permLevel: 1
};

exports.help = {
	name: 'warn',
	description: 'Warn users',
	usage: 'warn <user> <reason>'
};

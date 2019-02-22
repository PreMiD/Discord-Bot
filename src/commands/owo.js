var { query } = require('../database/functions'),
	Discord = require('discord.js');

exports.run = async (client, message, params) => {
	message.delete();

	if (params.length > 0) {
		var user = message.guild.members.find((m) => m.displayName.toLowerCase() == params.join(' ').toLowerCase());
		if (!user) user = message.mentions.users.first();

		if (!user) {
			message.reply("Your IQ's low, specify a valid user.").then((m) => setTimeout(() => m.delete()), 10 * 1000);
		} else {
			var userOwORank = await query('SELECT * FROM owoCounter WHERE userID = ?', user.id);

			if (userOwORank.rows.length > 0) {
				message
					.reply(
						`${message.guild.members.get(user.id).displayName} said OwO/UwU **${userOwORank.rows[0]
							.count}** times.`
					)
					.then((m) => setTimeout(() => m.delete(), 10 * 1000));
			} else {
				message
					.reply('Sorry but the provided user did not use these fancy words.')
					.then((m) => setTimeout(() => m.delete(), 10 * 1000));
			}
		}
	} else {
		var owoLeader = await query('SELECT * FROM owoCounter ORDER BY count DESC LIMIT 5');

		Promise.all(
			owoLeader.rows.map((row) => {
				return [ message.guild.members.has(row.userID), row.userID ];
			})
		).then((results) => {
			results.map((res) => {
				if (!res[0]) query('DELETE FROM owoCounter WHERE userID = ?', res[1]);
			});
		});

		var embed = new Discord.RichEmbed()
			.addField(
				'OwO/UwU Leaderboard',
				owoLeader.rows.map((row, index) => {
					if (message.guild.members.has(row.userID))
						return `**${index + 1})** ${message.guild.members.get(row.userID).displayName} (${row.count})`;
				})
			)
			.setColor('#7289DA');
		message.reply(embed).then((m) => setTimeout(() => m.delete(), 15 * 1000));
	}
};

exports.conf = {
	enabled: true,
	aliases: [ 'uwu' ],
	permLevel: 0
};

exports.help = {
	name: 'owo',
	description: 'Displays your IQ',
	usage: 'owo',
	botChannelOnly: true
};

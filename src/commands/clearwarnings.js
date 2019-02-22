var { prefix } = require('../config.json');
var { query } = require('../database/functions');

exports.run = async (client, message, params) => {
	await message.delete();
	if (params.length < 1) {
		message
			.reply(`Usage: \`\`${prefix}clearwarn <user>\`\``)
			.then((msg) => setTimeout(() => msg.delete(), 10 * 1000));
	} else {
		var user = message.mentions.users.first();
		if (!user)
			user = await message.guild.members.find((m) => m.displayName == params.slice(0, params.length).join(' '));
		if (user) {
			var warns = (await query('SELECT COUNT(*) AS warns FROM warns WHERE user_id = ?', user.id)).rows[0].warns;
			if (!user.bot) {
				if (warns == 0) {
					message.channel.send(
						`**${message.guild.members.get(user.id).displayName}** does not have any warnings!`
					);
				} else {
					await query('DELETE FROM warns WHERE user_id = ?', user.id);
					message.channel.send(
						`<@${user.id}>, **${message.guild.members.get(user.id)
							.displayName}** cleared all your warnings! You must have been lucky! :four_leaf_clover: `
					);
				}
			} else {
				message
					.reply("Bots don't have warnings, or do they :thinking:")
					.then((msg) => setTimeout(() => msg.delete(), 10 * 1000));
			}
		}
	}
};

exports.conf = {
	enabled: true,
	aliases: [ 'cwarn' ],
	permLevel: 3
};

exports.help = {
	name: 'clearwarn',
	description: 'Clear warns of a user',
	usage: 'clearwarn <user>'
};

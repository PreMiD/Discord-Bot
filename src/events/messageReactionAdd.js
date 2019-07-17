var { query } = require('../database/functions'),
	{ supportCategory } = require('../config.json'),
	Discord = require('discord.js');

module.exports = async (reaction, user) => {
	if (user.bot) return;

	var ticket = (await query('SELECT * FROM tickets WHERE messageId = ?', reaction.message.id)).rows;
	if (ticket.length > 0) {
		ticket = ticket[0];

		if (ticket.status == 0 && reaction.emoji.name == '💔') return;

		if (
			ticket.status == 0 &&
			reaction.emoji.name == '🚫' &&
			(ticket.user == user.id || reaction.message.guild.members.get(user.id).roles.has('566417964820070421'))
		) {
			await reaction.message.clearReactions();
			await reaction.message.react('💔');
			reaction.message
				.awaitReactions(
					(r, u) =>
						r.emoji.name == '💔' &&
						(u.id == ticket.user ||
							reaction.message.guild.members.get(u.id).roles.has('566417964820070421')),
					{
						time: 10 * 1000,
						max: 1,
						errors: [ 'time' ]
					}
				)
				.then((collected) => {
					reaction.message.delete();
					query('DELETE FROM tickets WHERE id = ?', ticket.id);
				})
				.catch(async (err) => {
					await reaction.message.clearReactions();
					reaction.message
						.react(reaction.message.guild.emojis.get('521018476870107156'))
						.then(() => reaction.message.react('🚫'));
				});
			return;
		}

		if (
			ticket.user == user.id ||
			(ticket.supporters != null &&
				!ticket.supporters.split(',').includes(user.id) &&
				ticket.messageId == reaction.message.id)
		)
			reaction.remove(user.id);
		else {
			if (
				ticket.status == 0 &&
				reaction.emoji.id == '521018476870107156' &&
				reaction.message.guild.members.get(user.id).roles.has('566417964820070421')
			)
				handleStartSupport(reaction, user, ticket);
			else if (
				ticket.status == 1 &&
				reaction.emoji.name == '🔴' &&
				ticket.supporters.split(',').includes(user.id) ||
				reaction.message.guild.members.get(user.id).roles.has('493135149274365975')
			)
				handleEndSupport(reaction, user, ticket);
		}
	}
};

async function handleStartSupport(reaction, user, ticket) {
	reaction.message.guild
		.createChannel(
			ticket.id.toString().padStart(5, '0'),
			'text',
			[
				{
					id: reaction.message.guild.id,
					denied: [ 'VIEW_CHANNEL' ]
				},
				{
					id: user.id,
					allow: [ 'VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'USE_EXTERNAL_EMOJIS' ]
				},
				{
					id: ticket.user,
					allow: [ 'VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'USE_EXTERNAL_EMOJIS' ]
				}
			],
			'Support ticket accepted.'
		)
		.then(async (ch) => {
			ch.setParent(supportCategory);
			ch.send(`<@${ticket.user}>, <@${user.id}> accepted your ticket!`);

			var supportEmbed = reaction.message.embeds[0],
				embed = new Discord.RichEmbed()
					.setAuthor(
						`Ticket#${ticket.id.toString().padStart(5, '0')} [PENDING]`,
						'https://raw.githubusercontent.com/PreMiD/Discord-Bot/master/.discord/yellow_circle.png'
					)
					.setDescription(supportEmbed.description)
					.setFooter(supportEmbed.footer.text, supportEmbed.footer.iconURL)
					.setTimestamp()
					.setColor('#f4dd1a');

			if (ticket.attachments != null && ticket.attachments != '')
				embed.addField('Attachments', `${ticket.attachments.split(',').join('\n')}`);

			embed.addField('Supporter/s', `<@${user.id}>`);

			query('UPDATE tickets SET status = 1, supporters = ?, supportChannel = ? WHERE id = ?', [
				user.id,
				ch.id,
				ticket.id
			]);

			reaction.message.edit(embed);
			await reaction.message.clearReactions();
			reaction.message.react('🔴');
		});
}

async function handleEndSupport(reaction, user, ticket) {
	if (reaction.message.guild.channels.has(ticket.supportChannel)) {
	}
	reaction.message.guild.channels.get(ticket.supportChannel).delete();
	if (reaction.message.guild.members.has(ticket.user))
		reaction.message.guild.members
			.get(ticket.user)
			.send(`Your ticket (Ticket#${ticket.id.toString().padStart(5, '0')}) has been closed by <@${user.id}>.`);

	var supportEmbed = reaction.message.embeds[0],
		embed = new Discord.RichEmbed()
			.setAuthor(
				`Ticket#${ticket.id.toString().padStart(5, '0')} [CLOSED]`,
				'https://raw.githubusercontent.com/PreMiD/Discord-Bot/master/.discord/red_circle.png'
			)
			.setDescription(supportEmbed.description)
			.setFooter(supportEmbed.footer.text, supportEmbed.footer.iconURL)
			.setTimestamp()
			.setColor('#dd2e44');

	if (ticket.attachments != null && ticket.attachments != '')
		embed.addField('Attachments', `${ticket.attachments.split(',').join('\n')}`);

	query('UPDATE tickets SET status = 2, supporters = NULL, supportChannel = NULL WHERE id = ?', [ ticket.id ]);

	reaction.message.edit(embed);
	reaction.message.clearReactions();
}

var Discord = require('discord.js'),
	{ query } = require('../database/functions'),
	{ supportChannel, ticketChannel } = require('../config.json'),
	getUrls = require('get-urls'),
	supporters;

module.exports = async (message) => {
	if (message.author.bot) return;

	var ticket = (await query('SELECT * FROM tickets WHERE supportChannel = ?', message.channel.id)).rows;

	if (ticket.length > 0 && ticket[0].supporters.split(',').includes(message.author.id)) {
		ticket = ticket[0];

		if (message.content.startsWith('>>')) {
			message.delete();
			console.log(message.content.split(' ').slice(1, message.content.split(' ').length));
			var supportToAdd = message.guild.members.find(
				(m) =>
					m.displayName.toLowerCase() ==
					message.content.toLowerCase().split(' ').slice(1, message.content.split(' ').length)
			);

			if (!supportToAdd)
				supportToAdd = message.guild.members.find(
					(m) => m.id == message.content.split(' ').slice(1, message.content.split(' ').length)
				);

			if (
				!supportToAdd ||
				!supportToAdd.roles.has('566417964820070421') ||
				ticket.supporters.split(',').includes(supportToAdd.id)
			)
				message
					.reply('User could not be found, is not a supporter or is already added to this ticket.')
					.then((msg) => setTimeout(() => msg.delete(), 10 * 1000));
			else {
				await message.channel.send(`${supportToAdd} has been added to this ticket.`);
				message.channel.overwritePermissions(
					supportToAdd,
					{
						VIEW_CHANNEL: true,
						SEND_MESSAGES: true,
						EMBED_LINKS: true,
						ATTACH_FILES: true,
						USE_EXTERNAL_EMOJIS: true
					},
					`Added to ticket by ${message.author.displayName}`
				);

				var embed = new Discord.RichEmbed()
					.setAuthor(
						`Ticket#${ticket.id.toString().padStart(5, '0')} [PENDING]`,
						'https://raw.githubusercontent.com/PreMiD/Discord-Bot/master/.discord/yellow_circle.png'
					)
					.setDescription(ticket.text)
					.setFooter(
						message.guild.members.get(ticket.user).displayName,
						message.guild.members.get(ticket.user).user.avatarURL
					)
					.setTimestamp()
					.setColor('#f4dd1a');

				if (ticket.attachments != null && ticket.attachments != '')
					embed.addField('Attachments', `${ticket.attachments.split(',').join('\n')}`);

				embed.addField(
					'Supporter/s',
					`${ticket.supporters.split(',').map((m) => `<@${m}>`).join(', ')}, ${supportToAdd}`
				);

				(await message.guild.channels.get(ticketChannel).fetchMessage(ticket.messageId)).edit(embed);

				query('UPDATE tickets SET supporters = ? WHERE id = ?', [
					ticket.supporters + ',' + supportToAdd.id,
					ticket.id
				]);
			}
		} else if (message.content.startsWith('<<')) {
			if (ticket.supporters.split(',').length == 1)
				message.reply('You are the only supporter assigned to this ticket.');
			else {
				await message.channel.overwritePermissions(
					message.author.id,
					{
						VIEW_CHANNEL: null,
						SEND_MESSAGES: null,
						EMBED_LINKS: null,
						ATTACH_FILES: null,
						USE_EXTERNAL_EMOJIS: null
					},
					`Left ticket`
				);
				message.channel.send(`${message.author} has left this ticket.`);

				var embed = new Discord.RichEmbed()
					.setAuthor(
						`Ticket#${ticket.id.toString().padStart(5, '0')} [PENDING]`,
						'https://raw.githubusercontent.com/PreMiD/Discord-Bot/master/.discord/yellow_circle.png'
					)
					.setDescription(ticket.text)
					.setFooter(
						message.guild.members.get(ticket.user).displayName,
						message.guild.members.get(ticket.user).user.avatarURL
					)
					.setTimestamp()
					.setColor('#f4dd1a');

				if (ticket.attachments != null && ticket.attachments != '')
					embed.addField('Attachments', `${ticket.attachments.split(',').join('\n')}`);

				supporters = ticket.supporters.split(',');
				supporters.splice(supporters.indexOf(message.author.id), 1);
				embed.addField('Supporter/s', `${supporters.map((m) => `<@${m}>`).join(', ')}`);

				(await message.guild.channels.get(ticketChannel).fetchMessage(ticket.messageId)).edit(embed);

				query('UPDATE tickets SET supporters = ? WHERE id = ?', [ supporters.join(','), ticket.id ]);
			}
		}
	}

	if (message.channel.id != supportChannel) return;

	message.delete();

	if (message.content.length < 50) {
		message
			.reply('Your ticket is too short. (Minimum is 50 characters)')
			.then((msg) => setTimeout(() => msg.delete(), 10 * 1000));
		return;
	}

	var ticketID = (await query('SELECT MAX(id) as count FROM tickets')).rows[0].count;
	ticketID = ticketID === null ? 1 : ticketID + 1;

	var urls = getUrls(message.content);
	var attachments = message.attachments.map((at) => at.url).concat(Array.from(urls));

	var embed = new Discord.RichEmbed()
		.setAuthor(
			`Ticket#${ticketID.toString().padStart(5, '0')} [OPEN]`,
			'https://raw.githubusercontent.com/PreMiD/Discord-Bot/master/.discord/green_circle.png'
		)
		.setDescription(replaceCumulative(message.content, Array.from(urls)))
		.setFooter(message.author.username, message.author.avatarURL)
		.setTimestamp()
		.setColor('#77ff77');

	if (attachments.length > 0)
		embed.addField('Attachments', `${attachments.length > 0 ? `${attachments.join('\n')}` : ''}`);

	var supportMessage = await message.guild.channels.get(ticketChannel).send(embed);

	query('INSERT INTO tickets (messageId, text, attachments, user) VALUES (?, ?, ?, ?)', [
		supportMessage.id,
		replaceCumulative(message.content, Array.from(urls)).trim(),
		attachments.length > 0 ? attachments.join(',') : '',
		message.author.id
	]);

	supportMessage.react(message.guild.emojis.get('521018476870107156')).then(() => supportMessage.react('🚫'));
};

function replaceCumulative(str, find) {
	for (var i = 0; i < find.length; i++) str = str.replace(new RegExp(find[i], 'g'), '');
	return str;
}

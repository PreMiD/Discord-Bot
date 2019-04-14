var Discord = require('discord.js');

var { prefix } = require('../config.json');
var { query } = require('../database/functions');

exports.run = async (client, message, params) => {
	message.delete();

	if (params.length < 1) {
		message.reply(`Usage: \`\`${prefix}marry <user>\`\``).then((msg) => setTimeout(() => msg.delete(), 15 * 1000));
		return;
	} else {
		var wife = message.mentions.members.first();
		if (!wife)
			wife = message.guild.members.find((m) => m.displayName.toLowerCase() == params.join(' ').toLowerCase());

		if (!wife) {
			message
				.reply("I couldn't find the person you wanted to make a proposal to. :cry:")
				.then((msg) => setTimeout(() => msg.delete(), 10 * 1000));
			return;
		}

		if (wife.id == message.author.id) {
			message.reply("You can't marry yourself! :smirk:").then((msg) => setTimeout(() => msg.delete(), 10 * 1000));
			return;
		}

		var husbandMarried =
			(await query('SELECT COUNT(*) as married FROM marriages WHERE husband = ? OR wife = ?', [
				message.author.id,
				message.author.id
			])).rows[0].married == 1
				? true
				: false;
		var wifeMarried =
			(await query('SELECT COUNT(*) as married FROM marriages WHERE husband = ? OR wife = ?', [
				wife.id,
				wife.id
			])).rows[0].married == 1
				? true
				: false;

		if (husbandMarried) {
			message.reply('You are already married! :angry:').then((msg) => setTimeout(() => msg.delete(), 10 * 1000));
			return;
		} else if (wifeMarried) {
			message
				.reply("Oh no! She's already married! :cry:")
				.then((msg) => setTimeout(() => msg.delete(), 10 * 1000));
			return;
		} else {
			var marryQuestion = message.channel.send(
				`<@${wife.id}>, <@${message.author
					.id}> wants to marry you! :heart:\nDo you accept his proposal or decline it? (\`\`ACCEPT\`\` | \`\`DENY\`\`)\nYou have exactly **60** seconds!`
			);
			marryQuestion.then((msg) => setTimeout(() => msg.delete().catch(() => {}), 60 * 1000));

			var wifeResponse = message.channel.awaitMessages(
				(msg) =>
					msg.author.id == wife.id &&
					(msg.content.toLowerCase() == 'accept' || msg.content.toLowerCase() == 'deny'),
				{ max: 1, time: 60 * 1000, errors: [ 'time' ] }
			);
			wifeResponse.then((msgs) => {
				msgs = msgs.first();
				msgs.delete();

				if (msgs.content.toLowerCase() == 'accept') {
					query('INSERT INTO marriages (husband, wife) VALUES (?, ?)', [ message.author.id, wife.id ]);
					message
						.reply(`Congratulations! You are now married with <@${wife.id}>! :heart:`)
						.then((msg) => setTimeout(() => msg.delete(), 15 * 1000));
				} else {
					message
						.reply(`Oh uh... Sorry but <@${wife.id}> does not want to be married with you... :cry:`)
						.then((msg) => setTimeout(() => msg.delete(), 10 * 1000));
				}
			});
			wifeResponse.catch((msgs) => {
				message
					.reply(
						'I am really sorry for you but your proposal became invalid... I am truly sorry. :broken_heart:'
					)
					.then((msg) => setTimeout(() => msg.delete(), 15 * 1000));
				return;
			});
		}
	}
};

exports.conf = {
	enabled: true,
	aliases: [],
	permLevel: 0
};

exports.help = {
	name: 'marry',
	description: 'Marry someone',
	usage: 'marry',
	botChannelOnly: true
};

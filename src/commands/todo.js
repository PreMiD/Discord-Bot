var Discord = require('discord.js');
var { prefix } = require('../config.json');

exports.run = async (client, message, params) => {
	await message.delete();
	if (params.length < 3) {
		if (params[0].toLowerCase() == 'remove') {
			if (await message.guild.channels.get('518794416043851786').fetchMessage(params[1]))
				message.guild.channels.get('518794416043851786').fetchMessage(params[1]).then((msg) => msg.delete());
		} else {
			message
				.reply(`Usage: \`\`${prefix}todo <add/remove/edit> <pending/done> <message>\`\``)
				.then((msg) => setTimeout(() => msg.delete(), 15 * 1000));
		}
	} else {
		switch (params[0].toLowerCase()) {
			case 'add':
				{
					switch (params[1].toLowerCase()) {
						case 'pending':
							message.guild.channels
								.get('518794416043851786')
								.send(`<a:loading:521018476480167937> ${params.slice(2, params.length).join(' ')}`);
							break;
						case 'done':
							message.guild.channels
								.get('518794416043851786')
								.send(`<a:success:521018476870107156> ${params.slice(2, params.length).join(' ')}`);
							break;
					}
				}
				break;
			case 'edit':
				switch (params[1].toLowerCase()) {
					case 'pending':
						if (params.length < 4) {
							message.guild.channels
								.get('518794416043851786')
								.fetchMessage(params[2])
								.then((msg) =>
									msg.edit(
										`<a:loading:521018476480167937> ${msg.content
											.replace('<a:loading:521018476480167937> ', '')
											.replace('<a:success:521018476870107156> ', '')}`
									)
								);
						} else {
							message.guild.channels
								.get('518794416043851786')
								.fetchMessage(params[2])
								.then((msg) =>
									msg.edit(
										`<a:loading:521018476480167937> ${params.slice(3, params.length).join(' ')}`
									)
								);
						}
						break;
					case 'done':
						if (params.length < 4) {
							message.guild.channels
								.get('518794416043851786')
								.fetchMessage(params[2])
								.then((msg) =>
									msg.edit(
										`<a:success:521018476870107156> ${msg.content
											.replace('<a:loading:521018476480167937> ', '')
											.replace('<a:success:521018476870107156> ', '')}`
									)
								);
						} else {
							message.guild.channels
								.get('518794416043851786')
								.fetchMessage(params[2])
								.then((msg) =>
									msg.edit(
										`<a:success:521018476870107156> ${params.slice(3, params.length).join(' ')}`
									)
								);
						}
						break;
				}
				break;
			default:
				message
					.reply(`Usage: \`\`${prefix}todo <add/remove/edit> <pending/done> <message>\`\``)
					.then((msg) => setTimeout(() => msg.delete(), 15 * 1000));
				break;
		}
	}
};

exports.conf = {
	enabled: true,
	aliases: [],
	permLevel: 4
};

exports.help = {
	name: 'todo',
	description: 'Add/Remove/Edit todos',
	usage: 'todo <add/remove/edit> <pending/done> <message>'
};

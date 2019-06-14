var Discord = require('discord.js');
const config = require('../config.json');
const filterMessages = require('../messageFiltered.json');

module.exports = async (message) => {
	let client = message.client;
	//* Run filter stuff
	await filterMessage(message);

	require('../util/supportHandler')(message);

	if (!message.content.startsWith(config.prefix)) require('../util/owo_counter')(message);
	//* Bot == STOP
	if (message.author.bot) return;
	//* Message starts with Prefix
	if (!message.content.startsWith(config.prefix)) return;
	//* Get stuff from message
	let command = message.content.split(' ')[0].slice(config.prefix.length);
	let params = message.content.split(' ').slice(1);
	let perms = client.elevation(message);
	let cmd;
	//* Command exists
	if (client.commands.has(command)) {
		cmd = client.commands.get(command);
	} else if (client.aliases.has(command)) {
		cmd = client.commands.get(client.aliases.get(command));
	}
	if (cmd) {
		if (perms < cmd.conf.permLevel) return;
		if (cmd.conf.botChannelOnly && message.channel.id != config.botChannel && perms < 4) {
			message
				.reply(`This command can only be used in <#${config.botChannel}>`)
				.then((msg) => setTimeout(() => msg.delete(), 15 * 1000));
		} else {
			cmd.run(client, message, params, perms);
		}
	}
};

async function filterMessage(message) {
	//* Messages
	let client = message.client;
	var filtered = filterMessages.find((m) => message.content.toLowerCase().match(new RegExp(m.message.toLowerCase(), 'i')));
	if(!filtered || client.elevation(message) > 0) return; //message allowed or is mod/admin

	if(filtered.mute){
		//I should check if the user already has this role but how does he talking muted?
		 message.member.addRole(config.mutedRole);

		var embed = new Discord.RichEmbed()
			.setAuthor(`${message.member.displayName}`, message.author.avatarURL)
			.addField('Channel', `<#${message.channel.id}>`)
			.addField('Message', message.content)
			.setColor('#fc3c3c')
			.setFooter('USER MUTED')
			.setTimestamp();
			if (message.guild.channels.has(config.logs)) message.guild.channels.get(config.logs).send("<@&514546359865442304> or <@&526734093560315925> please check this mute!", { embed: embed });
	}

	await message.delete();
	message
		.reply(filtered.botMessage)
		.then((msg) => setTimeout(() => msg.delete(), 15 * 1000));
}

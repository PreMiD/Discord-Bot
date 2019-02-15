const config = require('../config.json');

module.exports = async (message) => {
	let client = message.client;
	//* Run filter stuff
	await filterMessage(message);

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
		cmd.run(client, message, params, perms);
	}
};

async function filterMessage(message) {
	//* Filter invite links
	if (message.content.includes('discord.gg/' || 'discordapp.com/invite/') && message.client.elevation(message) < 1) {
		await message.delete();
		message
			.reply('**Invite links are not allowed on this server!**')
			.then((msg) => setTimeout(() => msg.delete(), 15 * 1000));
	}
}

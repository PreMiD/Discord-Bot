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
	var filtered = filterMessages.find((m) => message.content.includes(m.message));
	if(!filtered || message.member.hasPermission("BAN_MEMBERS")) return; //message allowed or is mod/admin

	if(filtered.ban) message.guild.ban(message.author).then(console.log).catch(console.error);

	await message.delete();
	message
		.reply(filtered.botMessage)
		.then((msg) => setTimeout(() => msg.delete(), 15 * 1000));
}

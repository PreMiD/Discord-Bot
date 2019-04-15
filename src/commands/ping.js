exports.run = async (client, message) => {
	message.channel.send('Pinging...').then((msg) => {
		msg
			.edit(`🏓 **Pong!** (took: \`\`${msg.createdTimestamp - message.createdTimestamp}ms\`\`)`)
			.then((msg) => setTimeout(() => msg.delete(), 5 * 1000));
	});
	message.delete();
};

exports.conf = {
	enabled: true,
	aliases: [],
	permLevel: 0
};

exports.help = {
	name: 'ping',
	description: "Get the Bot's ping",
	usage: 'ping',
	botChannelOnly: true
};

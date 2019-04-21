var Discord = require('discord.js');

exports.run = async (client, message) => {
	var embed = new Discord.RichEmbed().setTitle('Ping').setDescription('Pinging...'),
		msg = await message.channel.send(embed),
		ping = msg.createdTimestamp - message.createdTimestamp;

	if (ping < 250) embed.setColor('#00ff00');
	if (ping > 250 && ping < 500) embed.setColor('#ffff00');
	if (ping > 500) embed.setColor('#ff0000');

	embed.setDescription(`**Discord** (\`\`${ping}ms\`\`)\n**Discord API** (\`\`${client.ping}ms\`\`)`);

	msg.edit(embed).then((msg) => setTimeout(() => msg.delete(), 5 * 1000));
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

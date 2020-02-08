import * as Discord from "discord.js";

let embed: Discord.MessageEmbed, ping: number;

module.exports.run = async (message: Discord.Message) => {
	embed = new Discord.MessageEmbed({
		title: "Ping",
		description: "<a:loading:521018476480167937> Pinging..."
	});

	message.channel.send(embed).then(msg => {
		msg = msg as Discord.Message;

		ping = msg.createdTimestamp - message.createdTimestamp;

		if (ping < 250) embed.setColor("#00ff00");
		if (ping > 250 && ping < 500) embed.setColor("#ffff00");
		if (ping > 500) embed.setColor("#ff0000");

		embed.setDescription(
			`**You** > **Discord** (\`\`${Math.floor(
				ping
			)}ms\`\`)\n**We** > **Discord API** (\`\`${Math.floor(
				message.client.ws.ping
			)}ms\`\`)`
		);

		msg.edit(embed).then(msg => msg.delete({ timeout: 15 * 1000 }));
	});
	message.delete();
};

module.exports.config = {
	name: "ping",
	description: "Shows ping information."
};

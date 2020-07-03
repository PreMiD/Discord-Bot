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
		let color = 
			ping < 250 ? "#00ff00" : 
			ping > 250 && ping < 500 ? 
		    	"#ffaa00" : "#ff0000";

		embed.setDescription(
			`**You** > **Discord** (\`\`${Math.floor(ping)}ms\`\`)
			 **We** > **Discord API** (\`\`${Math.floor(message.client.ws.ping)}ms\`\`)`
		).setColor(color);

		msg.edit(embed).then(msg => msg.delete({ timeout: 15 * 1000 }));
	});

	if (!message.deleted) message.delete();
};

module.exports.config = {
	name: "ping",
	description: "Shows ping information."
};

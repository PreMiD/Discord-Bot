import { MessageEmbed } from "discord.js";

import { client } from "../../..";
import { InteractionResponse } from "../../../../@types/djs-extender";
import UniformEmbed from "../../../util/UniformEmbed";

module.exports.run = async (data: InteractionResponse, perms: number) => {
	data.channel
		.send(
			new UniformEmbed(
				{
					description: `**We** to **Discord** (\`\`${Math.floor(
						client.ws.ping
					)}ms\`\`)`
				},
				":ping_pong: Ping",
				client.ws.ping < 250
					? "#50ff50"
					: client.ws.ping > 250 && client.ws.ping < 500
					? "#ffff50"
					: "#ff5050"
			)
		)
		.then(msg => msg.delete({ timeout: 15 * 1000 }));
};

module.exports.config = {
	name: "ping",
	discordCommand: true
};

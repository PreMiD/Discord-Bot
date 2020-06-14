import * as Discord from "discord.js";
import { Ticket } from "../classes/Ticket";

module.exports.run = async (
	message: Discord.Message,
	params: Array<string>
) => {
		const tickets = await tcoll.find({ status: 1 }).toArray();

	tickets.map(async t => {
		const ticket = new Ticket(), ticketFound = await ticket.fetch("channel", t.supportChannel);

		if (!ticketFound) return;
		ticket.channel.updateOverwrite(message.member, {
			VIEW_CHANNEL: true,
			SEND_MESSAGES: true,
			EMBED_LINKS: true,
			ATTACH_FILES: true,
			USE_EXTERNAL_EMOJIS: true
		});	
		
		message.reply("you can now see all tickets!").then(msg => msg.delete({ timeout: 10 * 1000 }));
	});
};

module.exports.config = {
	name: "showtickets",
	description: "Let's you view all open tickets.",
  permLevel: 1
};

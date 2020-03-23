import * as Discord from "discord.js";
import { Ticket } from "../classes/Ticket";

module.exports.run = async (
	message: Discord.Message,
	params: Array<string>
) => {
	let t = new Ticket();

	const ticketFound = await t.fetch("channel", message.channel.id);

	if (!ticketFound) return;

	if (params.length > 0)
		t.close(
			message.member,
			message.content
				.split(" ")
				.slice(1, message.content.split(" ").length)
				.join(" ")
		);
	else t.close(message.member);
};

module.exports.config = {
	name: "close",
	description: "Closes tickets.",
	hidden: true
};

import * as Discord from "discord.js";
import { Ticket } from "../classes/Ticket";

module.exports.run = async (
	message: Discord.Message
) => {
	let t = new Ticket(), dm = message.channel.type == "dm", ticketFound;

	if(dm) ticketFound = await t.fetch("author", message.author.id)
	else ticketFound = await t.fetch("channel", message.channel.id);

	if (!ticketFound) return;

	if (!dm) {
		t.close(
			message.member,
			message.content
				.split(" ")
				.slice(1, message.content.split(" ").length)
				.join(" ") || "Not Specified"
		)
	} else {
		t.close(
			message.author,
			message.content
				.split(" ")
				.slice(1, message.content.split(" ").length)
				.join(" ") || "Not Specified"
		)
	}
};

module.exports.config = {
	name: "close",
	description: "Closes tickets.",
	hidden: true
};

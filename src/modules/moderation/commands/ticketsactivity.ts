import * as Discord from "discord.js";
import TicketStats from "../classes/TicketStats";

module.exports.run = async (message: Discord.Message) => {
	message.delete();

	let ticketStats = new TicketStats();

	message.channel
		.send({ files: [await ticketStats.getTicketsPerDay()] })
		.then((msg) => msg.delete({ timeout: 10000 }));
};

module.exports.config = {
	name: "ticketsactivity",
	description: "Get the number of tickets per day from the last 14 days.",
	permLevel: 1,
};

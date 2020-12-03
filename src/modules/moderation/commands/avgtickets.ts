import * as Discord from "discord.js";
import TicketStats from "../classes/TicketStats";

module.exports.run = async (message: Discord.Message) => {
	message.delete();

	let ticketStats = new TicketStats();

	message.channel
		.send({ files: [await ticketStats.getAvgTickets()] })
		.then((msg) => msg.delete({ timeout: 10000 }));
};

module.exports.config = {
	name: "avgtickets",
	description: "Get the average number of tickets per support agent.",
	permLevel: 1,
};

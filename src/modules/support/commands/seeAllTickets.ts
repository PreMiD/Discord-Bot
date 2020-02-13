import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";
import { Ticket } from "../classes/Ticket";
import roles from "../../../roles";

let coll = MongoClient.db("PreMiD").collection("userSettings"),
	tcoll = MongoClient.db("PreMiD").collection("tickets");

module.exports.run = async (
	message: Discord.Message,
	params: Array<string>
) => {
	if (
		!message.member.roles.cache.has(roles.ticketManager) &&
		!message.member.permissions.has("ADMINISTRATOR")
	)
		return;
	message.delete();

	let userSettings = await coll.findOne({ userId: message.author.id });
	if (typeof userSettings === "undefined") {
		userSettings = await coll.insertOne({
			userId: message.author.id,
			seeAllTickets: true
		});
	} else {
		userSettings.seeAllTickets = !userSettings.seeAllTickets;
		userSettings = await coll.findOneAndUpdate(
			{ userId: message.author.id },
			{ $set: { seeAllTickets: userSettings.seeAllTickets } }
		);
	}

	message
		.reply(
			userSettings.value.seeAllTickets
				? `You can now see all tickets.`
				: `You can no longer see all tickets.`
		)
		.then(msg => msg.delete({ timeout: 10 * 1000 }));

	if (userSettings.value.seeAllTickets) {
		const tickets = await tcoll.find({ status: 1 }).toArray();

		tickets.map(async t => {
			const ticket = new Ticket(),
				ticketFound = await ticket.fetch("channel", t.supportChannel);

			if (!ticketFound) return;

			ticket.addSupporter(message.member, false);
		});
	} else {
		const tickets = await tcoll
			.find({ supporters: message.member.id })
			.toArray();

		tickets.map(async t => {
			const ticket = new Ticket(),
				ticketFound = await ticket.fetch("channel", t.supportChannel);

			if (!ticketFound) return;

			ticket.removeSupporter(message.member, false);
		});
	}
};

module.exports.config = {
	name: "seealltickets",
	description: "Enable/Disable this option to see all tickets.",
	permLevel: 1
};

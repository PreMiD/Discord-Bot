import * as Discord from "discord.js";
import { Ticket } from "../classes/Ticket";
import roles from "../../../roles";
import { pmdDB } from "../../../database/client";

let coll = pmdDB.collection("userSettings"),
	tcoll = pmdDB.collection("tickets");

module.exports.run = async (
	message: Discord.Message,
	params: Array<string>,
	showall: Boolean
) => {
	if (
		!message.member.roles.cache.has(roles.ticketManager) &&
		!message.member.permissions.has("ADMINISTRATOR")
	)
		return;
	message.delete();

	let userSettings = await coll.findOne({ userId: message.author.id });
	if (!userSettings) {
		userSettings = (
			await coll.insertOne({
				userId: message.author.id,
				seeAllTickets: true
			})
		).ops[0];
	} else {
		userSettings.seeAllTickets = !userSettings.seeAllTickets;
		userSettings = (
			await coll.findOneAndUpdate(
				{ userId: message.author.id },
				{ $set: { seeAllTickets: userSettings.seeAllTickets } }
			)
		).value;
	}
		message
		.reply(
			userSettings.seeAllTickets ? `You can now see all tickets.` : showall ? `Attempting to add you to open tickets.` : `You can no longer see all tickets.`
		)
		.then(msg => msg.delete({ timeout: 10 * 1000 }));

	if (userSettings.seeAllTickets) {
		const tickets = await tcoll.find({ status: 1 }).toArray();

		tickets.map(async t => {
			const ticket = new Ticket(),
				ticketFound = await ticket.fetch("channel", t.supportChannel);

			if (!ticketFound) return;
			ticket.channel.updateOverwrite(message.member, {
				VIEW_CHANNEL: true,
				SEND_MESSAGES: true,
				EMBED_LINKS: true,
				ATTACH_FILES: true,
				USE_EXTERNAL_EMOJIS: true
			});
		});
	} else {
		const tickets = await tcoll
			.find({ supporters: message.member.id })
			.toArray();

		tickets.map(async t => {
			const ticket = new Ticket(),
				ticketFound = await ticket.fetch("channel", t.supportChannel);

			if (!ticketFound) return;
			if (ticket.supporters.includes(message.member)) return;

			ticket.channel.updateOverwrite(message.member, {
				VIEW_CHANNEL: false
			});
		});
	}
};

module.exports.config = {
	name: "seealltickets",
	description: "Enable/Disable this option to see all tickets.",
	permLevel: 1
};

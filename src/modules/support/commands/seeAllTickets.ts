import * as Discord from "discord.js";

import { pmdDB } from "../../../database/client";
import roles from "../../../roles";
import { Ticket } from "../classes/Ticket";

let coll = pmdDB.collection("userSettings"),
	tcoll = pmdDB.collection("tickets");

let taskRunningFor = [];
module.exports.run = async (message: Discord.Message) => {
	message.delete();

	if (taskRunningFor.includes(message.member.id)) {
		return (
			await message.reply("Please wait for the previous action to complete.")
		).delete({ timeout: 10 * 1000 });
	}

	taskRunningFor.push(message.member.id);
	if (
		!message.member.roles.cache.has(roles.ticketManager) &&
		!message.member.permissions.has("ADMINISTRATOR")
	)
		return;

	let userSettings = await coll.findOne({ userId: message.author.id });
	if (!userSettings) {
		userSettings = (
			await coll.insertOne({ userId: message.author.id, seeAllTickets: true })
		).ops[0];
	} else {
		await coll.findOneAndUpdate(
			{ userId: message.author.id },
			{ $set: { seeAllTickets: !userSettings.seeAllTickets } }
		);
	}
	const tickets = await tcoll.find({ status: 1 }).toArray();

	let progressPercent = 100 / tickets.length,
		handledTickets = 0,
		statusMessage = !userSettings.seeAllTickets
			? "Adding you to all tickets...  %%"
			: "Removing you from all tickets... %%";

	const seeAllTicketsResponse = await message.reply(
		`<a:loading:521018476480167937> ${statusMessage.replace("%%", "0%")}`
	);

	for (let i = 0; i < tickets.length; i++) {
		const ticket = new Ticket(),
			ticketFound = await ticket.fetch("channel", tickets[i].supportChannel);

		if (!ticketFound) continue;

		if (!userSettings.seeAllTickets) {
			if (!ticket.channel?.permissionsFor(message.author).has("VIEW_CHANNEL"))
				await ticket.channel?.updateOverwrite(message.member, {
					VIEW_CHANNEL: true,
					SEND_MESSAGES: true,
					EMBED_LINKS: true,
					ATTACH_FILES: true,
					USE_EXTERNAL_EMOJIS: true
				});
		} else {
			if (ticket.supporters?.includes(message.member)) continue;

			await ticket.channel?.updateOverwrite(message.member, {
				VIEW_CHANNEL: false
			});
		}

		handledTickets += progressPercent;

		if ((Math.round(handledTickets / 10) * 10) % 10 === 0)
			await seeAllTicketsResponse.edit(
				`${message.author.toString()}, <a:loading:521018476480167937> ${statusMessage.replace(
					"%%",
					(Math.round(handledTickets / 10) * 10).toString() + "%"
				)}`
			);
	}

	taskRunningFor = taskRunningFor.filter(u => u !== message.author.id);

	seeAllTicketsResponse
		.edit(
			`${message.author.toString()}, <a:success:521018476870107156> ${
				!userSettings.seeAllTickets
					? "Added you to all tickets."
					: "Removed you from all tickets."
			}`
		)
		.then(msg => msg.delete({ timeout: 15 * 1000 }));
};

module.exports.config = {
	name: "seealltickets",
	description: "Enable/Disable this option to see all tickets.",
	permLevel: 1
};

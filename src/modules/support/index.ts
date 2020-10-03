import channels from "../../channels";
import { Ticket } from "./classes/Ticket";
import { client } from "../..";
import { info, success } from "../../util/debug";
import { pmdDB } from "../../database/client";
import { CategoryChannel } from "discord.js";

export async function sortTickets() {
	info("Sorting ticket channels...");
	const ticketCat = client.guilds.cache
			.first()
			.channels.cache.get(channels.ticketCategory) as CategoryChannel;

	if(!ticketCat) return;

	const positions = ticketCat.children
			.filter(ch => ch.name !== "tickets")
			.sort((fC, sC) => {
				return parseInt(fC.name as string) > parseInt(sC.name as string)
					? 1
					: -1;
			});

	for (let i = 0; i < positions.size; i++) {
		const channel = positions.array()[i];
		if (channel.position !== i + 1) await channel.setPosition(i + 1);
	}
	success("Sorted ticket channels.");
}

client.once("ready", () => {
	sortTickets();
	checkOldTickets();
	setInterval(checkOldTickets, 15 * 60 * 1000);
});

//* Check old tickets, send a warning if 5 days old, close when 7 days old
async function checkOldTickets() {
	const ticketCat = client.guilds.cache
			.first()
			.channels.cache.get(channels.ticketCategory) as CategoryChannel;

	if(!ticketCat) return;

	const ticketsWithoutNotification = await pmdDB
			.collection("tickets")
			.find({
				lastUserMessage: { $lte: Date.now() - 5 * 24 * 60 * 60 * 1000 },
				ticketCloseWarning: { $exists: false },
				supportChannel: {
					$in: ticketCat.children
						.filter(ch => ch.id !== channels.ticketChannel)
						.map(ch => ch.id)
				}
			})
			.toArray(),
		ticketsToClose = await pmdDB
			.collection("tickets")
			.find({
				ticketCloseWarning: { $lte: Date.now() - 2 * 24 * 60 * 60 * 1000 },
				supportChannel: {
					$in: ticketCat.children
						.filter(ch => ch.id !== channels.ticketChannel)
						.map(ch => ch.id)
				}
			})
			.toArray();

	if (ticketsWithoutNotification.length > 0)
		for (let i = 0; i < ticketsWithoutNotification.length; i++) {
			const ticket = new Ticket();
			await ticket.fetch(
				"channel",
				ticketsWithoutNotification[i].supportChannel
			);

			ticket.sendCloseWarning();
		}

	if (ticketsToClose.length > 0)
		for (let i = 0; i < ticketsToClose.length; i++) {
			const ticket = new Ticket();
			await ticket.fetch("channel", ticketsToClose[i].supportChannel);

			ticket.close();
		}
}

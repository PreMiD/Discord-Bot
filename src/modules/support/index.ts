import channels from "../../channels";
import { client } from "../..";
import { info, success } from "../../util/debug";
import { CategoryChannel } from "discord.js";

export async function sortTickets() {
	info("Sorting ticket channels...");
	const ticketCat = client.guilds.cache
			.first()
			.channels.cache.get(channels.ticketCategory) as CategoryChannel,
		positions = ticketCat.children
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

client.once("ready", sortTickets);

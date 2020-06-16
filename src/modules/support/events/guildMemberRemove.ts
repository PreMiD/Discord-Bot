import * as Discord from "discord.js";
import channels from "../../../channels";
import { Ticket } from "../classes/Ticket";
import { pmdDB } from "../../../database/client";

let coll = pmdDB.collection("tickets");

module.exports = async (user: Discord.GuildMember) => {
	let tickets = await coll.find({ userId: user.id }).toArray();

	tickets.map(async ticket => {
		if (typeof ticket.status === "undefined") {
			try {
				(
					await (user.guild.channels.cache.get(
						channels.ticketChannel
					) as Discord.TextChannel).messages.fetch(ticket.ticketMessage)
				).delete();
			} catch (_) {}
		} else if (ticket.status === 1) {
			const t = new Ticket();
			if (await t.fetch("ticket", ticket)) t.close();
		}
	});
};

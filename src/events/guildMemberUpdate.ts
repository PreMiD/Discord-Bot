import * as Discord from "discord.js";
import { Ticket } from "../modules/support/classes/Ticket";
import roles from "../roles";
import { pmdDB } from "../database/client";

const coll = pmdDB.collection("tickets");

module.exports = async (
	oldMember: Discord.GuildMember,
	newMember: Discord.GuildMember
) => {
	if (
		oldMember.roles.cache.has(roles.ticketManager) &&
		!newMember.roles.cache.has(roles.ticketManager)
	) {
		const tickets = await coll.find({ supporters: oldMember.id }).toArray();

		tickets.map(async t => {
			const ticket = new Ticket(),
				ticketFound = await ticket.fetch("channel", t.supportChannel);

			if (!ticketFound) return;

			ticket.removeSupporter(oldMember, false);
		});
	}
};

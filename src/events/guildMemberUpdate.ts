import * as Discord from "discord.js";
import { MongoClient } from "../database/client";
import { Ticket } from "../modules/support/classes/Ticket";
import roles from "../roles";

const coll = MongoClient.db("PreMiD").collection("tickets");
module.exports = async (
	oldMember: Discord.GuildMember,
	newMember: Discord.GuildMember
) => {
	if (
		oldMember.roles.has(roles.ticketManager) &&
		!newMember.roles.has(roles.ticketManager)
	) {
		coll.findOneAndDelete({ userId: oldMember.id });

		const tickets = await coll.find({ supporters: oldMember.id }).toArray();

		tickets.map(async t => {
			const ticket = new Ticket(),
				ticketFound = await ticket.fetch("channel", t.supportChannel);

			if (!ticketFound) return;

			ticket.removeSupporter(oldMember, false);
		});
	}
};

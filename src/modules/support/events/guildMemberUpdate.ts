import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";
import { Ticket } from "../classes/Ticket";
import roles from "../../../roles";
import channels from "../../../channels";

let coll = MongoClient.db("PreMiD").collection("userSettings"),
	tcoll = MongoClient.db("PreMiD").collection("tickets");

module.exports = async (
	oldMember: Discord.GuildMember,
	newMember: Discord.GuildMember
) => {
	if (
		oldMember.roles.cache.has(roles.ticketManager) &&
		!newMember.roles.cache.has(roles.ticketManager)
	) {
		coll.findOneAndUpdate(
			{ userId: oldMember.id },
			{ $unset: { seeAllTickets: true } }
		);

		const tickets = await tcoll.find({ supporters: oldMember.id }).toArray();

		tickets.map(async t => {
			const ticket = new Ticket(),
				ticketFound = await ticket.fetch("channel", t.supportChannel);

			if (!ticketFound) return;

			ticket.removeSupporter(oldMember, false);
		});

		const channelsToHide = oldMember.guild.channels.cache.filter(
			c => c.parentID === channels.ticketCategory
		);
		channelsToHide.map(u =>
			u.updateOverwrite(oldMember, {
				VIEW_CHANNEL: false
			})
		);
	}
};

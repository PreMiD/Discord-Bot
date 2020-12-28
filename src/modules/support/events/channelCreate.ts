import { GuildChannel } from "discord.js";

import channels from "../../../channels";
import { pmdDB } from "../../../database/client";
import { Ticket } from "../classes/Ticket";

const coll = pmdDB.collection("userSettings");

module.exports = async (channel: GuildChannel) => {
	if (channel.parentID === channels.ticketCategory) {
		const users = await coll.find({}).toArray();
		users.map(async user => {
			if (user.seeAllTickets) {
				const ticket = new Ticket(),
					ticketFound = await ticket.fetch("channel", channel.id);

				if (!ticketFound) return;
				ticket.channel?.updateOverwrite(user.userId, {
					VIEW_CHANNEL: true,
					SEND_MESSAGES: true,
					EMBED_LINKS: true,
					ATTACH_FILES: true,
					USE_EXTERNAL_EMOJIS: true
				});
			}
		});
	}
};

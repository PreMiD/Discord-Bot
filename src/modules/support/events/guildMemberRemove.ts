import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";
import channels from "../../../channels";

let coll = MongoClient.db("PreMiD").collection("tickets");

module.exports = async (user: Discord.GuildMember) => {
	let tickets = await coll.find({ userId: user.id }).toArray();

	tickets.map(async ticket => {
		if (typeof ticket.status === "undefined") {
			(
				await (user.guild.channels.cache.get(
					channels.ticketChannel
				) as Discord.TextChannel).messages.fetch(ticket.ticketMessage)
			).delete();
		} else if (ticket.status === 1) {
			(
				await (user.guild.channels.cache.get(
					channels.ticketChannel
				) as Discord.TextChannel).messages.fetch(ticket.ticketMessage)
			).delete();
			(user.guild.channels.cache.get(
				ticket.supportChannel
			) as Discord.TextChannel).delete();
		}

		coll.findOneAndDelete({ ticketId: ticket.ticketId });
	});
};

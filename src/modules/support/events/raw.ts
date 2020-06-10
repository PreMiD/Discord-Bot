import { client } from "../../..";
import { Ticket } from "../classes/Ticket";

module.exports = async packet => {
	if (!["MESSAGE_REACTION_ADD"].includes(packet.t) || member.user.bot) return;

	let guild = client.guilds.cache.get(packet.d.guild_id),
		member = guild.members.cache.get(packet.d.user_id);

	let ticket = new Ticket();
	if (!(await ticket.fetch("message", packet.d.message_id))) return;

	if (
		packet.d.emoji.id === "521018476870107156" &&
		typeof ticket.status === "undefined"
	) {
		ticket.accept(member);
		return;
	}

	if (
		packet.d.emoji.name === "🚫" &&
		ticket.status === 1 &&
		(ticket.supporters.includes(packet.d.user_id) ||
			client.guilds.cache
				.get(packet.d.guild_id)
				.members.cache.get(packet.d.user_id)
				.hasPermission("ADMINISTRATOR"))
	) {
		ticket.close(packet.d.user_id);
		return;
	}

	if (packet.d.emoji.name === "🚫" && typeof ticket.status === "undefined") {
		ticket.ticketMessage.reactions.removeAll().then(() => {
			ticket.ticketMessage.react("💔");
			ticket.ticketMessage
				.awaitReactions(
					(r, u) => r.emoji.name === "💔" && u.id === packet.d.user_id,
					{ max: 1, time: 5 * 1000, errors: ["time"] }
				)
				.then(() => {
					ticket.ticketMessage.delete();
					if (typeof ticket.attachmentsMessage !== "undefined")
						ticket.attachmentsMessage.delete();
				})
				.catch(() => {
					ticket.ticketMessage.reactions
						.removeAll()
						.then(() =>
							ticket.ticketMessage
								.react("🚫")
								.then(() =>
									ticket.ticketMessage.react(
										guild.emojis.cache.get("521018476870107156")
									)
								)
						);
				});
		});
		return;
	}
};

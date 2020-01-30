import { client } from "../../..";
import { Ticket } from "../classes/Ticket";
module.exports = async packet => {
	if (!["MESSAGE_REACTION_ADD"].includes(packet.t)) return;

	let guild = client.guilds.get(packet.d.guild_id),
		member = guild.members.get(packet.d.user_id);

	if (member.user.bot) return;

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
			client.guilds
				.get(packet.d.guild_id)
				.members.get(packet.d.user_id)
				.hasPermission("ADMINISTRATOR"))
	) {
		ticket.close();
		return;
	}

	if (packet.d.emoji.name === "🚫" && typeof ticket.status === "undefined") {
		ticket.message.reactions.removeAll().then(() => {
			ticket.message.react("💔");
			ticket.message
				.awaitReactions(
					(r, u) => r.emoji.name === "💔" && u.id === packet.d.user_id,
					{ max: 1, time: 5 * 1000, errors: ["time"] }
				)
				.then(() => {
					ticket.message.delete();
					if (typeof ticket.attachmentsMessage !== "undefined")
						ticket.attachmentsMessage.delete();
				})
				.catch(() => {
					ticket.message.reactions
						.removeAll()
						.then(() =>
							ticket.message
								.react("🚫")
								.then(() =>
									ticket.message.react(guild.emojis.get("521018476870107156"))
								)
						);
				});
		});
		return;
	}
};

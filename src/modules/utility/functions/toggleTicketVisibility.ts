import { Collection, GuildMember, Snowflake } from "discord.js";

import { pmdDB } from "../../../database/client";
import { Ticket } from "../../support/classes/Ticket";

const tcoll = pmdDB.collection("tickets");

let tasksRunningFor: Collection<
	Snowflake,
	{
		visible: boolean;
		interval: NodeJS.Timeout;
		tickets: any[];
		itStatus: boolean;
	}
> = new Collection();
export default async function toggleTicketVisibility(
	user: GuildMember,
	visible: boolean
) {
	if (
		tasksRunningFor.has(user.id) &&
		tasksRunningFor.get(user.id).visible === visible
	)
		return;

	clearInterval(tasksRunningFor.get(user.id)?.interval);

	const tickets = await tcoll.find({ status: 1 }).toArray();
	tasksRunningFor.set(user.id, {
		visible,
		interval: setInterval(() => run(user), 10),
		tickets,
		itStatus: false
	});
}

async function run(user: GuildMember) {
	const task = tasksRunningFor.get(user.id);

	if (!task.itStatus) {
		if (task.tickets.length === 0) {
			clearInterval(task.interval);
			tasksRunningFor.delete(user.id);
			return;
		}

		task.itStatus = true;

		const ticket = new Ticket(),
			ticketFound = await ticket.fetch(
				"channel",
				task.tickets.shift().supportChannel
			);

		if (!ticketFound) {
			task.itStatus = false;
			return;
		}

		if (!task.visible) {
			if (!ticket.channel?.permissionsFor(user.id).has("VIEW_CHANNEL", true)) {
				await ticket.channel?.updateOverwrite(user.id, {
					VIEW_CHANNEL: true,
					SEND_MESSAGES: true,
					EMBED_LINKS: true,
					ATTACH_FILES: true,
					USE_EXTERNAL_EMOJIS: true
				});
			}

			task.itStatus = false;
		} else {
			if (ticket.supporters?.includes(user)) {
				task.itStatus = false;
				return;
			}

			if (ticket.channel?.permissionsFor(user.id).has("VIEW_CHANNEL", true)) {
				await ticket.channel?.updateOverwrite(user.id, {
					VIEW_CHANNEL: false
				});
			}

			task.itStatus = false;
		}
	}
}

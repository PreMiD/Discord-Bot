import { Collection, Snowflake } from "discord.js"
import { client } from "../..";
import { Ticket } from "../support/classes/ticket";

let coll = client.db.collection("tickets"),
    tasksRunningFor = new Collection<Snowflake, {
		visible: boolean;
		interval: NodeJS.Timeout;
		tickets: any[];
		itStatus: boolean;
	}>();

export default async (user, visible) => {
    if(tasksRunningFor.has(user.id) && tasksRunningFor.get(user.id).visible == visible) return;
    clearInterval(tasksRunningFor.get(user.id).interval);

	let tickets = await coll.find({ status: 1 }).toArray();
	tasksRunningFor.set(user.id, {
		visible,
		interval: setInterval(() => run(user), 50),
		tickets,
		itStatus: false
	});
}

async function run(user) {
	let task = tasksRunningFor.get(user.id);

	if(!task.itStatus) {
		if(task.tickets.length == 0) {
			clearInterval(task.interval);
			tasksRunningFor.delete(user.id);
			return;
		}

		task.itStatus = true;

		let ticket = new Ticket(),
			ticketFound = await ticket.fetch("channel", task.tickets.shift().supportChannel);
		
		if(!ticketFound) return task.itStatus = false;

		if(task.visible) {
			if(!ticket.channel?.permissionsFor(user.id).has("VIEW_CHANNEL", true)) 
				await ticket.channel?.updateOverwrite(user.id, {
					VIEW_CHANNEL: true,
					SEND_MESSAGES: true,
					EMBED_LINKS: true,
					ATTACH_FILES: true,
					USE_EXTERNAL_EMOJIS: true
				});

				task.itStatus = false;
		} else {
			if(ticket.supporters?.includes(user.id)) return task.itStatus = false;
			if(ticket.channel?.permissionsFor(user.id).has("VIEW_CHANNEL", true)) 
				await ticket.channel?.updateOverwrite(user.id,  {
					VIEW_CHANNEL: false
				});
	}}
}
import { CategoryChannel, TextChannel } from "discord.js";
import { client } from "../../";
import { Ticket } from "./classes/ticket";

import moment from "moment";

let db = client.db, ticketData = {};

export const sortTickets = async () => {
    let category = client.channels.cache.get(client.config.channels.ticketCat) as CategoryChannel;

    if(!category) return;

    let positions = category.children.filter(c => c.name !== "tickets").sort((a, b) => parseInt(a.name as string) > parseInt(b.name as string) ? 1 : -1);

    for(let i = 0; i< positions.size; i++) {
        let channel = positions.array()[i];
        if(channel.position == i+1) await channel.setPosition(i + 1)
    }
}

export const checkOldTickets = async () => {
    let category = client.channels.cache.get(client.config.channels.ticketCat) as CategoryChannel,
        coll = db.collection("tickets");

    if(!category) return;

    let ticketsNN = await coll.find({
            lastUserMessage: { $lte: Date.now() - 5 * 24 * 60 * 60 * 1000 },
            ticketCloseWarning: { $exists: false },
            supportChannel: { $in: category.children.filter(ch => ch.id !== client.config.channels.ticketChannel).map(ch => ch.id) }
        }).toArray(),
        ticketTC = await coll.find({
            ticketCloseWarning: { $lte: { $lte: Date.now() -2 *24 * 60 * 60 * 1000 }},
            supportChannel: { $in: category.children.filter(ch => ch.id !== client.config.channels.ticketChannel).map(ch => ch.id) }
        }).toArray();

    for(let i = 0; i < ticketsNN.length; i++) {
        let ticket = new Ticket();
        if(await ticket.fetch("channel", ticketsNN[i].supportChannel))
            ticket.closeWarning()
    }

    for(let i = 0; i < ticketTC.length; i++) {
        let ticket = new Ticket();
        if(await ticket.fetch("channel", ticketsNN[i].supportChannel))
            ticket.close(client.user, "No response for 7 days.")
    }
}

export const getVars = url => {
	let regexp = /^https:\/\/discord(app)?\.com\/api\/webhooks\/(\d{18})\/([\w-]{1,})$/;
	return { id: regexp.exec(url)[2], token: regexp.exec(url)[3] };
}

export const updateTopic = async() => {
    let coll = client.db.collection("tickets"),
        total = await coll.countDocuments(),
        ticketCount = {
            unclaimed: (await coll.find({status: 1}).toArray()).length,
            inProgress: (await coll.find({status: 2}).toArray()).length,
            closed: (await coll.find({status: 3}).toArray()).length
        };

    if(ticketCount == ticketData) return;
    ticketData = ticketCount;

    (client.channels.cache.get(client.config.channels.ticketChannel) as TextChannel)
        .setTopic(`${ticketCount.unclaimed} unclaimed • ${ticketCount.inProgress} in progress • ${ticketCount.closed} closed • ${total} total | Last updated: ${moment(new Date()).format("DD/MM/YY LT")} (${Date().split("(")[1].replace(")", "").match(/[A-Z]/g).join("")})`);
}

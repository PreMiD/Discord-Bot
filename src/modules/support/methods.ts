import { CategoryChannel, TextChannel } from "discord.js";
import { client } from "../../";
import { Ticket } from "./classes/ticket";

import moment from "moment";

const db = client.db;

export const sortTickets = async () => {
    const category = client.channels.cache.get(client.config.channels.ticketCategory) as CategoryChannel;

    if(!category) return;

    const positions = category.children.filter(c => c.name !== "tickets").sort((a, b) => parseInt(a.name as string, 10) > parseInt(b.name as string, 10) ? 1 : 0);

    for(let i = 0; i< positions.size; i++) {
        const channel = positions.array()[i];
        if(channel.position === i+1) await channel.setPosition(i + 1);
    }
};

export const checkOldTickets = async () => {
    const category = client.channels.cache.get(client.config.channels.ticketCategory) as CategoryChannel,
        coll = db.collection("tickets");

    if(!category) return;

    const ticketsNN = await coll.find({
            lastUserMessage: { $lte: Date.now() - 5 * 24 * 60 * 60 * 1000 },
            ticketCloseWarning: { $exists: false },
            supportChannel: { $in: category.children.filter(ch => ch.id !== client.config.channels.ticketChannel).map(ch => ch.id) }
        }).toArray(),
        ticketsTC = await coll.find({
            ticketCloseWarning: { $lte: Date.now() - 2 * 24 * 60 * 60 * 1000 },
            supportChannel: { $in: category.children.filter(ch => ch.id !== client.config.channels.ticketChannel).map(ch => ch.id) }
        }).toArray();

    for(let i = 0; i < ticketsNN.length; i++) {
        const ticket = new Ticket();
        if(await ticket.fetch("channel", ticketsNN[i].supportChannel))
            ticket.closeWarning();
    }

    for(let i = 0; i < ticketsTC.length; i++) {
        const ticket = new Ticket();
        if(await ticket.fetch("channel", ticketsTC[i].supportChannel))
            ticket.close(client.user, "No response for 7 days.");
    }
};

export const getVars = url => {
	const regexp = /^https:\/\/discord(app)?\.com\/api\/webhooks\/(\d{18})\/([\w-]{1,})$/;
	return { id: regexp.exec(url)[2], token: regexp.exec(url)[3] };
};

export const updateTopic = async() => {
    const coll = client.db.collection("tickets"),
        total = await coll.countDocuments(),
        ticketCount = {
            unclaimed: (await coll.find({status: 1}).toArray()).length,
            inProgress: (await coll.find({status: 2}).toArray()).length,
            closed: (await coll.find({status: 3}).toArray()).length
        },
        channel = (client.channels.cache.get(client.config.channels.ticketChannel) as TextChannel),
        content = `${ticketCount.unclaimed} unclaimed • ${ticketCount.inProgress} in progress • ${ticketCount.closed} closed • ${total} total`;
        
        if(channel.topic.includes(content)) return;
        
        channel.setTopic(`${content} | Last updated: ${moment(new Date()).format("DD/MM/YY LT")} (${Date().split("(")[1].replace(")", "").match(/[A-Z]/g).join("")})`);
};

export const checkDuplicates = () => {
    const coll = client.db.collection("tickets"), channels = (client.channels.cache.get(client.config.channels.ticketCategory) as CategoryChannel).children;

    channels.forEach((c: TextChannel) => {
        channels.forEach(async (c2: TextChannel) => {
            if((c.name === c2.name) && (c.id !== c2.id)) {
                const ticket = await coll.findOne({ supportChannel: c.id }),
                    ticket2 = await coll.findOne({ supportChannel: c2.id });

                if(ticket && !ticket2) c2.delete();
                if(!ticket && ticket2) c.delete();
            }
        });
    });
};
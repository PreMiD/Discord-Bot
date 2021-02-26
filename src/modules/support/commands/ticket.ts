import { client } from "../../..";
import { Ticket } from "../classes/ticket";

import activity from "../../moderation/activity";

module.exports = {
    config: {
        name: "ticket",
        aliases: [],
        description: "Ticket commands.",
        slashCommand: true
    }, run: async (data, perms) => {
        switch (data.data.options[0].name) {
            case "activity": return activity(data, perms);
            case "close": {
                let ticket = new Ticket(), ticketFound: boolean;
    
                if(data.channel.parent.id == data.supportCategory) ticketFound = await ticket.fetch("channel", data.channel.id);
                else ticketFound = await ticket.fetch("author", data.member.id);
    
                if (!ticketFound && data.channel.parent.id != client.config.supportCategory) return (await data.channel.send(`${data.member.toString()}, you don't have any open tickets.`)).delete({ timeout: 10 * 1000 });
                return await ticket.close(data.member.user, (data.data.options[0]?.options?.[0].value as string) || "Not Specified");
            }
        }
    }
}
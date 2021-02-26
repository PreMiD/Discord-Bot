import { TextChannel } from "discord.js";
import {client} from "../../../";
import { Ticket } from "../classes/ticket";

let coll = client.db.collection("tickets");

module.exports = {
    name: "guildMemberUpdate",
    run: async (client, oldM, newM) => {
        if (oldM.roles.cache.has(client.config.roles.ticketManager) && !newM.roles.cache.has(client.config.roles.ticketManager)) {
            let tickets = await coll.find({ supporters: oldM.id }).toArray();

            tickets.map(async x => {
                let t = new Ticket();
                if(await t.fetch("channel", x.supportChannel)) {
                    let channel = (client.channels.cache.get(t.supportChannel) as TextChannel);
    
                    channel.updateOverwrite(oldM.id, {
                        VIEW_CHANNEL: false,
                        SEND_MESSAGES: false,
                        EMBED_LINKS: false,
                        ATTACH_FILES: false,
                        USE_EXTERNAL_EMOJIS: false
                    });
    
                    channel.send("**>>** Awaiting new supporter...");
                }
            });
        }
    }
}
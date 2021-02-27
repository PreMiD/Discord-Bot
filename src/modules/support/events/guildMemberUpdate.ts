import { TextChannel } from "discord.js";
import {client} from "../../../";
import { Ticket } from "../classes/ticket";

const coll = client.db.collection("tickets");

export default {
    name: "guildMemberUpdate",
    run: async (client, oldM, newM) => {
        if (oldM.roles.cache.has(client.config.roles.ticketManager) && !newM.roles.cache.has(client.config.roles.ticketManager)) {
            const tickets = await coll.find({ supporters: oldM.id }).toArray();

            tickets.forEach(async x => {
                let t = new Ticket();
                if(await t.fetch("channel", x.supportChannel)) {
                    let channel = (client.channels.cache.get(t.supportChannel) as TextChannel);
                    console.log(x.ticketId);
                    channel.updateOverwrite(oldM.id, {
                        VIEW_CHANNEL: false,
                        SEND_MESSAGES: false,
                        EMBED_LINKS: false,
                        ATTACH_FILES: false,
                        USE_EXTERNAL_EMOJIS: false
                    });
                    
                    coll.findOneAndUpdate({ ticketId: x.ticetId }, { $pull: { supporters: oldM.user.id } })

                    if(x.supporters.length <=1) channel.send("**>>** Awaiting new supporter...");
                }
            });
        }
    }
}
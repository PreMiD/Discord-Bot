import { GuildMember, TextChannel } from "discord.js";
import { Ticket } from "../classes/ticket";

module.exports = {
    name: "raw",
    run: async (client, out) => {
        if(!["MESSAGE_REACTION_ADD"].includes(out.t) || !out.d.guild_id) return;

        let guild = client.guilds.cache.get(out.d.guild_id),
            member = await guild.members.fetch(out.d.user_id);
        
        if(!member || member.user.bot) return;

        let ticket = new Ticket();
        if (!(await ticket.fetch("message", out.d.message_id))) return;

        let tMsg;
        try {
            tMsg = await (client.channels.cache.get(client.config.channels.ticketChannel) as TextChannel).messages.fetch(out.d.message_id);
        } catch { 
            tMsg = null;
        }

        if(!tMsg) return;

        if(out.d.emoji.id == "521018476870107156" && ticket.status == 2) ticket.accept(member);
        if(out.d.emoji.name == "🚫") {
            tMsg.reactions.removeAll();
            tMsg.react("❤");
            tMsg.awaitReactions((r, u) => r.emoji.name === "❤" && u.id === out.d.user_id, { max: 1, time: 5 * 1000, errors: ["time"] })
                .then(_ => {
                    if(ticket.status == 2) return ticket.close(member.user, tMsg);
                    else return ticket.delete(member.user, tMsg);
                })
                .catch(_ => {
                    tMsg.reactions.removeAll();
                    if(ticket.status == 1) tMsg.react("521018476870107156");
                    tMsg.react("🚫");
                })
        };

        if(out.d.emoji.name == "success" && ticket.status != 2) {
            ticket.accept(member);
            tMsg.reactions.removeAll();
            tMsg.react("🚫");
        }
    }
}
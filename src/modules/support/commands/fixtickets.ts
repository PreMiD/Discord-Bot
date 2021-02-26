import { MessageEmbed } from "discord.js";

module.exports = {
    config: {
        name: "fixtickets",
        aliases: [],
        slashCommand: false
    },
    run: async (client, msg, args) => {
        if(msg.author.id != "506899274748133376") return;
        
        msg.react("521018476480167937");
        
        let coll = client.db.collection("tickets");

        if(args[0] == "step1") {
            await coll.updateMany({ status: {$exists: false} }, { $set: { status: 3 } });
            await coll.updateMany({ status: 2 }, { $set: { status: 3 } });
            msg.reactions.removeAll();
            msg.react("✅");
        }
        
        if(args[0] == "step2") {
            for await(const channel of client.channels.cache.get(client.config.channels.ticketCategory).children.map(x => x)) {
                let ticket = await coll.findOne({ supportChannel: channel.id });
                if(ticket) coll.findOneAndUpdate({ supportChannel: channel.id }, { $set: { status: 2 } });
            }
            msg.reactions.removeAll()
            msg.react("✅")
        }

        if(args[0] == "step3") {
            let embed = new MessageEmbed()
                .setAuthor("PreMiD Support", client.user.avatarURL())
                .addField("How does this work?", "To get started, simply send a message in this channel, explain clearly what your error is, and attach images where necessary! Once your message is sent, the bot will first confirm that you want to create this ticket, then our support agents will take over!")
                .addField("How long do I have to wait?", "We have many agents on the team ready to assist, so hopefully not long!")
                .addField("Anything else?", "Our agents have the right to reject your ticket for any reason they see fit, if your ticket is rejected and you believe it shouldn't have been, you can ask the support agent that rejected your ticket why in <#527675240231206934>.")
                .setFooter("Support system, developed by Callum.");
            msg.channel.send(embed);
        }
    }
}
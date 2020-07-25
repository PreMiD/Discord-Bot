import * as Discord from "discord.js";
import { pmdDB } from "../../../database/client";
import config from "../../../config";

module.exports.run = async (message: Discord.Message, args: Array<string>) => {
    let embed: Discord.MessageEmbed;
    let usage: string, title: string, presence: { name: string; };
    const query = args.join(" ");

    if (query.length < 1) {
        title = "Usage of PreMiD";
    } else {
        title = `Searching for a Presence called **\"${query}\"**`;
        try {
            const presencesColl = pmdDB.collection("presences");
            presence = await presencesColl.findOne(
                { $or: [
                    {
                        name: { $regex: query, '$options': 'i' }
                    },
                    {
                        "metadata.service": { $regex: query, '$options': 'i' }
                    },
                    {
                        "metadata.url": { $regex: query, '$options': 'i' }
                    },
                    {
                        "metadata.altnames": { $regex: query, '$options': 'i' }
                    }
                ]
            })
        } catch(e){
            embed = new Discord.MessageEmbed({
                title: "Invalid input. Please use words and numbers only.",
                color: "#ff0000"
            })
               
            return message.channel.send(embed)
            .then(msg => msg.delete({ timeout: 15 * 1000 }));
        }
    }
    embed = new Discord.MessageEmbed({
        title,
        description: "<a:loading:521018476480167937> **Loading....**",
        color: "RANDOM"
    });

    message.channel.send(embed).then(async (msg) => {
        msg = msg as Discord.Message;
        try {
            const statsCollection = pmdDB.collection("science");
            const results = await statsCollection.find().toArray();

            if (query.length < 1) {            
                usage = results.length.toString();
                embed.setFooter(`You can also use  \|\| ${config.prefix}usage [Presence name] \|\|  to search for a specific one.`);
            } else {
                if (presence == undefined){
                    embed.setDescription(`Couldn't find a Presence called: \"${query}\".`);
                    return msg.edit(embed).then(msg => msg.delete({ timeout: 15 * 1000 }));
                }
                embed.setTitle(`Found a Presence called: \"${presence.name}\"`)
                usage = prepareUsage(results)[presence.name];
            };
        }
        catch(e) {
            console.error(e);
            embed.setDescription("There was an error getting data. Try again later.");
            return msg.edit(embed).then(msg => msg.delete({ timeout: 15 * 1000 }));
        };
        
        embed.setDescription(`Currently there are: ${usage == undefined ? 0 : usage} users.`);
		msg.edit(embed).then(msg => msg.delete({ timeout: 15 * 1000 }));
    });
    if (!message.deleted) message.delete();
};

module.exports.config = {
	name: "usage",
	description: "Get current usage / user count of PreMiD or any Presence!"
};

function prepareUsage(science: any[]){
    let ranking = {};
    [].concat
		.apply(
			[],
			science.map(s => s.presences)
		)
		.map(function (x: string) {
			ranking[x] = (ranking[x] || 0) + 1;
		});
	return ranking;
};

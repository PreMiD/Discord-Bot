import * as Discord from "discord.js";
import { pmdDB } from "../../../database/client";

module.exports.run = async (message: Discord.Message, args: Array<string>) => {
    let embed: Discord.MessageEmbed;
    let usage: string, usageOf: string;
    const query = args.join(" ")

    if (query.length < 1) {
        usageOf = "PreMid";
    } else {
        usageOf = `a Preasance called ${query}`;
    }

    embed = new Discord.MessageEmbed({
        title: `Usage of ${usageOf}`,
        description: "<a:loading:521018476480167937> Loading....",
        color: "RANDOM"
    });

    message.channel.send(embed).then(async (msg) => {

        let errorChck: boolean = false;
        msg = msg as Discord.Message;
        try {
            const statsCollection = pmdDB.collection("science")
            const results = await statsCollection.find().toArray();
            
            if (query.length < 1){            
                usage = results.length.toString();
            }
            else {
                usage = prepareUsage(results)[query];
                
                if (usage == undefined){
                    embed.setDescription(`Couldn't find a Preasance called: ${query} or there are no active users.`);
                    errorChck = true;
                }
            }
        }
        catch(e) {
            console.error(e);
            embed.setDescription("There was an error getting data. Try again later. (NO DATABASE RESPONSE)");
            errorChck = true;
        }
        
        if (errorChck != true){
            embed.setDescription(`Currently there are: ${usage} users.`);
        }
		msg.edit(embed).then(msg => msg.delete({ timeout: 15 * 1000 }));
    });
    if (!message.deleted) message.delete();
};

module.exports.config = {
	name: "usage",
	description: "Get current usage / user list of PreMiD or any preasence! (to check Preasnce users type the name of it after the command!)"
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
}
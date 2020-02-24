import * as Discord from "discord.js";
import * as fetch from "node-fetch";

let embed: Discord.MessageEmbed, color, status;

module.exports.run = async (message: Discord.Message) => {
	embed = new Discord.MessageEmbed({
		title: "Status",
		description: "<a:loading:521018476480167937> Fetching status..."
	});
  fetch("https://status.premid.app/api/v2/status.json")
    .then(res => res.json())
    .then(json => {
    let data = json;
    if(data.status.description === "All Systems Operational") {
    embed = new Discord.MessageEmbed({
    title: "Status",
    description:("Our services are currently operation, if you are experiencing any difficulties, please let a member of staff know!"),
    color: "GREEN"
     })
     message.channel.send(embed).then(msg => {
     	msg = msg as Discord.Message;
       setTimeout(() => {
        msg.delete();
        message.delete();
      }, 10000);
     });
    } else {
    switch(data.status.indicator.toLowerCase()){
    case "none":
      color = "GREEN"
    break;
    case "minor":
      color = "YELLOW"
      status = "Minor"
    break;
    case "major":
      color = "ORANGE"
      status = "Major"
    break;
    case "critical":
      color = "RED"
      status = "Critical"
    break;
    default: 
      color = "GREEN"
    break;
    }
    fetch("https://status.premid.app/api/v2/components.json")
        .then(res => res.json())
        .then(response => {
            let size = response.components.length;
            let count = 0;
            let comp = new Array();
            response.components.forEach(component => {
                count++;
                comp.push(`${component.name } - ${component.status.substring(0, 1).toUpperCase() + component.status.substring(1)}`)
                if(count >= size) {
                    embed = new Discord.MessageEmbed({
                        title: "Status • status.premid.app",
                        color: color,
                        description: `
                        **Status:** ${status}
                        *${data.status.description}*
                        
                        **Component Status:**
                        • ${comp.join("\n• ")}
                        `,
                        footer: `Requested By • ${message.author.tag}`
                      })
                     message.channel.send(embed).then(msg => {
                         msg = msg as Discord.Message;
                      setTimeout(() => {
                        msg.delete();
                        message.delete();
                      }, 10000);
                     });
                }
            })



        })
    };
  });
};

module.exports.config = {
	name: "status",
	description: "Shows current status of our services."
};

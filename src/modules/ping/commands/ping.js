"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Discord = require("discord.js");
var embed, ping;
module.exports.run = async (message) => {
    embed = new Discord.MessageEmbed({
        title: "Ping",
        description: "<a:loading:521018476480167937> Pinging..."
    });
    message.channel.send(embed).then(msg => {
        msg = msg;
        ping = msg.createdTimestamp - message.createdTimestamp;
        if (ping < 250)
            embed.setColor("#00ff00");
        if (ping > 250 && ping < 500)
            embed.setColor("#ffff00");
        if (ping > 500)
            embed.setColor("#ff0000");
        embed.setDescription(`**Discord** (\`\`${ping}ms\`\`)\n**Discord API** (\`\`${message.client.ws.ping}ms\`\`)`);
        msg.edit(embed).then(msg => setTimeout(() => msg.delete(), 10 * 1000));
    });
    message.delete();
};
module.exports.config = {
    name: "ping"
};

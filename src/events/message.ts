import { Client, Message } from "discord.js";

module.exports = {
    name: "message",
    type: "client",
    run: (client, msg) => {
        if(msg.channel.type == "dm") return;
        let prefixes = ["p!", "p1", "/"];
        prefixes.forEach(async inp => {
            let prefix = msg.content.match(new RegExp(`^<@!?${client.user.id}> `))
                ? msg.content.match(new RegExp(`^<@!?${client.user.id}> `))[0]
                : msg.content.toLowerCase().startsWith(inp.toLowerCase()) 
                ? inp : null;

            if(!prefix) return;

            let args = msg.content.replace(prefix, "").split(" ").slice(1),
                input = msg.content.replace(prefix, "").split(" ")[0].toLowerCase(),
                cmd = client.commands.get(input) || client.aliases.get(input),
                perms = await msg.client.elevation(client, msg.author.id);

            if (!cmd || cmd.config.slashCommand || (client.user.id == "574233163660918784" && msg.guild.id == "493130730549805057")) return;
            if (typeof cmd.config.permLevel != "undefined" && perms < cmd.config.permLevel) return msg.react("⚠");

            try {
                await cmd.run(client as Client, msg as Message, args as string[]);
            } catch(e) {
                msg.reply("an error occured while executing that command! Our development team have been notified.");
                client.users.cache.get("506899274748133376").send({embed: {
                    description: `${msg.author} | ${cmd.config.name}\n\n${e}`
                }})
            }
        })
    }
}
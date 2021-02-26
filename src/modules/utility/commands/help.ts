import { client } from "../../.."
import UniformEmbed from "../../../util/UniformEmbed";

module.exports = {
    config: {
        name: "help",
        aliases: ["commands"],
        slashCommand: true
    },
    run: async (data, perms) => {
        let commands = client.commands.filter(c => !c.config.hidden && perms >= (c.config.permLevel ?? 0)), 
            embed = new UniformEmbed({
                description: commands.map(cmd => 
                    `**\`${cmd.config.slashCommand ? "/" : "p!"}${cmd.config.name}\`** - ${cmd.config.description}`    
                ).join("\n")
            }, ":book: Help");

        (await data.channel.send(data.member.toString(), embed)).delete({ timeout: 15 * 1000 });
    }
}
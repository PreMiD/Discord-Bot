import UniformEmbed from "../../../util/UniformEmbed";
import { client } from "../../../";

module.exports = {
    config: {
        name: "info",
        aliases: [],
        description: "Shortcuts to get things done faster.",
        slashCommand: true
    },
    run: async (data) => {
        if(data.data.options[0].name == "list") {
            const embed = new UniformEmbed({description: client.infos.keyArray().map(k =>`**${client.infos.get(k).title}** - \`${k}\`, \`${client.infos.get(k).aliases.join("`, `")}\``).join("\n\n")}, ":bookmark: Info • List");
            data.channel.send(data.member.toString(), embed);
        } else {
            let shortcutArg = data.data.options[0].options[0];
        
            if (!(client.infos.has(shortcutArg.value.toLowerCase()) || client.infoAliases.has(shortcutArg.value.toLowerCase()) || client.infos.has(client.infoAliases.get(shortcutArg.value.toLowerCase())))) {
                (await data.channel.send(data.member.toString(), new UniformEmbed({ description: "Please enter a valid shortcut." }, ":bookmark: Info • Error", "#ff5050"))).delete({timeout: 10 * 1000});
                return;
            }
        
            const info = client.infos.get(shortcutArg.value.toLowerCase()) || client.infos.get(client.infoAliases.get(shortcutArg.value.toLowerCase())),
                embed = new UniformEmbed({ description: info.description || "No description providen." }, `:bookmark: Info • ${info.title || "No Title"}`, info.color || undefined);
        
            data.channel.send(embed);
        }
    }
}
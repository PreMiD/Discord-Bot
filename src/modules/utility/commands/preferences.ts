import { client } from "../../..";
import UniformEmbed from "../../../util/UniformEmbed";
import creditRoles from "../../credits/creditRoles";
import toggleTicketVisibility from "../toggleTicketVisibility";

let coll = client.db.collection("userSettings");

module.exports = {
    config: {
        name: "preferences",
        description: "User settings.",
        aliases: [],
        slashCommand: true
    },
    run: async (data, perms) => {
        let args = data.data.options;

        if(!Object.keys(creditRoles).find(r => data.member.roles.cache.has(creditRoles[r])) || perms == 0)
            return (await data.channel.send(`${data.member.toString()}, there are no available settings to change for you at this time.`)).delete({ timeout: 10 * 1000 });

        let userSettings = (await coll.findOne(
            { userId: data.member.id },
            { projection: { _id: false } }
        )) || { userId: data.member.id, showAllTickets: false, showContributor: true };

        if(perms < 1) delete userSettings["showAllTickets"];
        if(!args) return preferencesMsg();

        let oldSettings = JSON.parse(JSON.stringify(userSettings));
        for(let arg of args) {
            if(arg.name == "showalltickets") userSettings.showAllTickets = arg.value;
            if(arg.name == "showcontributor") userSettings.showContributor = arg.value;
        }
        
        await coll.findOneAndUpdate(
            { userId: data.member.id },
            { $set: userSettings },
            { upsert: true }
        );

        preferencesMsg();

        if(userSettings.showAllTickets !== oldSettings.showAllTickets) await toggleTicketVisibility(data.member, userSettings.showAllTickets);

        async function preferencesMsg() {
            delete userSettings["userId"];
            let user = data.member.user.username;
            return (await data.channel.send(data.member.toString(), {
                author: {
                    name: `${user}${user.toLowerCase().endsWith("s") ? "" : "'s"} settings`,
                    icon_url: data.member.user.displayAvatarURL()
                },
                description: Object.keys(userSettings)
                    .map(s => `**${s}**: \`${userSettings[s]}\``)
                    .join("\n")
            })).delete({ timeout: 15 * 1000 });
        }
    }
}
import { client } from "../../..";
import UniformEmbed from "../../../util/UniformEmbed";

let coll = client.db.collection("presences");

module.exports = {
    config: {
        name: "presences",
        aliases: [],
        description: "Presence commands.",
        slashCommand: true
    },
    run: async (data) => {
        if(!data.data.options) 
            return (await data.channel.send(`${data.member.toString()}, please specify an argument! (Available arguments: \`search\`)`))
                .delete({ timeout: 10 * 1000 });
        if(data.data.options.length == 2) 
            return (await data.channel.send(`${data.member.toString()}, please specify one argument only! (Available arguments: \`search\`)`))
                .delete({ timeout: 10 * 1000 });
        if(data.data[0].value.trim().length == 0) 
            return (await data.channel.send(`${data.member.toString()}, please specify a search query!`))
                .delete({ timeout: 10 * 1000 });        
        if(data.data.options[0].name == "search")
            return await data.channel.send(data.member.toString(), await searchPresence(data.data.options[0].value));

        async function searchPresence(query) {
            let presences = await coll.find({
                        $or: [
                            { "metadata.url": { $regex: query, $options: "i" } },
                            { "metadata.tags": { $regex: query, $options: "i" } },
                            { "metadata.service": { $regex: query, $options: "i" } },
                            { "metadata.altnames": { $regex: query, $options: "i" } },
                            { "metadata.category": { $regex: query, $options: "i" } }
                        ]
                    }, { projection: { _id: false, metadata: true } 
                })
                .limit(5)
                .toArray(),
                descriptionFunsies = "";

            for(const result of presences) {
                descriptionFunsies += `**[${
                    result.metadata.service
                }](https://premid.app/store/presences/${encodeURIComponent(
                    result.metadata.service
                )} "Click here to go to the store page for ${
                    result.metadata.service
                }!")** by [${result.metadata.author.name}](https://premid.app/users/${
                    result.metadata.author.id
                } "Click here to go to the profile page for ${
                    result.metadata.author.name
                }!\n_")`;
                
                let desc = result.metadata.description.en;
                descriptionFunsies += `${desc.length > 100 ? desc.substr(0, 100) + "..." : desc}_\n\n`;
            }
            if(presences[0])
                return new UniformEmbed(
                    {
                        thumbnail: {
                            height: 50,
                            width: 50,
                            url: presences[0].metadata.logo   
                        },
                        description: `**Query:** \`${query}\`\n\n${descriptionFunsies}`
                    },
                    `:mag_right: Presences • Search`,
                    presences[0].metadata.color
                )
            else return new UniformEmbed(
                {
                    description: `No results for query: \`${query}\``
                },
                ":mag_right: Presences • Error",
                "#ff5050"
            )
        }
    }
}
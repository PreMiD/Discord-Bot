import { GuildMember } from "discord.js";
import { client } from "..";

const coll = client.db.collection("presences"), discordUsers = client.db.collection("discordUsers");

export default {
    name: "guildMemberAdd",
    run: async (client, member: GuildMember) => {
        const role = client.guilds.cache.get(client.config.main_guild).roles.find(r => r.id === client.config.roles.presence);
        if(await coll.findOne({ "metadata.author.id": member.id })) member.roles.add(role);
    
        discordUsers.findOneAndUpdate(
            { userId: member.id },
            { $set: {
                userId: member.id,
                created: member.user.createdTimestamp,
                username: member.user.username,
                discriminator: member.user.discriminator,
                avatar: member.user.displayAvatarURL(),
                flags: member.user.flags.toArray()
            } },
            { upsert: true }
        );
    }
};
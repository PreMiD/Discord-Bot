import {pmdDB} from "../database/client";
import * as Discord from "discord.js";
import roles from "../roles";
const col = pmdDB.collection("presences");

module.exports.run = async (member: Discord.GuildMember) => {
    const doc = await col.findOne({ "metadata.author.id": member.id });
    if (doc) {
        if (!member.roles.cache.has(roles.presence)) {
            await member.roles.add(roles.presence);
        }
    }
}
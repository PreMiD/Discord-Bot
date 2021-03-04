import { GuildMember } from "discord.js";
import { client } from "..";

const coll = client.db.collection("userSettings"),
	betaUsers = client.db.collection("betaUsers"),
	alphaUsers = client.db.collection("alphaUsers"),
	discordUsers = client.db.collection("discordUsers");

export default {
    name: "guildMemberAdd",
    run: (client, member: GuildMember) => {
        coll.findOneAndDelete({ userId: member.id });
        betaUsers.findOneAndDelete({ userId: member.id });
        alphaUsers.findOneAndDelete({ userId: member.id });
        discordUsers.findOneAndDelete({ userId: member.id });
    }
};
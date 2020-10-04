import * as Discord from "discord.js";
import roles from "../roles";
import { pmdDB } from "../database/client";
import { success } from "../util/debug";
import { client } from "..";
const col = pmdDB.collection("presences");

module.exports.run = async (client: Discord.Client) => {
	if (client.user) success(`Connected as ${client.user.tag}`);
	updatePresenceAuthors();
	setInterval(updatePresenceAuthors, 15 * 60 * 1000);
};

async function updatePresenceAuthors() {
	const guild = client.guilds.cache.get("493130730549805057")
	,	presenceAuthors = (await col.find().toArray()).map(p => p.metadata.author.id);

	for (const author of presenceAuthors) {
		const member = guild.members.resolve(author);
		if (member && !member.roles.cache.has(roles.presence)) member.roles.add(roles.presence);
	}
}

module.exports.config = {
	clientOnly: true
};

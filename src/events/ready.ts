import { success } from "../util/debug";
import {pmdDB} from "../database/client";
import * as Discord from "discord.js";
import roles from "../roles";
const col = pmdDB.collection("presences");

module.exports.run = async (client: Discord.Client) => {
	if (client.user) success(`Connected as ${client.user.tag}`);
	let oldPresences = (await col.find().toArray()).map(x => x._id.toString());
	setInterval(async () => {
		const newPresences = (await col.find().toArray()).map(x => x._id.toString());
		const actual = newPresences.filter(x => !oldPresences.includes(x));
		for (const presence of actual) {
			const member = client.guilds.cache.get("493130730549805057").members.cache.get(presence.metadata.author.id);
			if (!member) continue;
			if (!member.roles.cache.has(roles.presence)) {
				await member.roles.add(roles.presence);
			}
		}
		oldPresences = newPresences;
	}, 60000 * 15);
};

module.exports.config = {
	clientOnly: true
};

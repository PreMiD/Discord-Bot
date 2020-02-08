import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";

const coll = MongoClient.db("PreMiD").collection("credits");

module.exports = async (
	_: Discord.GuildMember,
	newMember: Discord.GuildMember
) => {
	if (!newMember?.user?.id) return;

	coll.findOneAndUpdate(
		{ userId: newMember.user.id },
		{
			$set: {
				status: newMember.user.presence.status
			}
		}
	);
};

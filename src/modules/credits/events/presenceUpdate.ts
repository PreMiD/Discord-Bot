import * as Discord from "discord.js";
import { pmdDB } from "../../../database/client";

const coll = pmdDB.collection("credits");

module.exports = async (
	oldPresence: Discord.Presence,
	newPresence: Discord.Presence
) => {
	if (!oldPresence || newPresence.status === oldPresence.status) return;

	coll.findOneAndUpdate(
		{ userId: newPresence.userID },
		{ $set: { status: newPresence.status } }
	);
};

import * as Discord from "discord.js";
import { pmdDB } from "../database/client";

const coll = pmdDB.collection("userSettings");

module.exports = (member: Discord.GuildMember) => {
	coll.findOneAndDelete({ userId: member.id });
};

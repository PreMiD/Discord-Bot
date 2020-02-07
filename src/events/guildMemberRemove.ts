import * as Discord from "discord.js";
import { MongoClient } from "../database/client";

const coll = MongoClient.db("PreMiD").collection("userSettings");
module.exports = (member: Discord.GuildMember) => {
	coll.findOneAndDelete({ userId: member.id });
};

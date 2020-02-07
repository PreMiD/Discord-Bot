import * as Discord from "discord.js";
import { MongoClient } from "../database/client";

const coll = MongoClient.db("PreMiD").collection("userSettings");
module.exports = (guild: Discord.Guild, user: Discord.User) => {
	coll.findOneAndDelete({ userId: user.id });
};

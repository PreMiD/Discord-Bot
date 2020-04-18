import * as Discord from "discord.js";
import { pmdDB } from "../database/client";

const coll = pmdDB.collection("userSettings");

module.exports = (_: Discord.Guild, user: Discord.User) => {
	coll.findOneAndDelete({ userId: user.id });
};

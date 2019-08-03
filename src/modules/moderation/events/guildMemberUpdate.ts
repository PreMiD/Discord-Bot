import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";

var { muted } = require("../../../roles.json");

module.exports = async (
  oldMember: Discord.GuildMember,
  newMember: Discord.GuildMember
) => {
  if (oldMember.roles.has(muted) && !newMember.roles.has(muted))
    MongoClient.db("PreMiD")
      .collection("mutes")
      .findOneAndDelete({ userId: newMember.id });
};

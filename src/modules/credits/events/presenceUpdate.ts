import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";

module.exports = async (
  oldMember: Discord.GuildMember,
  newMember: Discord.GuildMember
) => {
  let creditsCollection = MongoClient.db("PreMiD").collection("credits");
  if (!newMember && !newMember.user) return;
  if (!(await creditsCollection.findOne({ userId: newMember.user.id }))) return;

  creditsCollection.updateOne(
    { userId: newMember.user.id },
    {
      $set: {
        status: newMember.user.presence.status
      }
    }
  );
};

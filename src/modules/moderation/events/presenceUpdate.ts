import * as Discord from "discord.js";
import { checkInvite } from "./message";
import { MongoClient } from "../../../database/client";
import { client } from "../../..";

let coll = MongoClient.db("PreMiD").collection("hiddenUsers");
module.exports = async (
  oldPresence: Discord.Presence,
  newPresence: Discord.Presence
) => {
  if (client.elevation(newPresence.user.id) > 0) return;

  if (
    newPresence.user.presence.activity === null ||
    !newPresence.user.presence.activity.name ||
    newPresence.user.presence.activity.name !== "Custom Status" ||
    newPresence.user.presence.activity.state === null
  ) {
    unHide(newPresence);
    return;
  }

  if (await checkInvite(newPresence.user.presence.activity.state)) {
    if (await coll.findOne({ userId: newPresence.user.id })) return;

    coll
      .insertOne({
        userId: newPresence.user.id,
        roles: newPresence.member.roles
          .filter(r => r.name !== "@everyone")
          .map(r => r.id)
      })
      .then(async () => {
        newPresence.member.roles
          .remove(newPresence.member.roles.map(r => r.id))
          .then(() => newPresence.member.roles.add("638488895658655754"));
      });
  } else unHide(newPresence);
};

async function unHide(newPresence: Discord.Presence) {
  if (!newPresence.member.roles.has("638488895658655754")) return;

  let hiddenUser = await coll.findOne({ userId: newPresence.user.id });
  if (!hiddenUser) return;

  await newPresence.member.roles.remove("638488895658655754");
  newPresence.member.roles
    .add(hiddenUser.roles)
    .then(() => coll.deleteOne({ userId: newPresence.user.id }));
}

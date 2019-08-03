import { MongoClient } from "../../database/client";
import { unmute } from "./commands/warn";
import { client } from "../..";

var { muted } = require("../../roles.json");

(async () => {
  var coll = MongoClient.db("PreMiD").collection("mutes"),
    mutes = await coll.find({ mutedUntil: { $exists: true } }).toArray();

  mutes.map(mute => {
    //* If user doesn't have mute role, delete mute from db
    client.guilds
      .first()
      .members.fetch(mute.userId)
      .then(m => {
        if (!m.roles.has(muted)) coll.findOneAndDelete({ userId: mute.userId });
      })
      .catch(() => {});

    //* If mute penalty time expired unmute else setTimeout to do it when it ends
    if (mute.mutedUntil - Date.now() <= 0) unmute(mute.userId);
    else setTimeout(() => unmute(mute.userId), mute.mutedUntil - Date.now());
  });
})();

import { client } from "../../..";
import { checkInvite } from "./message";
import { pmdDB } from "../../../database/client";

const coll = pmdDB.collection("hiddenUsers");

module.exports = async () => {
  const members = client.guilds
    .first()
    .members.filter(
      m =>
        m.user.presence.activity !== null &&
        m.user.presence.activity.name &&
        m.user.presence.activity.name === "Custom Status" &&
        m.user.presence.activity.state !== null &&
        client.elevation(m.user.id) === 0
    );

  const hiddenUsers = await coll
    .find({}, { projection: { _id: false } })
    .toArray();

  hiddenUsers.map(async hU => {
    if (client.guilds.first().members.has(hU.userId)) {
      const m = client.guilds.first().members.get(hU.userId);
      if (
        m.user.presence.activity === null ||
        !m.user.presence.activity.name ||
        m.user.presence.activity.name !== "Custom Status" ||
        m.user.presence.activity.state === null
      ) {
        if (!m.roles.has("638488895658655754")) return;

        let hiddenUser = await coll.findOne({ userId: m.user.id });
        if (!hiddenUser) return;

        await m.roles.remove("638488895658655754");
        m.roles
          .add(hiddenUser.roles)
          .then(() => coll.deleteOne({ userId: m.user.id }));
      }
    }
  });

  members.map(async m => {
    if (await checkInvite(m.user.presence.activity.state)) {
      if (await coll.findOne({ userId: m.user.id })) return;

      coll
        .insertOne({
          userId: m.user.id,
          roles: m.roles.filter(r => r.name !== "@everyone").map(r => r.id)
        })
        .then(async () => {
          m.roles
            .remove(m.roles.map(r => r.id))
            .then(() => m.roles.add("638488895658655754"));
        });
    }
  });
};

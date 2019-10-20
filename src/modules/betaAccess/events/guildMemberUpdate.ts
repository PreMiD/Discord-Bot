import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";

let { patron, beta, booster, donator } = require("../../../roles.json"),
  coll = MongoClient.db("PreMiD").collection("betaAccess");

module.exports = async (
  oldMember: Discord.GuildMember,
  newMember: Discord.GuildMember
) => {
  //* If user is patron and does not have either betaTester or beta role, give it to them.
  if (newMember.roles.has(patron) && !newMember.roles.has(beta)) {
    newMember.roles.add(beta);

    if (!(await coll.findOne({ userId: newMember.id })))
      await coll.insertOne({ userId: newMember.id });

    return;
  }

  //* If user boosts and doesn't have beta role, give it to them.
  if (newMember.roles.has(booster) && !newMember.roles.has(beta)) {
    newMember.roles.add(beta);

    coll.insertOne({ userId: newMember.id });

    return;
  }

  //* Remove beta access when boost expires.
  if (
    oldMember.roles.has(booster) &&
    !newMember.roles.has(booster) &&
    !newMember.roles.has(patron) &&
    !newMember.roles.has(donator)
  ) {
    newMember.roles.remove(beta);
    if (!oldMember.roles.has(patron)) newMember.roles.remove(beta);

    coll.findOneAndDelete({ userId: newMember.id });

    return;
  }

  //* Remove beta access when the beta role is removed.
  if (oldMember.roles.has(beta) && !newMember.roles.has(beta)) {
    coll.findOneAndDelete({ userId: newMember.id });
    return;
  }
};

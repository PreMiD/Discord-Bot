import * as Discord from "discord.js";
import { MongoClient } from "../../database/client";
import { client } from "../..";

var coll = MongoClient.db("PreMiD").collection("betaAccess"),
  { developer, supporter, booster } = require("../../roles.json");

async function updateBetaAccess() {
  var betaUsers = await coll.find().toArray(),
    usersToAdd = (await client.guilds
      .get("493130730549805057")
      .members.fetch({ limit: 0 }))
      .filter(
        m =>
          m.roles.has(developer) ||
          m.roles.has(supporter) ||
          m.roles.has(booster)
      )
      .map(m => m.id);

  var usersToAdd1 = usersToAdd
    .filter(uTA => betaUsers.includes(uTA))
    .map(m => {
      return { userId: m };
    });

  if (usersToAdd1.length > 0) coll.insertMany(usersToAdd1);
}

updateBetaAccess();
setInterval(updateBetaAccess, 30 * 1000);

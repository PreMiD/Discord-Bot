import { client } from "../..";
import { MongoClient } from "../../database/client";

var { betaTester, booster, patron, beta } = require("../../roles.json");

var coll = MongoClient.db("PreMiD").collection("betaAccess");

async function updateBetaAccess() {
  var betaUser = (await client.guilds
    .get("493130730549805057")
    .members.fetch({ limit: 0 })).filter(
    m => m.roles.has(betaTester) || m.roles.has(patron) || m.roles.has(booster)
  );

  betaUser.map(async bU => {
    if (!bU.roles.has(beta)) bU.roles.add(beta);
    if (!(await coll.findOne({ userId: bU.id })))
      coll.insertOne({ userId: bU.id });
  });
}

updateBetaAccess();

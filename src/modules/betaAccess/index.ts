import { client } from "../..";

var { supporter, booster, patron, beta } = require("../../roles.json");

async function updateBetaAccess() {
  var betaUser = (await client.guilds
    .get("493130730549805057")
    .members.fetch({ limit: 0 })).filter(
    m => m.roles.has(supporter) || m.roles.has(patron) || m.roles.has(booster)
  );

  betaUser.map(bU => {
    if (!bU.roles.has(beta)) bU.roles.add(beta);
  });
}

updateBetaAccess();

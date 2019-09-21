import { client } from "../../index";
import { MongoClient } from "../../database/client";

var creditRoles = require("./creditRoles.json");

async function updateCredits() {
  var coll = MongoClient.db("PreMiD").collection("credits");

  var users = await client.guilds
    .get("493130730549805057")
    .members.fetch({ limit: 0 });

  users = users.filter(
    m =>
      containsAny(creditRoles.map(cr => cr.roleId), m.roles.keyArray()).length >
      0
  );
  var creditUsers = users.map(m => {
    var mCreditRoles = containsAny(
        creditRoles.map(cr => cr.roleId),
        m.roles.keyArray()
      ),
      highestRole = m.roles.get(mCreditRoles[0]);

    var result = {
      userId: m.id,
      name: m.nickname || m.user.username,
      tag: m.user.discriminator,
      avatar: m.user.displayAvatarURL(),
      role: highestRole.name,
      roleColor: highestRole.hexColor,
      rolePosition: highestRole.position,
      status: m.user.presence.status
    };

    return result;
  });

  var coll = MongoClient.db("PreMiD").collection("credits"),
    mongoCredits = await coll.find().toArray(),
    usersToRemove = mongoCredits
      .map(mC => mC.userId)
      .filter(mC => !creditUsers.map(cU => cU.userId).includes(mC));

  usersToRemove.map(uTR => coll.findOneAndDelete({ userId: uTR }));

  creditUsers.map(async cu => {
    if (
      !(await coll.findOneAndReplace({ userId: cu.userId }, cu)).lastErrorObject
        .updatedExisting
    ) {
      coll.insertOne(cu);
    }
  });
}

updateCredits();
setInterval(updateCredits, 5 * 1000 * 60);

function containsAny(source, target) {
  var result = source.filter(function(item) {
    return target.indexOf(item) > -1;
  });
  return result;
}

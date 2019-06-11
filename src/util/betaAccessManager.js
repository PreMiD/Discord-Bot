var { query } = require("../database/functions"),
  { client } = require("../index");

module.exports = async function() {
  updateBetaAccess();
  setInterval(updateBetaAccess, 30 * 1000);
};

async function updateBetaAccess() {
  var betaUsers = await query("SELECT * FROM betaAccess"),
    betaUsersDiscord = (await client.guilds
      .first()
      .fetchMembers()).members.filter(
      m =>
        m.roles.has("585532751663333383") ||
        m.roles.has("573143507343114243") ||
        m.roles.has("493135149274365975")
    );

  betaUsersDiscord.map(m => {
    if (!betaUsers.rows.find(r => r.userId == m.id))
      query("INSERT INTO betaAccess (userId) VALUES (?)", m.id);
  });
}

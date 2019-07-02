var { query } = require("../database/functions");

exports.run = async (client, message, params) => {
  message.delete();

  if (
    !message.member.roles.has("585532751663333383") &&
    !message.member.roles.has("573143507343114243")
  )
    return;

  var hasKeyLeft = (await query(
    "SELECT * FROM betaAccess WHERE userId = ?",
    message.author.id
  )).rows;

  if (hasKeyLeft.length == 0 || hasKeyLeft[0].keysLeft == 0) {
    message.reply("You're out of beta keys!").then(msg =>
      setTimeout(() => {
        msg.delete();
      }, 5 * 1000)
    );
    return;
  }

  if (message.mentions.users.size == 0 || message.mentions.users.first().bot) {
    message
      .reply("Please mention the user you want to gift a beta access to.")
      .then(msg =>
        setTimeout(() => {
          msg.delete();
        }, 10 * 1000)
      );
  } else {
    var hasBetaAlready = (await query(
      "SELECT * FROM betaAccess WHERE userId = ?",
      message.mentions.users.first().id
    )).rows;
    if (hasBetaAlready.length > 0) {
      message.reply("This user already has beta access.").then(msg =>
        setTimeout(() => {
          msg.delete();
        }, 10 * 1000)
      );
      return;
    } else {
      await query("UPDATE betaAccess SET keysLeft = ? WHERE userId = ?", [
        hasKeyLeft[0].keysLeft - 1,
        message.author.id
      ]);
      await query(
        "INSERT INTO betaAccess (userId, keysLeft) VALUES (?, 0)",
        message.mentions.users.first().id
      );
      message.guild.members
        .get(message.mentions.users.first().id)
        .addRole("591284574823120909");
      message.guild.channels
        .get("518468138023649289")
        .send(
          `:tada: <@${
            message.mentions.users.first().id
          }> just received beta access to **PreMiD** by ${message.author.tag}!`
        );
    }
  }
};

exports.conf = {
  enabled: true,
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "betainvite",
  description: "Give your friend beta access...",
  usage: "betainvite <User>"
};

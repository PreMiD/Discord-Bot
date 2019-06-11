import * as Discord from "discord.js";
import { db } from "../../../database/db";

var { prefix } = require("../../../config.json"),
  embed = new Discord.MessageEmbed({
    title: "Warn",
    description: `*You can warn a user by typing
    \`\`${prefix}warn <user> <reason>\`\`*`,
    color: "#FF7000"
  });

module.exports.run = async (
  message: Discord.Message,
  params: Array<string>
) => {
  message.delete();
  if (params.length < 2 || message.mentions.users.size == 0) {
    message.channel
      .send(embed)
      .then(msg =>
        setTimeout(() => (msg as Discord.Message).delete(), 10 * 1000)
      );
    return;
  }

  //@ts-ignore
  if (message.mentions.users.first().id == message.author.id) {
    embed.setDescription("You can't warn yourself!");
    message.channel
      .send(embed)
      .then(msg =>
        setTimeout(() => (msg as Discord.Message).delete(), 10 * 1000)
      );
    return;
  }

  if (message.mentions.users.size < 1) {
    embed.setDescription("Please mentions the user you want to warn.");
    message.channel
      .send(embed)
      .then(msg =>
        setTimeout(() => (msg as Discord.Message).delete(), 10 * 1000)
      );
    return;
  }
  var warns =
    1 +
    //@ts-ignore
    (await db.query(
      "SELECT COUNT(user_id) AS warns FROM warns WHERE user_id = ?",
      //@ts-ignore
      message.mentions.users.first().id
    ))[0][0].warns;
  db.query(
    "INSERT INTO warns (user_id, reason, moderator_id) VALUES (?, ?, ?)",
    [
      //@ts-ignore
      message.mentions.users.first().id,
      params
        .slice(1, params.length)
        .join(" ")
        .trim(),
      //@ts-ignore
      message.author.id
    ]
  );

  embed.setDescription("");
  embed.setTitle("Warning");
  // @ts-ignore
  embed.addField("Moderator", `<@${message.author.id}>`, true);
  embed.addField(
    "Reason",
    params
      .slice(1, params.length)
      .join(" ")
      .trim(),
    true
  );
  embed.addField(`Warning${warns == 1 ? "" : "s"}`, warns);
  message.channel.send(
    //@ts-ignore
    `<@${message.mentions.users.first().id}>, you have been warned by **${
      //@ts-ignore
      message.author.username
    }**`,
    {
      embed: embed
    }
  );
};

module.exports.config = {
  name: "warn",
  permLevel: 1
};

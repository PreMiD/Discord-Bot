import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";

var { prefix } = require("../../../config.json");

module.exports.run = async (
  message: Discord.Message,
  params: Array<string>
) => {
  var embed = new Discord.MessageEmbed({
    title: "Warn",
    description: `*You can warn a user by typing
    \`\`${prefix}warn <user> <reason>\`\`*`,
    color: "#FF7000"
  });

  message.delete();
  if (params.length < 2 || message.mentions.users.size == 0) {
    message.channel
      .send(embed)
      .then(msg => (msg as Discord.Message).delete({ timeout: 10 * 1000 }));
    return;
  }

  if (message.mentions.users.first().id == message.author.id) {
    embed.setDescription("You can't warn yourself!");
    message.channel
      .send(embed)
      .then(msg => (msg as Discord.Message).delete({ timeout: 10 * 1000 }));
    return;
  }

  if (message.mentions.users.first().bot) {
    embed.setDescription("You can't warn bots!");
    message.channel
      .send(embed)
      .then(msg => (msg as Discord.Message).delete({ timeout: 10 * 1000 }));
    return;
  }

  var coll = MongoClient.db("PreMiD").collection("warns"),
    user = await coll.findOne({ userId: message.mentions.users.first().id }),
    warns = 1;

  if (!user)
    coll.insertOne({
      userId: message.mentions.users.first().id,
      warns: [
        {
          userId: message.author.id,
          reason: params
            .slice(1, params.length)
            .join(" ")
            .trim(),
          timestamp: Date.now()
        }
      ]
    });
  else {
    user.warns.push({
      userId: message.author.id,
      reason: params
        .slice(1, params.length)
        .join(" ")
        .trim(),
      timestamp: Date.now()
    });
    coll.findOneAndReplace({ userId: user.userId }, user);
    warns = user.warns.length++;
  }

  embed = new Discord.MessageEmbed({
    title: "Warning",
    color: "#FF7000",
    fields: [
      {
        name: "Moderator",
        value: `<@${message.author.id}>`,
        inline: true
      },
      {
        name: "Reason",
        value: params
          .slice(1, params.length)
          .join(" ")
          .trim(),
        inline: true
      },
      {
        name: `Warning${warns == 1 ? "" : "s"}`,
        value: warns.toString()
      }
    ]
  });

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

import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";

var coll = MongoClient.db("PreMiD").collection("betaAccess"),
  { general } = require("../channels.json"),
  { beta } = require("../../../roles.json");

module.exports.run = async (message: Discord.Message) => {
  message.delete();

  var betaUser = await coll.findOne({ userId: message.author.id });

  if (!betaUser || typeof betaUser.keysLeft === "undefined") {
    message
      .reply("You don't have any beta keys left.")
      .then((msg: Discord.Message) => msg.delete({ timeout: 10 * 1000 }));
    return;
  }

  if (message.mentions.users.size == 0 || message.mentions.users.first().bot) {
    message
      .reply("Please mention the user you want to gift beta access to.")
      .then((msg: Discord.Message) => msg.delete({ timeout: 10 * 1000 }));
    return;
  }

  if (await coll.findOne({ userId: message.mentions.users.first().id })) {
    message
      .reply("This user already has beta access.")
      .then((msg: Discord.Message) => msg.delete({ timeout: 10 * 1000 }));
    return;
  }

  (await message.guild.members.fetch(
    message.mentions.users.first().id
  )).roles.add(beta);
  (message.guild.channels.get(general) as Discord.TextChannel).send(
    `:tada: <@${
      message.mentions.users.first().id
    }> just received beta access to **PreMiD** from ${message.author.tag}!`
  );

  betaUser.keysLeft = betaUser.keysLeft--;

  if (betaUser.keysLeft <= 0) delete betaUser.keysLeft;

  coll.findOneAndReplace({ userId: message.author.id }, betaUser);
  coll.insertOne({ userId: message.mentions.users.first().id });
};

module.exports.config = {
  name: "betainvite",
  description: "Gift a user BETA access."
};

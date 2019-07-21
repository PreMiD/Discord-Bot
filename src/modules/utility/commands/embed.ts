import * as Discord from "discord.js";
import { extname } from "path";
import request from "request-promise-native";

var { prefix } = require("../../../config.json");

module.exports.run = async (
  message: Discord.Message,
  params: Array<string>
) => {
  if (
    message.attachments.size == 0 ||
    extname(message.attachments.first().name) !== ".json"
  ) {
    message.delete();
    message
      .reply("Please attach a file containing the embed in **JSON** format.")
      .then((msg: Discord.Message) => msg.delete({ timeout: 10 * 1000 }));
    return;
  }

  if (message.mentions.channels.size == 0) {
    message.delete();
    message
      .reply("Please tag a channel to send the embed to.")
      .then((msg: Discord.Message) => msg.delete({ timeout: 10 * 1000 }));
    return;
  }

  var embed = await request(message.attachments.first().url);
  message.delete();

  try {
    embed = JSON.parse(embed);
    message.mentions.channels.first().send({ embed: embed });
  } catch (err) {
    message
      .reply(`Error while sending embed: \`\`\`${err.message}\`\`\``)
      .then((msg: Discord.Message) => msg.delete({ timeout: 15 * 1000 }));
  }
};

module.exports.config = {
  name: "embed",
  permLevel: 3
};

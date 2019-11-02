import * as Discord from "discord.js";
import { client } from "../../..";

let { prefix } = require("../../../config.json");

module.exports.run = async (message: Discord.Message) => {
  message.delete();

  let userElevation = client.elevation(message.author.id),
    cmds = client.commands
      .map(cmd => [
        // @ts-ignore
        cmd.config.name,
        // @ts-ignore
        cmd.config.description,
        // @ts-ignore
        cmd.config.permLevel ? cmd.config.permLevel : 0
      ])
      .filter(cmd => userElevation >= cmd[2]);

  let embed = new Discord.MessageEmbed({
    title: "Help",
    description: cmds
      .map(cmd => {
        return `**${prefix}${cmd[0]}**\n\`\`${cmd[1]}\`\``;
      })
      .join("\n"),
    fields: [
      {
        name: "\u200b",
        value:
          "*These are the commands you can execute with your permission level.*"
      }
    ],
    color: "#7289DA"
  });

  message.channel
    .send(embed)
    .then((msg: Discord.Message) => msg.delete({ timeout: 30 * 1000 }));
};

module.exports.config = {
  name: "help",
  description: "Shows this menu."
};

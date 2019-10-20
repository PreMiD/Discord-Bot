import * as Discord from "discord.js";
import { client } from "../../..";

let messageFilter = require("../messageFilter.json"),
  { muted } = require("../../../roles.json"),
  { moderators } = require("../channels.json");

module.exports = async (message: Discord.Message) => {
  let filterResult = messageFilter.find(m =>
    message.content
      .toLowerCase()
      .match(new RegExp(m.message.toLowerCase(), "i"))
  );

  //* Allow own invites
  if (
    (await message.guild.fetchInvites())
      .map(invite => invite.url)
      .find(
        iURL => message.cleanContent.toLowerCase() === iURL.toLowerCase()
      ) ||
    message.cleanContent.toLowerCase() ===
      "https://discord.gg/PreMiD".toLowerCase()
  )
    return;

  //* Return if permission level > 0
  if (!filterResult || client.elevation(message) > 0) return;

  message.delete();

  if (filterResult.mute) {
    message.member.roles.add(muted);

    let embed = new Discord.MessageEmbed({
      author: {
        name: message.member.displayName,
        iconURL: message.author.displayAvatarURL({ size: 128 })
      },
      color: "#fc3c3c",
      timestamp: new Date(),
      fields: [
        {
          name: "Channel",
          value: `<#${message.channel.id}>`
        },
        {
          name: "Message",
          value: message.content
        }
      ]
    });

    if (message.guild.channels.has(moderators))
      (message.guild.channels.get(moderators) as Discord.TextChannel).send(
        "Please check this mute!",
        { embed: embed }
      );
  }

  message
    .reply(filterResult.botMessage)
    .then((msg: Discord.Message) => msg.delete({ timeout: 15 * 1000 }));
};

import * as Discord from "discord.js";

var messageFilter = require("../messageFilter.json"),
  { muted } = require("../../../roles.json"),
  { moderators } = require("../channels.json");

module.exports = async (message: Discord.Message, _params, permLevel) => {
  var filterResult = messageFilter.find(m =>
    message.content
      .toLowerCase()
      .match(new RegExp(m.message.toLowerCase(), "i"))
  );
  if (!filterResult || permLevel > 0) return;

  message.delete();
  
  if (filterResult.mute) {
    message.member.roles.add(muted);

    var embed = new Discord.MessageEmbed({
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

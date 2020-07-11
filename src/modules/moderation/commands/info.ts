import * as Discord from "discord.js";
import { client } from "../../..";
import { MessageEmbedOptions } from "discord.js";

module.exports.run = async (
  message: Discord.Message,
  params: Array<string>
) => {
  message.delete();

  if (params.length === 0) {
    (await message.reply("Please enter a name to search.")).delete({
      timeout: 5 * 1000,
    });
    return;
  }

  if (params[0].toLowerCase() === "list") {
    message.reply(
      new Discord.MessageEmbed({
        title: "Shortcut list",
        color: "RANDOM",
        description: client.infos.list
          .keyArray()
          .map((k) => {
            return "``" + k + "``";
          })
          .join(", "),
        footer: {
          text: message.author.tag,
          iconURL: message.author.avatarURL(),
        },
      })
    );
    return;
  }

  const searchParam = params.filter(
    (arg) => !Discord.MessageMentions.USERS_PATTERN.test(arg)
  );

  if (
    !(
      client.infos.list.has(searchParam[0].toLowerCase()) ||
      client.infoAliases.has(searchParam[0].toLowerCase()) ||
      client.infos.list.has(
        client.infoAliases.get(searchParam[0].toLowerCase())
      )
    )
  ) {
    (await message.reply("Please enter a valid name...")).delete({
      timeout: 5 * 1000,
    });
    return;
  }

  const info =
      client.infos.list.get(params[0].toLowerCase()) ||
      client.infos.list.get(client.infos.aliases.get(params[0].toLowerCase())),
    embed: MessageEmbedOptions = {
      title: info.title || "No Title",
      description: info.description || "No description.",
      color: info.color || "RANDOM",
      footer: {
        text: info.footer || `by ${message.author.tag}`,
        iconURL: message.author.avatarURL({}),
      },
    };

  message.channel.send("", { embed }).then((m) => {
    message.mentions.members.size
      ? m.edit(message.mentions.members.map((m) => m).join(", "), {
          embed,
        })
      : false;
  });
};

module.exports.config = {
  name: "info",
  description: "Short way to inform users about specific topics.",
  permLevel: 1,
};

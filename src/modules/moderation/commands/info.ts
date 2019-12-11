import * as Discord from "discord.js";

module.exports.run = async (message: Discord.Message, params: Array<string>) => {
  if (params.length < 1) {
    message.delete();

    message.channel
      .send("Please enter a name to search.")
      .then(msg => (msg as Discord.Message).delete({ timeout: 5 * 1000 }));
    return;
  } else if (!message.client.infos.get(params[0].toLowerCase()) || !message.client.infos.get(message.client.infoAliases.get(params[0].toLowerCase()))) {
    message.delete();

    message.channel
      .send("Please enter a valid name.")
      .then(msg => (msg as Discord.Message).delete({ timeout: 5 * 1000 }));
    return;
  } else if (message.client.infos.get(params[0].toLowerCase()) || message.client.infos.get(message.client.infoAliases.get(params[0].toLowerCase()))) {
    const info = message.client.infos.get(params[0].toLowerCase()) || message.client.infos.get(message.client.infoAliases.get(params[0].toLowerCase()));

    let embed = Discord.MessageEmbed({
      title: info.title || "No Title",
      description: info.description || "No description provided.",
      color: info.color || "36393F",
      footer: {
        text: info.footer || `by ${message.author.tag}`,
        iconURL: message.author.avatarURL({})
      }
    });

    message.channel.send({ embed });
  }
};

module.exports.config = {
  name: "info",
  description: "Shortcut to get things easier.",
  permLevel: 1
};

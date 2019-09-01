import * as Discord from "discord.js";

var embed: Discord.MessageEmbed, ping;

module.exports.run = async (message: Discord.Message) => {
  embed = new Discord.MessageEmbed({
    title: "Check this out!"
  });

  embed.setURL("https://wiki.premid.app/troubleshooting/troubleshooting");

  message.channel.send(embed).then(msg => msg.delete({ timeout: 10 * 1000 }));
  
  message.delete();
};

module.exports.config = {
  name: "troubleshoot",
  description: "Having problems, but no Ticket Managers online? Try this!"
};

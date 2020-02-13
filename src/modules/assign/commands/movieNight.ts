import * as Discord from "discord.js";

let embed: Discord.MessageEmbed;

module.exports.run = async (
  message: Discord.Message
) => {
  const role = message.guild.roles.get("677306264988155904");

  if (message.member && message.member.roles.has(role.id)) {
    message.react("❌");
    embed = new Discord.MessageEmbed({
      title: "Movie Night",
      description: `You already have the **${role.name}** role.`,
      color: "#ff5050"
    });

    message.channel.send(embed).then(msg => {
      message.delete({ timeout: 10 * 1000 });
      (msg as Discord.Message).delete({ timeout: 10 * 1000 });
    });
  } else {
    if (message.member) message.member.roles.add(role.id);
    message.react("✅");
    embed = new Discord.MessageEmbed({
      title: "Movie Night",
      description: `Assigned **${role.name}** role.`,
      color: "#50ff50"
    });

    message.channel.send(embed).then(msg => {
      message.delete({ timeout: 10 * 1000 });
      (msg as Discord.Message).delete({ timeout: 10 * 1000 });
    });
  }
};

module.exports.config = {
  name: "movieNight",
  description: "Gives you the 'Movie Night' role to access special channels."
};

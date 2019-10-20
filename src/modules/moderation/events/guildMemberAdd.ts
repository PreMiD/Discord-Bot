import * as Discord from "discord.js";

let { muted } = require("../../../roles.json"),
  { logs, moderators } = require("../channels.json");

module.exports = async (member: Discord.GuildMember) => {
  //* Naked bot check > 2 months (5184000000)
  if (
    (member.user.username.match(/\d$/) ||
      member.user.username.match(/[\\w.]+/)) &&
    member.user.createdTimestamp > Date.now() - 5184000000
  ) {
    let embed = new Discord.MessageEmbed()
      .setAuthor(`${member.displayName}`, member.user.displayAvatarURL())
      .addField("Account creation date", member.user.createdAt)
      .setColor("#fc3c3c")
      .setFooter("POSSIBLE NAKED BOT")
      .setTimestamp();

    if (member.user.defaultAvatarURL === member.user.displayAvatarURL()) {
      embed.addField("Action", "User Kicked");
      member.user.send(
        "Oops, your account looks a bit robotic _beep boop_, use a nice avatar and username to make it less robotic to gain entrance to our server."
      );
      if (member.guild.channels.has(logs))
        (member.guild.channels.get(logs) as Discord.TextChannel)
          .send(embed)
          .then(function() {
            member.kick("Possible naked bot");
          });
    } else {
      member.roles.add(muted, "Possible naked bot");
      embed.addField("Action", "User muted");
      member.user.send(
        "Oops, your account looks a bit robotic _beep boop_, contact one of our mods to gain write access our channels."
      );
      if (member.guild.channels.has(moderators))
        (member.guild.channels.get(moderators) as Discord.TextChannel).send(
          embed
        );
    }
  }
};

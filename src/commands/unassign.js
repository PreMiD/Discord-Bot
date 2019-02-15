
exports.run = async (client, message, params) => {
  await message.delete()
  if(params.length == 1) {
    switch(params[0].toLowerCase()) {
      case "updates":
        var role = message.guild.roles.find(role => role.name.toLowerCase() == "updates")
        if(message.member.roles.has(role.id)) {
          await message.member.removeRole(role.id)
          message.reply("You no longer receive the latest updates!")
          .then((msg) => setTimeout(() => msg.delete(), 10*1000));
        } else
          message.reply("You don't receive the latest updates!")
          .then((msg) => setTimeout(() => msg.delete(), 5*1000));
        break;
      case "nsfw":
        var role = message.guild.roles.find(role => role.name.toLowerCase() == "nsfw")
        if(message.member.roles.has(role.id)) {
          await message.member.removeRole(role.id)
          message.reply("You can now no longer see **NSFW** channels!")
          .then((msg) => setTimeout(() => msg.delete(), 10*1000))
        }
        else
          message.reply("You don't have access to **NSFW** channels!")
          .then((msg) => setTimeout(() => msg.delete(), 5*1000));
        break;
        default:
        message.reply("You can unassign these roles: **Updates**, **NSFW**")
        .then((msg) => setTimeout(() => msg.delete(), 10*1000))
        break;
      }
    } else {
      message.reply("You can unassign these roles: **Updates**, **NSFW**")
      .then((msg) => setTimeout(() => msg.delete(), 10*1000))
    }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: 'unassign',
  description: 'Remove a role from yourself.',
  usage: 'unassign <role>'
};
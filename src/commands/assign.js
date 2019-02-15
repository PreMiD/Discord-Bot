
exports.run = async (client, message, params) => {
  await message.delete()
  if(params.length == 1) {
    switch(params[0].toLowerCase()) {
      case "updates":
        var role = message.guild.roles.find(role => role.name == "Updates")
        if(message.member.roles.has(role.id))
          message.reply("You already receive the latest updates!")
          .then((msg) => setTimeout(() => msg.delete(), 5*1000)); 
        else {
          await message.member.addRole(role.id)
          message.reply("You will now receive the latest updates!")
          .then((msg) => setTimeout(() => msg.delete(), 10*1000))
        }
        break;
      case "nsfw":
        var role = message.guild.roles.find(role => role.name == "NSFW")
        if(message.member.roles.has(role.id))
          message.reply("You already access to **NSFW** channels!")
          .then((msg) => setTimeout(() => msg.delete(), 5*1000)); 
        else {
          await message.member.addRole(role.id)
          message.reply("You can now see **NSFW** channels!")
          .then((msg) => setTimeout(() => msg.delete(), 10*1000))
        }
        break;
      case "gimmesatania":
        var role = message.guild.roles.find(role => role.name == "❤ Satania ❤")
        if(message.member.roles.get(role.id))
          message.reply("You already access to this **demonic** channel!")
          .then((msg) => setTimeout(() => msg.delete(), 5*1000)); 
        else {
          await message.member.addRole(role.id)
          message.reply("You can now see this **demonic** channel!")
          .then((msg) => setTimeout(() => msg.delete(), 10*1000))
        }
        break;
        default:
        message.reply("You can assign these roles: **Updates**, **NSFW**")
        .then((msg) => setTimeout(() => msg.delete(), 10*1000))
        break;
      }
    } else {
      message.reply("You can assign these roles: **Updates**, **NSFW**")
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
  name: 'assign',
  description: 'Assign a role to yourself.',
  usage: 'assign <role>'
};
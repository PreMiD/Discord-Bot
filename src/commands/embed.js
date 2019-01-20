var request = require('request-promise-native'),
  Discord = require('discord.js')

exports.run = async (client, message, params) => {
  message.delete()
  
  if(params.length < 1 || params.length > 2) {
    message.reply("Usage: ``p!embed <channel> <url>`` or ``p!embed <url>``")
    .then(msg => setTimeout(() => msg.delete(), 10*1000))
    return
  }

  var channel = message.guild.channels.find(channel => channel.name == params[0])
  if(!channel && message.mentions.channels.size > 0) channel = message.mentions.channels.first()
  if(!channel) channel = message.channel
  
  try {
    if(params.length == 1) {
      var embedJSON = JSON.parse(await request(params[0]))
    } else {
      var embedJSON = JSON.parse(await request(params[1]))
    }
  } catch(err) {
    message.reply(`Whoopsie!\nERROR: **${err.message}**`)
    .then(msg => setTimeout(() => msg.delete(), 10*1000))
    return
  }

  channel.send(new Discord.RichEmbed(embedJSON))
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 3
};

exports.help = {
  name: 'embed',
  description: 'Send fancy embeds',
  usage: 'ping'
};
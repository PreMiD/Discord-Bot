var Discord = require('discord.js')

var {prefix} = require('../config.json')
var {query} = require('../database/functions')

exports.run = async (client, message, params) => {
  message.delete()

  var married = await query("SELECT husband, wife FROM marriages WHERE husband = ? OR wife = ?", [message.author.id, message.author.id])
  if(married.rows.length == 0) {
    message.reply("You aren't married! :angry:")
    .then(msg => setTimeout(() => msg.delete(), 10*1000))
  } else {
    married = married.rows
    if(married.husband == message.author.id) {
      message.channel.send(`<@${married.wife}>, I am sorry but <@${married.husband}> divorced with you... :heart_broken:`)
      .then(msg => setTimeout(() => msg.delete(), 15*1000))
      await query("DELETE FROM marriages WHERE husband = ?", message.author.id)
    } else {
      message.channel.send(`<@${married.husband}>, I am sorry but <@${married.wife}> divorced with you... :heart_broken:`)
      .then(msg => setTimeout(() => msg.delete(), 15*1000))
      await query("DELETE FROM marriages WHERE wife = ?", message.author.id)
    }
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: 'divorce',
  description: 'divorce with someone',
  usage: 'divorce'
};
var Discord = require('discord.js')
var {prefix} = require('../config.json')
var {query} = require('../database/functions')

exports.run = async (client, message, params) => {
  await message.delete()
  if(params.length < 1) {
    var warns = (await query('SELECT * FROM warns WHERE user_id = ?', message.author.id)).rows
    if(warns == 0) {
      message.reply("You don't have any warnings, good boi <:PUDDING:520986516613234711>")
      .then(msg => setTimeout(() => msg.delete(), 10*1000))
    } else {
      var embed = new Discord.RichEmbed()
      .setAuthor(`${message.member.displayName}'s warns`)
      .setColor("#FF6400")
      .setTimestamp(new Date())
      
      warns.forEach(warn => {
        embed.addField(message.guild.members.get(warn.moderator_id).displayName, warn.reason)
      });
      
      await message.author.send({embed: embed})
      message.reply("I DM'ed you your warnings!")
      .then(msg => setTimeout(() => msg.delete(), 10*1000))
    }
  } else {
    if(client.elevation(message) > 0) {
      var user = message.mentions.users.first()
      if(!user) user = await message.guild.members.find(m => m.displayName == params.slice(0, params.length).join(" "))
      if(user) {
        var warns = (await query('SELECT * FROM warns WHERE user_id = ?', user.id)).rows
        if(warns == 0) {
          message.reply(`${message.guild.members.get(user.id).displayName} has no warnings.`)
          .then(msg => setTimeout(() => msg.delete(), 10*1000))
        } else {
          var embed = new Discord.RichEmbed()
          .setAuthor(`${message.guild.members.get(user.id).displayName}'s warns`)
          .setColor("#FF6400")
          .setTimestamp(new Date())
          
          warns.forEach(warn => {
            embed.addField(message.guild.members.get(warn.moderator_id).displayName, warn.reason)
          });
          
          await message.reply({embed: embed})
        }
      }
    } else {
      message.reply("Only Moderators can view other people's warnings!")
      .then(msg => setTimeout(() => msg.delete(), 10*1000))
    }
  }
}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["strikes"],
  permLevel: 0
};

exports.help = {
  name: 'warns',
  description: 'Shows all your warnings',
  usage: 'warns <user>'
};
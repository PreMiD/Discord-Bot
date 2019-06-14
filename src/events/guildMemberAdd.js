var Discord = require('discord.js');
var config = require('../config.json');

module.exports = async member => {
  //* Auto add @Updates role
  member.addRole('527676244494516225', "Joined Guild")
  //naked bots check 2 months = 5184000000 
  if((member.user.username.match(/\d$/) || member.user.username.match(/[\\w.]+/)) && member.user.createdTimestamp > (new Date() - 5184000000)){
    var embed = new Discord.RichEmbed()
			.setAuthor(`${member.displayName}`, member.user.displayAvatarURL)
			.addField('Account creation date', member.user.createdAt)
			.setColor('#fc3c3c')
			.setFooter('POSSIBLE NAKED BOT')
      .setTimestamp();
    if(member.user.defaultAvatarURL === member.user.displayAvatarURL){
      embed.addField('Action', "User Kicked");
      member.user.send("Oops, you look a bit robotic _beep boop_ in your account, use a nice avatar and username less robotic so that we can allow your entrance in our server.");
      if (member.guild.channels.has(config.logs)) member.guild.channels.get(config.logs).send(embed).then(function(){
        member.kick("Possible naked bot");
      });
    }else{
      member.addRole(config.mutedRole, "Possible naked bot");
      embed.addField('Action', "User muted")
      member.user.send("Oops, you look a bit robotic beep boop in your account, contact one of our mods to you have access our channels.");
      if (member.guild.channels.has(config.logs)) member.guild.channels.get(config.logs).send(embed);
    }

  }
}
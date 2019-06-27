var Discord = require('discord.js');
var config = require('../config.json');

exports.run = async (client, message, params) => {
	await message.delete();
    var user = message.mentions.members.first();
    var reason = "Breaking rules";
    if(params.length > 1) reason = params.slice(1, params.length).join(" ");
    // some checks
    if(params < 1 || !user){
        message
			.reply(`Usage: \`\`${config.prefix}mute <user> <reason> (optional)\`\``)
            .then((msg) => setTimeout(() => msg.delete(), 10 * 1000));
            return;
    }
    if (user.roles.has(config.mutedRole)) {
        message.reply("This user is already muted <:thenking:587780453864308766>")
        .then((msg) => setTimeout(() => msg.delete(), 10 * 1000));
        return;
    }
    
    if (!user.user.bot) {
        if (user.id != message.author.id) {
            user.addRole(config.mutedRole);

            var embed = new Discord.RichEmbed()
                .setColor('#FF6400')
                .setTimestamp(new Date())
                .setAuthor('Muted')
                .addField('Moderator', `<@${message.author.id}>`, true)
                .addField('Reason', `\`\`${reason}\`\``, true);
            message.channel.send(`<@${user.id}> you have been muted by **${message.member.displayName}**!`, {
                embed: embed
            });
        } else {
            message
                .reply("Why would you mute yourself? <:tom_face:559852826927562752>")
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000));
        }
    } else {
        message
            .reply("You can't mute bots, you dummy <:PUDDING:520986516613234711>")
            .then((msg) => setTimeout(() => msg.delete(), 10 * 1000));
    }
};

exports.conf = {
	enabled: true,
	aliases: [],
	permLevel: 1
};

exports.help = {
	name: 'mute',
	description: 'Mute users',
	usage: 'mute <user> <reason> (optional)'
};

const { query } = require('../database/functions')
const starboardChannel = 'pls insert channel id here'

function starboardAdd(reaction) {
	if (!reaction) return;

	if (reaction.emoji.name == starEmojis.standard) {
		const starEmojis = {
			standard: '⭐',
			star2: '🌟',
			stars: '🌠',
			dizzy: '💫'
		};
		var starType;
		var messageQuery = (await query('SELECT * FROM starboard WHERE messageId = ?', reaction.message.id))
		const embed = new Discord.RichEmbed()
			.setColor(0xb2b200)
			.setAuthor(reaction.message.author.user.tag, reaction.message.author.user.avatarURL)
			.setDescription(reaction.message.content)
			.addField('Jump to message', `[Click here](https://discordapp.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id})`);

		if (reaction.count < 5)
			starType = starEmojis.standard;
		else if (reaction.count >= 5 && reaction.count < 10)
			starType = starEmojis.star2;
		else if (reaction.count >= 10 && reaction.count < 15)
			starType = starEmojis.stars;
		else if (reaction.count > 15)
			starType = starEmojis.dizzy;
		
		if (!messageQuery)
			reaction.message.guild.channels.get(starboardChannel)
                .send(`${starType} **${reaction.count}** - ${reaction.message.channel.toString()}`, embed)
                    .then(() => await query('INSERT INTO starboard (messageId) VALUES (?)', reaction.message.id));
        else
			reaction.message.guild.channels.get(starboardChannel)
				.fetchMessage(messageQuery.rows[0].messageId)
					.then(message => message.edit(`${starType} **${reaction.count}** - ${reaction.message.channel.toString()}`, embed));
	}
}
function starboardRemove(msg) {
	var q = await query('SELECT * FROM starboard WHERE messageId = ?', msg.id);
	if (!q) return;
    msg.guild.channels.get(starboardChannel)
        .fetchMessage(q.rows[0].messageId)
			.then(m => { 
				await m.delete();
				await query('DELETE FROM starboard WHERE messageId = ?', msg.id);
			});
}
module.exports.starAdd = starboardAdd
module.exports.starRemove = starboardRemove
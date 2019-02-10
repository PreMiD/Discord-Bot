exports.run = async (client, message) => {
  message.delete()
  message.channel.send('@Timeraa#7947 GIVE ME V2 NOW')
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: 'givev2',
  description: 'I WANT V2',
  usage: 'givev2'
};
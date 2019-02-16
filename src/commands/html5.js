exports.run = async (client, message) => {
	message.delete();
	message.channel.send(
		'https://cdn.discordapp.com/attachments/340245049939984385/546119946447618048/htmlcertificat.jpg'
	);
};

exports.conf = {
	enabled: true,
	guildOnly: false,
	aliases: [ certificate ],
	permLevel: 0
};

exports.help = {
	name: 'html5',
	description: 'Signed by MulverineX',
	usage: 'html5'
};

var assignRoles = require('../assignRoles.json');

exports.run = async (client, message, params) => {
	if (params.length < 1 || !assignRoles.find((r) => r.name.toLowerCase() == params.join(' ').toLowerCase())) {
		message.delete();
		message
			.reply(
				`These roles are unassignable: ${assignRoles
					.map((r) => {
						return `**${r.name}**`;
					})
					.join(', ')}`
			)
			.then((msg) => setTimeout(() => msg.delete(), 15 * 1000));
		return;
	}

	var assignRole = message.guild.roles.find((r) => r.name.toLowerCase() == params.join(' ').toLowerCase());
	if (!message.member.roles.has(assignRole.id)) {
		message.react('❌').then(() => setTimeout(() => message.delete(), 15 * 1000));
		message.reply("You don't have this role.").then((msg) => setTimeout(() => msg.delete(), 15 * 1000));
	} else {
		message.react('✅').then(() => setTimeout(() => message.delete(), 15 * 1000));
		message.member.removeRole(assignRole);
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
	description: 'Unassign specific roles.',
	usage: 'unassign <role>'
};

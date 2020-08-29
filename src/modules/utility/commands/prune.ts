import * as Discord from "discord.js";

module.exports.run = async (
	message: Discord.Message,
	params: Array<string>
) => {
	await message.delete();
	//@ts-ignore False types...
	message.channel.bulkDelete(parseInt(params[0]));
};

module.exports.config = {
	permLevel: 1,
	name: "prune",
	description: "Prunes messages"
};

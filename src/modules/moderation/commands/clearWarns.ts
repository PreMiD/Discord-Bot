import * as Discord from "discord.js";
import { MongoClient } from "../../../database/client";
import config from "../../../config";

module.exports.run = async (
	message: Discord.Message,
	params: Array<string>
) => {
	message.delete();

	let embed = new Discord.MessageEmbed({
		title: "Clear Warnings",
		description: `*You can clear a user's warnings by typing
    \`\`${config.prefix}cwarns <user>\`\`*`,
		color: "#FF7000"
	});

	if (params.length < 1 && message.mentions.users.size == 0) {
		message.channel
			.send(embed)
			.then(msg => (msg as Discord.Message).delete({ timeout: 10 * 1000 }));
		return;
	}

	let coll = MongoClient.db("PreMiD").collection("warns"),
		user = await coll.findOneAndDelete({
			userId: message.mentions.users.first().id
		});

	if (user.value) {
		embed.setDescription(
			`Successfully cleared <@${user.value.userId}>'s warnings.`
		);

		message.channel
			.send(embed)
			.then(msg => (msg as Discord.Message).delete({ timeout: 10 * 1000 }));
	} else {
		embed.setDescription(
			`<@${message.mentions.users.first().id}>'s doesn't have any warnings.`
		);

		message.channel
			.send(embed)
			.then(msg => (msg as Discord.Message).delete({ timeout: 10 * 1000 }));
	}
};

module.exports.config = {
	name: "cwarns",
	description: "Clear warnings of a user.",
	permLevel: 3
};

import * as Discord from "discord.js";
import config from "../../../config";
import { pmdDB } from "../../../database/client";

module.exports.run = async (
	message: Discord.Message,
	params: Array<string>
) => {
	message.delete();

	if (params.length === 0) {
		(
			await message.channel.send(
				new Discord.MessageEmbed({
					title: "📝 Blacklist",
					fields: [
						{
							name: "Usage",
							value: `\`${config.prefix}blacklist add/remove/list\``
						}
					]
				})
			)
		).delete({ timeout: 15 * 1000 });
		return;
	}

	if (params[0].toLowerCase() === "list") {
		(
			await message.channel.send(
				new Discord.MessageEmbed({
					title: "📝 Blacklist",
					fields: [
						{
							name: "Blacklisted words:",
							value:
								"`" +
								(
									await pmdDB
										.collection("blacklist")
										.find({}, { projection: { _id: false, word: true } })
										.sort({ word: 1 })
										.toArray()
								)
									.map(l => l.word)
									.join("`\n`") +
								"`"
						}
					]
				})
			)
		).delete({ timeout: 15 * 1000 });
	}

	if (params[0].toLowerCase() === "add" && params[1]) {
		if (
			await pmdDB
				.collection("blacklist")
				.findOne({ word: params.slice(1).join(" ").toLowerCase() })
		) {
			(await message.reply("Word is already blacklisted.")).delete({
				timeout: 15 * 1000
			});
			return;
		}

		await pmdDB.collection("blacklist").insertOne({
			word: params.slice(1).join(" ").toLowerCase(),
			userId: message.author.id,
			added: Date.now()
		});
		(await message.reply(`Added ${params.slice(1).join(" ")} to the blacklist`)).delete({ timeout: 15 * 1000 });
		return;
	}

	if (params[0].toLowerCase() === "remove" && params[1]) {
		if (
			!(await pmdDB
				.collection("blacklist")
				.findOne({ word: params.slice(1).join(" ").toLowerCase() }))
		) {
			(await message.reply("Word is not on the blacklist.")).delete({
				timeout: 15 * 1000
			});
			return;
		}

		await pmdDB
			.collection("blacklist")
			.findOneAndDelete({ word: params.slice(1).join(" ").toLowerCase() });
		(
			await message.reply(
				`Removed ${params.slice(1).join(" ")} from the blacklist`
			)
		).delete({ timeout: 15 * 1000 });
		return;
	}
};

module.exports.config = {
	name: "blacklist",
	description: "Blacklist words.",
	permLevel: 3
};

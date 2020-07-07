import * as Discord from "discord.js";
import { pmdDB } from "../../../database/client";

module.exports.run = async (message: Discord.Message, args: Array<string>) => {
	await message.delete();
	if (args.length < 1) {
		return await message
			.reply("Please provide a search query!")
			.then((msg: Discord.Message) => msg.delete({ timeout: 10 * 1000 }));
	}

	const m = await message.reply(
		null,
		new Discord.MessageEmbed({
			title: "Presence Search Query",
			description: "<a:loading:521018476480167937> Searching..."
		})
	);

	const mention = message.member.toString() + ", ";

	const sadCatTimeout = setTimeout(async () => {
		await m.edit(
			mention,
			new Discord.MessageEmbed({
				title: "Presence Search Query",
				description:
					"<a:loading:521018476480167937> Searching...\n\n<:sad_cat:587782591847989288> Looks like you drew the short straw! We are still indexing the database, so your query will take a while."
			})
		);
	}, 10000);

	const query = args.join(" ");
	const presencesColl = pmdDB.collection("presences");
	const results = await presencesColl
		.find(
			{ $or: [
				{
					name: { $regex: query, '$options': 'i' }
				},
				{
					"metadata.service": { $regex: query, '$options': 'i' }
				},
				{
					"metadata.url": { $regex: query, '$options': 'i' }
				},
				{
					"metadata.tags": { $regex: query, '$options': 'i' }
				}
			]
		})
		.limit(5)
		.toArray();
	clearTimeout(sadCatTimeout);

	if (results.length < 1) {
		return await m
			.edit(mention + "No presences found!", { embed: null })
			.then((msg: Discord.Message) => msg.delete({ timeout: 10 * 1000 }));
	}

	let descriptionFunsies = "";
	for (const result of results) {
		descriptionFunsies += `**[${
			result.name
		}](https://premid.app/store/presences/${encodeURIComponent(
			result.name
		)} "Click here to go to the store page for ${result.name}!")** by [${
			result.metadata.author.name
		}](https://premid.app/users/${
			result.metadata.author.id
		} "Click here to go to the profile page for ${
			result.metadata.author.name
		}!")`;
		descriptionFunsies += "\n_";
		let description = result.metadata.description.en;
		if (description.length > 100)
			description = description.substr(0, 100) + "...";
		descriptionFunsies += description;
		descriptionFunsies += "_\n\n";
	}

	return await m.edit(
		mention,
		new Discord.MessageEmbed({
			title: "Presence Search Results for '" + query + "'",
			description: descriptionFunsies,
			color: results[0].metadata.color
		})
	);
};

module.exports.config = {
	name: "search",
	description: "Search for a presence."
};

import { AutocompleteInteraction, CommandInteraction, MessageButton, MessageEmbed, WebhookEditMessageOptions } from "discord.js";

import { client, pmdDB, presencesStrings } from "../../..";
import { ClientCommand } from "../../../../@types/djs-extender";
import { Presences } from "../../../../@types/interfaces";

export default async function (int: CommandInteraction | AutocompleteInteraction) {
	if (int.isAutocomplete()) {
		const query = int.options.getString("query") || "",
			results = presencesStrings.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 25);

		return int.respond(results.map(s => ({ name: s, value: s })));
	}

	const presence = int.options.getString("query");
	if (!presencesStrings.find(s => s === presence))
		return await int.reply({
			content: "That is not a valid presence.",
			ephemeral: true
		});

	await int.deferReply();

	const dbPresence = await pmdDB.collection<Presences>("presences").findOne(
		{ name: presence },
		{
			projection: {
				_id: false,
				metadata: {
					service: true,
					author: { id: true },
					contributors: { id: true },
					url: true,
					description: {
						en: true
					},
					logo: true,
					color: true
				}
			}
		}
	);

	if (!dbPresence) return;

	let contributorsField: any = {};
	if (dbPresence.metadata.contributors?.length)
		contributorsField = {
			name: "Contributors",
			value: (await Promise.all(dbPresence.metadata.contributors.map(async c => (await client.users.fetch(c.id)).toString()))).join(", ")
		};

	const author = await client.users.fetch(dbPresence.metadata.author.id),
		embed = new MessageEmbed({
			title: dbPresence.metadata.service,
			url: "https://" + (Array.isArray(dbPresence.metadata.url) ? dbPresence.metadata.url[0] : dbPresence.metadata.url),
			description: dbPresence.metadata.description.en,
			thumbnail: {
				url: dbPresence.metadata.logo
			},
			author: {
				name: author.username + "#" + author.discriminator,
				icon_url: author.displayAvatarURL()
			},
			fields: dbPresence.metadata.contributors?.length ? [contributorsField] : []
		});

	embed.setColor(dbPresence.metadata.color as any);

	const response: WebhookEditMessageOptions = {
		embeds: [embed],
		components: [
			{
				type: "ACTION_ROW",
				components: [
					new MessageButton({
						label: "Open in Store",
						url: `https://premid.app/store/presences/${dbPresence.metadata.service}`,
						style: "LINK"
					})
				]
			}
		]
	};

	await int.editReply(response);
}

export const config: ClientCommand = {
	command: {
		name: "presence",
		description: "Search for a presence",
		options: [
			{
				name: "query",
				description: "The presence to search for",
				type: "STRING",
				autocomplete: true,
				required: true
			}
		]
	}
};

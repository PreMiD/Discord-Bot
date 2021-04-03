import { client } from "../../..";
import { InteractionResponse } from "../../../../@types/djs-extender";
import UniformEmbed from "../../../util/UniformEmbed";

module.exports.run = async (data: InteractionResponse, perms: number) => {
	if (data.data.options[0].name === "list") {
		const embed = new UniformEmbed(
			{
				description: client.infos
					.keyArray()
					.map(
						k =>
							`**${client.infos.get(k).title}**\n\`${k}\`, \`${client.infos
								.get(k)
								.aliases.join("`, `")}\``
					)
					.join("\n\n")
			},
			":bookmark: Info • List"
		);
		data.channel.send(`${data.member.toString()}`, embed);
		return;
	}

	let shortcutArg = data.data.options[0].options[0];
	shortcutArg.value = shortcutArg.value as string;

	if (
		!(
			client.infos.has(shortcutArg.value.toLowerCase()) ||
			client.infoAliases.has(shortcutArg.value.toLowerCase()) ||
			client.infos.has(client.infoAliases.get(shortcutArg.value.toLowerCase()))
		)
	) {
		(
			await data.channel.send(
				data.member.toString(),
				new UniformEmbed(
					{ description: "Please enter a valid shortcut." },
					":bookmark: Info • Error",
					"#ff5050"
				)
			)
		).delete({
			timeout: 10 * 1000
		});
		return;
	}

	const info =
			client.infos.get(shortcutArg.value.toLowerCase()) ||
			client.infos.get(client.infoAliases.get(shortcutArg.value.toLowerCase())),
		embed = new UniformEmbed(
			{
				description: info.description || "No description provided.",
				image: { url: info.image }
			},
			`:bookmark: Info • ${info.title || "No Title"}`,
			info.color
		);

	data.channel.send(embed);
};

module.exports.config = {
	name: "info",
	discordCommand: true
};

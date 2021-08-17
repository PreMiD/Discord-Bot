import { CommandInteraction, GuildMember } from "discord.js";
import { nanoid } from "nanoid";

import { removeAllTranslatorRoles } from "../";
import { pmdDB } from "../../../database/client";
import UniformEmbed from "../../../util/UniformEmbed";

const coll = pmdDB.collection("crowdin");
module.exports.run = async (interaction: CommandInteraction) => {
	const user = await coll.findOne({ userId: interaction.user.id });

	if (interaction.options.data[0].name === "link") {
		if (!user)
			try {
				const code = nanoid(5);

				await interaction.user.send(
					`Use this link to link your **Crowdin** account to your **Discord** account: ${encodeURI(
						`https://accounts.crowdin.com/oauth/authorize?client_id=mBK6QkfUXegOexHpp8hz&redirect_uri=http${
							process.env.NODE_ENV === "dev"
								? "s://api.premid.app"
								: "://localhost:3001"
						}/crowdin&response_type=code&scope=vendor&state=${code}`
					)}`
				);

				try {
					await coll.insertOne({ userId: interaction.user.id, code });
				} catch (err) {
					let msgReply = await interaction.channel.send({
						content: interaction.user.toString(),
						embeds: [
							new UniformEmbed(
								{ description: "An unknown error occurred." },
								":globe_with_meridians: Crowdin",
								"#ff5050"
							)
						]
					});

					setTimeout(() => msgReply.delete(), 15 * 1000);
				}
			} catch (err) {
				let msgReply = await interaction.channel.send({
					content: interaction.user.toString(),
					embeds: [
						new UniformEmbed(
							{
								description:
									"You cannot link your Crowdin account if your dm's are closed. Please open your dm's and try again."
							},
							":globe_with_meridians: Crowdin",
							"#ff5050"
						)
					]
				});
				setTimeout(() => msgReply.delete(), 15 * 1000);
			}
		else {
			let msgReply = await interaction.channel.send({
				content: interaction.user.toString(),
				embeds: [
					new UniformEmbed(
						{
							description:
								"You already linked your Crowdin account. Use `/crowdin unlink` to unlink it."
						},
						":globe_with_meridians: Crowdin",
						"#ff5050"
					)
				]
			});
			setTimeout(() => msgReply.delete(), 15 * 1000);
		}
	} else if (interaction.options.data[0].name === "unlink") {
		if (!user) {
			let msgReply = await interaction.channel.send({
				content: interaction.user.toString(),
				embeds: [
					new UniformEmbed(
						{
							description:
								"You do not have your Crowdin account linked to your Discord account. Use `/crowdin link` to link it."
						},
						":globe_with_meridians: Crowdin",
						"#ff5050"
					)
				]
			});

			return setTimeout(() => msgReply.delete(), 15 * 1000);
		}

		await removeAllTranslatorRoles(interaction.member as GuildMember);
		await coll.findOneAndDelete({ userId: interaction.user.id });

		let msgReply = await interaction.channel.send({
			content: interaction.user.toString(),
			embeds: [
				new UniformEmbed(
					{
						description: "Successfully unlinked your Crowdin account."
					},
					":globe_with_meridians: Crowdin",
					"#50ff50"
				)
			]
		});

		setTimeout(() => msgReply.delete(), 15 * 1000);
	}
};

module.exports.config = {
	name: "crowdin",
	discordCommand: true
};

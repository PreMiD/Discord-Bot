import { nanoid } from "nanoid";

import { removeAllTranslatorRoles } from "../";
import { InteractionResponse } from "../../../../@types/djs-extender";
import { pmdDB } from "../../../database/client";
import UniformEmbed from "../../../util/UniformEmbed";

const coll = pmdDB.collection("crowdin");
module.exports.run = async (data: InteractionResponse, perms: number) => {
	const user = await coll.findOne({ userId: data.member.id });

	if (data.data.options[0].name === "link")
		if (!user)
			try {
				const code = nanoid(5);

				await data.member.send(
					`Use this link to link your **Crowdin** account to your **Discord** account: ${encodeURI(
						`https://accounts.crowdin.com/oauth/authorize?client_id=mBK6QkfUXegOexHpp8hz&redirect_uri=http${
							process.env.NODE_ENV === "production"
								? "s://api.premid.app"
								: "://localhost:3001"
						}/crowdin&response_type=code&scope=vendor&state=${code}`
					)}`
				);

				try {
					await coll.insertOne({ userId: data.member.id, code });
				} catch (err) {
					(
						await data.channel.send(
							data.member.toString(),
							new UniformEmbed(
								{ description: "An unknown error occurred." },
								":globe_with_meridians: Crowdin",
								"#ff5050"
							)
						)
					).delete({ timeout: 10 * 1000 });
				}
			} catch (err) {
				(
					await data.channel.send(
						data.member.toString(),
						new UniformEmbed(
							{
								description:
									"You cannot link your Crowdin account if your dm's are closed. Please open your dm's and try again."
							},
							":globe_with_meridians: Crowdin",
							"#ff5050"
						)
					)
				).delete({ timeout: 15 * 1000 });
			}
		else
			(
				await data.channel.send(
					data.member.toString(),
					new UniformEmbed(
						{
							description:
								"You already linked your Crowdin account. Use `/crowdin unlink` to unlink it."
						},
						":globe_with_meridians: Crowdin",
						"#ff5050"
					)
				)
			).delete({ timeout: 15 * 1000 });
	else {
		if (!user)
			return (
				await data.channel.send(
					data.member.toString(),
					new UniformEmbed(
						{
							description:
								"You do not have your Crowdin account linked to your Discord account. Use `/crowdin link` to link it."
						},
						":globe_with_meridians: Crowdin",
						"#ff5050"
					)
				)
			).delete({ timeout: 15 * 1000 });

		await removeAllTranslatorRoles(data.member);
		await coll.findOneAndDelete({ userId: data.member.id });

		(
			await data.channel.send(
				data.member.toString(),
				new UniformEmbed(
					{
						description: "Successfully unlinked your Crowdin account."
					},
					":globe_with_meridians: Crowdin",
					"#50ff50"
				)
			)
		).delete({ timeout: 15 * 1000 });
	}
};

module.exports.config = {
	name: "crowdin",
	discordCommand: true
};

import { MessageEmbed } from "discord.js";

import { InteractionResponse } from "../../../../@types/djs-extender";
import { pmdDB } from "../../../database/client";
import UniformEmbed from "../../../util/UniformEmbed";
import creditRoles from "../../credits/creditRoles";
import toggleTicketVisibility from "../functions/toggleTicketVisibility";

const coll = pmdDB.collection("userSettings");

module.exports.run = async (res: InteractionResponse, perms: number) => {
	const args = res.data.options;

	//* Check if user even has available settings
	if (
		!Object.keys(creditRoles).find(r =>
			res.member.roles.cache.has(creditRoles[r])
		) ||
		perms == 0
	)
		return (
			await res.channel.send(
				`${res.member.toString()}, there are no available settings to change for you at this time.`
			)
		).delete({ timeout: 10 * 1000 });

	let userSettings = (await coll.findOne(
		{ userId: res.member.id },
		{ projection: { _id: false } }
	)) || { userId: res.member.id, showAllTickets: false, showContributor: true };

	if (perms < 1) delete userSettings["showAllTickets"];

	if (!args) return sendPreferencesMessage(res, userSettings);

	const oldSettings = JSON.parse(JSON.stringify(userSettings));
	for (let arg of args) {
		if (arg.name === "showalltickets") userSettings.showAllTickets = arg.value;
		if (arg.name === "showcontributor")
			userSettings.showContributor = arg.value;
	}
	await coll.findOneAndUpdate(
		{ userId: res.member.id },
		{ $set: userSettings }
	);
	sendPreferencesMessage(res, userSettings);

	if (userSettings.showAllTickets !== oldSettings.showAllTickets)
		await toggleTicketVisibility(res.member, userSettings.showAllTickets);
};

async function sendPreferencesMessage(
	res: InteractionResponse,
	userSettings: any
) {
	delete userSettings.userId;

	return (
		await res.channel.send(
			`${res.member.toString()}`,
			new UniformEmbed({
				author: {
					icon_url: res.member.user.displayAvatarURL(),
					name: `${res.member.user.username}'${
						res.member.user.username.endsWith("s") ? "" : "s"
					} Settings`
				},
				description: Object.keys(userSettings)
					.map(s => `**${s}**: \`${userSettings[s]}\``)
					.join("\n")
			})
		)
	).delete({ timeout: 15 * 1000 });
}

module.exports.config = {
	name: "preferences",
	discordCommand: true
};

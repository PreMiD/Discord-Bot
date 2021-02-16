import { GuildMember, TextChannel } from "discord.js";

import { client } from "../";
import { InteractionResponse } from "../../@types/djs-extender.d";
import { sendFancyMessage } from "./message";

module.exports = async ev => {
	if (ev.t !== "INTERACTION_CREATE") return;
	//TODO Resolve channels,roles,users

	const cmd = client.commands.find(
			c => c.config.name === ev.d.data.name && c.config.discordCommand
		),
		perms = client.elevation(ev.d.member.user.id);

	if (!cmd) return;
	if (
		typeof cmd.config.permLevel != "undefined" &&
		perms < cmd.config.permLevel
	)
		//* Send Embed if user does not have permissions to run the command
		return sendFancyMessage(
			{
				channel: client.guilds
					.resolve(ev.d.guild_id)
					.channels.resolve(ev.d.channel_id) as TextChannel,
				author: client.users.resolve(ev.d.member.user.id)
			},
			cmd
		);

	let data = ev.d;
	data.guild = await client.guilds.fetch(data.guild_id);
	data.channel = data.guild.channels.resolve(data.channel_id) as TextChannel;
	data.member = new GuildMember(client, data.member, data.guild);
	delete data.guild_id;
	delete data.channel_id;

	//* Run the command
	cmd.run(ev.d as InteractionResponse, await perms);
};

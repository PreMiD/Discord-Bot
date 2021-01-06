import { MessageEmbed, MessageEmbedOptions } from "discord.js";

export default class UniformEmbed extends MessageEmbed {
	constructor(
		data: MessageEmbed | MessageEmbedOptions,
		title?: string,
		color = "7289DA"
	) {
		if (title) data.title = title;
		data.color = color;
		super(data);
	}
}

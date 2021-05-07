import { Message } from "discord.js";

import { pmdDB } from "../../../database/client";
import UniformEmbed from "../../../util/UniformEmbed";

const coll = pmdDB.collection("crowdin");
module.exports.run = async (
	message: Message,
	params: string[],
	permLevel: number
) => {
	console.log(message.content, params.join(","), permLevel);
};

module.exports.config = {
	name: "crowdinUser",
	description: "Yes"
};

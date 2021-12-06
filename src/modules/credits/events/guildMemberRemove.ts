import { GuildMember } from "discord.js";

import { pmdDB } from "../../..";
import { Credits } from "../../../../@types/interfaces";

export default async function (member: GuildMember) {
	await pmdDB.collection<Credits>("credits").deleteOne({ userId: member.id });
}

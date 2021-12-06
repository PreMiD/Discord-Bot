import { GuildMember } from "discord.js";

import { pmdDB } from "../../..";
import { AlphaUsers, BetaUsers } from "../../../../@types/interfaces";

export default async function (member: GuildMember) {
	await Promise.all([
		pmdDB.collection<BetaUsers>("betaUsers").deleteOne({ userId: member.id }),
		pmdDB.collection<AlphaUsers>("alphaUsers").deleteOne({ userId: member.id })
	]);
}

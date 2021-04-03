import axios from "axios";
import { Collection, GuildMember } from "discord.js";

import { client } from "../..";
import { pmdDB } from "../../database/client";
import roles from "../../roles";

setInterval(updateTranslators, 60 * 1000);
updateTranslators();

const langNames: Collection<string, string> = new Collection();

async function updateTranslators() {
	(
		await axios("https://api.crowdin.com/api/v2/languages?limit=500")
	).data.data.forEach(d => langNames.set(d.data.id, d.data.name));

	const coll = pmdDB.collection("crowdin"),
		guild = await client.guilds.cache.first().fetch(),
		users = await coll
			.find(
				{ user: { $exists: true }, code: { $exists: false } },
				{ projection: { _id: false } }
			)
			.toArray(),
		crowdinMembers = await fetchMembers(),
		translatorsNotInDB = (
			await guild.roles.fetch(roles.translator)
		).members.filter(m => !users.find(u => u.userId === m.id));

	for (const member of translatorsNotInDB.array())
		await removeAllTranslatorRoles(member);

	for (const user of users) {
		const crowdinUser = crowdinMembers.find(u => u.data.id === user.user.id)
			?.data;

		if (!crowdinUser) continue;

		let discordUser: GuildMember;
		try {
			discordUser = await guild.members.fetch(user.userId);
		} catch (err) {
			await coll.deleteOne({ userId: user.userId });
			continue;
		}
		coll.updateOne({ userId: user.userId }, { $set: { user: crowdinUser } })

		if (!discordUser.roles.cache.has(roles.translator))
			await discordUser.roles.add(roles.translator);

		if (!crowdinUser.permissions) continue;

		const proofreaderIn = Object.keys(crowdinUser.permissions).filter(
			(role, index) =>
				Object.values(crowdinUser.permissions)[index] === "proofreader"
		);

		if (proofreaderIn.length > 0) {
			if (!discordUser.roles.cache.has(roles.proofreader))
				await discordUser.roles.add(roles.proofreader);
		} else {
			if (discordUser.roles.cache.has(roles.proofreader))
				await discordUser.roles.remove(roles.proofreader);

			for (const langName of langNames.values())
				if (discordUser.roles.cache.has(langName))
					await discordUser.roles.remove(langName);
		}

		const rolesCache = (await guild.roles.fetch()).cache;
		for (const proofreader of proofreaderIn) {
			let role = rolesCache.find(r => r.name === langNames.get(proofreader));

			if (!role)
				role = await guild.roles.create({
					data: {
						permissions: [],
						name: langNames.get(proofreader),
						mentionable: false
					}
				});

			if (!discordUser.roles.cache.has(role.id))
				await discordUser.roles.add(role);
		}
	}
}

export async function removeAllTranslatorRoles(member: GuildMember) {
	const langRoles = member.guild.roles.cache
		.array()
		.filter(r => langNames.find(ln => ln === r.name));

	const rolesToRemove = member.roles.cache.filter(
		r =>
			typeof langRoles
				.concat(
					member.guild.roles.resolve(roles.translator),
					member.guild.roles.resolve(roles.proofreader)
				)
				.find(r1 => r1.id === r.id) !== "undefined"
	);

	await member.roles.remove(rolesToRemove);
}

async function fetchMembers() {
	let moreThan500 = true,
		members = [];

	while (moreThan500) {
		const m = (
			await axios(
				`https://api.crowdin.com/api/v2/projects/369101/members?limit=500&offset=${members.length}`,
				{
					headers: { Authorization: `Bearer ${process.env.CROWDINTOKEN}` }
				}
			)
		).data.data;

		members = members.concat(m);

		moreThan500 = m.length === 500;
	}

	return members;
}

import { client } from "../.."
import creditRoles from "./creditRoles";

const creditsColl = client.db.collection("credits"),
    userSettingsColl = client.db.collection("userSettings");

export const updateCredits = async () => {
    const settings = await userSettingsColl.find({}).toArray(),
        creditRolesValues = Object.values(creditRoles);

    let creditUsers = client.guilds.cache.get(client.config.main_guild).members.cache;
    creditUsers.sweep(m => {
        const s = settings.find(s => s.userId === m.id);
        if(typeof s !== "undefined" && !s.showContributor) return true;
        else return !creditRolesValues.some(c => m.roles.cache.has(c));
    });

    let credits = creditUsers.map(m => {
        const highestRole = m.roles.cache.get(containsAny(Object.values(creditRoles), m.roles.cache.keyArray())[0]),
            colorRole = m.roles.cache
                .filter(x => x.hexColor !== "#000000")
                .sort((a, b) => a.position - b.position)
				.map(x => x)
				.reverse()[0],
            staff = ["656913616100130816", "672175812102979605"]
            .map(x => m.roles.cache.map(x => x.id).includes(x))
            .includes(true);

        return {
            userId: m.id,
            name: m.user.username,
            tag: m.user.discriminator,
            avatar: m.user.displayAvatarURL({
                format: "png",
                dynamic: true
            }),
            premium_since: m.premiumSince ? m.premiumSinceTimestamp : undefined,
            role: highestRole.name,
            roleId: highestRole.id,
            roles: m.roles.cache.filter(r => r.name !== "@everyone").map(r => r.name),
            roleIds: m.roles.cache.filter(r => r.name !== "@everyone").map(r => r.id),
            roleColor: staff ? colorRole.hexColor : highestRole.hexColor,
            rolePosition: highestRole.position,
            status: m.user.presence.status
        };
    })

    let arr = credits.map(cU => {
        return {
            updateOne: {
                filter: { userId: cU.userId },
                update: { $set: cU },
                upsert: true
            }
        };
    })

    if(arr.length > 0) await creditsColl.bulkWrite(arr);

	const dbCredits = await creditsColl.find({}, { projection: { _id: false, userId: true } }).toArray(),
		usersToRemove = dbCredits.filter(mC => !credits.find(cU => cU.userId === mC.userId));

	if (usersToRemove.length > 0)
		await creditsColl.bulkWrite(
			usersToRemove.map(uTR => {
				return { deleteOne: { filter: { userId: uTR.userId } } };
			})
		);
}

export const updateFlags = async () => {
	let flagUsers = [];

	await Promise.all(
		client.guilds.cache
			.first()
			.roles.cache.filter(r => Object.values(creditRoles).includes(r.id))
			.map(async r => {
				const memberArray = r.members.array();
				for (let i = 0; i < r.members.size; i++) {
					const member = memberArray[i], userFlags = (await member.user.fetchFlags()).toArray();

					if (!flagUsers.find(cU => cU.userId === member.id))
						flagUsers.push({ userId: member.id, flags: userFlags.length > 0 ? userFlags : undefined });
				}
			})
	);

	creditsColl.bulkWrite(
		flagUsers.map(cU => {
			return {
				updateOne: {
					filter: { userId: cU.userId },
					update: {
						$set: cU
					},
					upsert: true
				}
			};
		})
	);
}


function containsAny(source: Array<string>, target: Array<string>) {
	return source.filter(item => target.indexOf(item) > -1);
}
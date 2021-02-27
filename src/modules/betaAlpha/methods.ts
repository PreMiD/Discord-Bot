import { client } from "../..";


const betaUserColl = client.db.collection("betaUsers"),
    discordUsers = client.db.collection("discordUsers");

export const updateDiscordUsers = async () => {
    const members = await client.guilds.cache
        .get(client.config.main_guild).members
        .fetch({ limit: 0 });

	discordUsers.bulkWrite(
		members.map(user => {
			return {
				updateOne: {
					filter: { userId: user.id },
					update: {
						$set: {
							userId: user.id,
							created: user.user.createdTimestamp,
							username: user.user.username,
							discriminator: user.user.discriminator,
							avatar: user.user.displayAvatarURL(),
                            flags: user.user.flags.toArray()
						}
					},
					upsert: true
				}
			};
		})
	);
}

export const updateBetaUsers = async () => {
    const betaUsers = await betaUserColl
		.find({}, { projection: { _id: false } })
		.toArray(),
        members = (await client.guilds.cache
            .get(client.config.main_guild).members
            .fetch({ limit: 0 }))
            .filter(
                m => (m.roles.cache.has(client.config.roles.booster)
                    || betaUsers.find(b => b.userId === m.user.id))
                    && !m.roles.cache.has(client.config.roles.alpha)
                    && !m.roles.cache.has(client.config.roles.beta)
            );
    
    for (let i = 0; i < members.size; i++)
		await members.array()[i].roles.add(client.config.roles.beta);
}
export default {
    name: "ready",
    type: "client",
    run: (client) => {
        const roles = client.config.roles,
            col = client.db.collection("presences");


        client.success(`Connected as ${client.user.tag}`);
        client.user.setActivity(`premid.app`);

        require("../modules/status/");

        updatePresenceAuthors();
        updateBoosters();
        setInterval(() => {
            updatePresenceAuthors();
            updateBoosters();
        }, 15 * 60 * 1000)

        async function updatePresenceAuthors() {
            const guild = client.guilds.cache.get("493130730549805057"),
                presences = await col.find().toArray(),
                presenceDevelopers = presences.map(p => p.metadata.author.id);
        
            presenceDevelopers.concat(
                presences
                    .filter(p => p.metadata.contributors)
                    .map(p => p.metadata.contributors.map(x => x.id))
                    .join()
                    .split(",")
            );

            for (const author of presenceDevelopers) {
                const member = guild.members.resolve(author);
                if (member && !member.roles.cache.has(roles.presence))
                    member.roles.add(roles.presence);
            }
        }

        function updateBoosters() {
            const dateNow = new Date(),
                last90days = new Date(
                    dateNow.setDate(dateNow.getDate() - 3 * 30)
                ).getTime(),
                membersWithBoost = client.guilds.cache
                    .get("493130730549805057")
                    .members.cache.array()
                    .filter(member => member.premiumSinceTimestamp > 0);

            for (const member of membersWithBoost) {
                if (member) {
                    const userBoost = member.premiumSinceTimestamp;

                    if (last90days > userBoost) {
                        if (!member.roles.cache.has(roles.donator))
                            member.roles.add(roles.donator);
                        if (!member.roles.cache.has(roles.alpha)) {
                            if (member.roles.cache.has(roles.beta))
                                member.roles.remove(roles.beta);
                            member.roles.add(roles.alpha);
                        }
                    }
                }
            }
        }
    }
}
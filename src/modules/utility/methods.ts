import axios from "axios";
import { Collection } from "discord.js";
import { client } from "../..";

let langNames = new Collection<string, string>();

export const updateTranslators = async() => {
    let coll = client.db.collection("crowdin"),
        guild = await client.guilds.cache.get(client.config.main_guild).fetch(),
        users = await coll.find(
            { user: { $exists: true }, code: { $exists: false }},
            { projection: { _id: false }}
        ).toArray(),
        crowdinMembers = await fetchMembers(),
        translatorsNotInDB = (await guild.roles.fetch(client.config.roles.translator)).members.filter(m => !users.find(u => u.userId == m.id)).array();

    (await axios("https://api.crowdin.com/api/v2/languages?limit=500")).data.data.forEach(d => langNames.set(d.data.id, d.data.name));

    for(const member of translatorsNotInDB) await removeAllTranslatorRoles(member);

    for(const user of users) {
        let crowdinUser = crowdinMembers.find(u => u.data.id == user.user.id);

        if(!crowdinUser) return;

        let discordUser;
        try {
			discordUser = await guild.members.fetch(user.userId);
		} catch {
			await coll.findOneAndDelete({ userId: user.userId });
			continue;
		}

        if(!discordUser.roles.cache.has(client.config.roles.translator)) await discordUser.roles.add(client.config.roles.translator);
        if(!crowdinUser.permissions) continue;

        let proofreaderIn = Object.keys(crowdinUser.permissions).filter((_, index) => Object.values(crowdinUser.permissions)[index] === "proofreader"),
            rolesCache = (await guild.roles.fetch()).cache;

		if(proofreaderIn.length > 0) 
            if(!discordUser.roles.cache.has(client.config.roles.proofreader)) await discordUser.roles.add(client.config.roles.proofreader);
		else if(discordUser.roles.cache.has(client.config.roles.proofreader)) await discordUser.roles.remove(client.config.roles.proofreader);
			for(const langName of langNames.values())
				if (discordUser.roles.cache.has(langName)) await discordUser.roles.remove(langName);

        for(const proofreader of proofreaderIn) {
            let role = rolesCache.find(r => r.name == langNames.get(proofreader));

            if(!role) role = await guild.roles.create({
                data: {
                    permissions: [],
                    name: langNames.get(proofreader),
                    mentionable: false
                }
            });

            if(!discordUser.roles.cache.has(role.id)) await discordUser.roles.add(role.id);
        }
    }

    async function fetchMembers() {
        let moreThan500 = true, members = [];
        
        while(moreThan500) {
            let m = (await axios(`https://api.crowdin.com/api/v2/projects/369101/members?limit=500&offset=${members.length}`, {
                headers: {
                    Authorization: `Bearer ${process.env.CROWDINTOKEN}`
                }
            })).data.data;

            members = members.concat(m);
            moreThan500 = m.length == 500;
        }

        return members;
    }
}

async function removeAllTranslatorRoles(member) {
    let langRoles = member.guild.roles.cache.array().filter(r => langNames.find(ln => ln === r.name)),
        rolesToRemove = member.roles.cache.filter(r =>
            typeof langRoles
                .concat(member.guild.roles.resolve(client.config.roles.translator), member.guild.roles.resolve(client.config.roles.proofreader))
                .find(r1 => r1.id === r.id) !== "undefined"
        );

    await member.roles.remove(rolesToRemove);
}

export {removeAllTranslatorRoles};